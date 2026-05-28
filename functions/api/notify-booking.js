export async function onRequestPost(context) {
  const { name, phone, email, address, price, notify } = await context.request.json();
  const resendKey  = context.env.RESEND_API_KEY;
  const twilioSid  = context.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = context.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = context.env.TWILIO_PHONE_NUMBER;

  const sends = [];

  const sendEmail = notify === 'email' || notify === 'both';
  const sendText  = notify === 'text'  || notify === 'both';

  if (sendEmail && resendKey) {
    const ownerEmail = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'EcoPrime Lawn Care <bookings@ecoprimelawncare.com>',
        to: ['ecoprime@earthlink.net'],
        subject: `New Booking — ${name} at ${address}`,
        html: `<h2>New Booking Received</h2>
               <p><strong>Name:</strong> ${name}</p>
               <p><strong>Phone:</strong> ${phone}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Address:</strong> ${address}</p>
               <p><strong>Price:</strong> $${parseFloat(price).toFixed(2)} / visit</p>`,
      }),
    });

    const customerEmail = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'EcoPrime Lawn Care <bookings@ecoprimelawncare.com>',
        to: [email],
        subject: 'Your EcoPrime Lawn Care Booking is Confirmed',
        html: `<h2>You're booked, ${name}!</h2>
               <p>Thank you for choosing EcoPrime Lawn Care.</p>
               <p><strong>Service address:</strong> ${address}</p>
               <p><strong>Price:</strong> $${parseFloat(price).toFixed(2)} per visit</p>
               <p>We'll be in touch shortly to confirm your first service date.</p>
               <p>Questions? Call or text us at <a href="tel:12816246514">281-624-6514</a>.</p>`,
      }),
    });

    sends.push(ownerEmail, customerEmail);
  }

  if (sendText && twilioSid && twilioAuth && twilioFrom) {
    const toNumber = phone.replace(/\D/g, '');
    const formattedTo = toNumber.startsWith('1') ? `+${toNumber}` : `+1${toNumber}`;

    const ownerSms = fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(twilioSid + ':' + twilioAuth)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: twilioFrom,
        To: '+12816246514',
        Body: `New EcoPrime booking!\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nPrice: $${parseFloat(price).toFixed(2)}/visit`,
      }),
    });

    const customerSms = fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(twilioSid + ':' + twilioAuth)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: twilioFrom,
        To: formattedTo,
        Body: `Hi ${name}, your EcoPrime Lawn Care booking is confirmed!\nAddress: ${address}\nPrice: $${parseFloat(price).toFixed(2)}/visit\nQuestions? Call/text 281-624-6514`,
      }),
    });

    sends.push(ownerSms, customerSms);
  }

  await Promise.allSettled(sends);
  return Response.json({ ok: true });
}
