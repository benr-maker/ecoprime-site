export async function onRequestPost(context) {
  const { price, name, address } = await context.request.json();
  const key = context.env.STRIPE_SECRET_KEY;

  if (!key) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = new URLSearchParams({
    amount: String(Math.round(price * 100)),
    currency: 'usd',
    'automatic_payment_methods[enabled]': 'true',
    description: `EcoPrime lawn service – ${address}`,
    'metadata[customer_name]': name,
    'metadata[address]': address,
  });

  const res = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const intent = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: intent.error?.message }), {
      status: 502, headers: { 'Content-Type': 'application/json' },
    });
  }

  return Response.json({ clientSecret: intent.client_secret });
}
