async function getPayPalToken(clientId, clientSecret) {
  const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

export async function onRequestPost(context) {
  const { orderID } = await context.request.json();
  const clientId     = context.env.PAYPAL_CLIENT_ID;
  const clientSecret = context.env.PAYPAL_CLIENT_SECRET;

  const token = await getPayPalToken(clientId, clientSecret);

  const res = await fetch(
    `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const capture = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: capture.message }), {
      status: 502, headers: { 'Content-Type': 'application/json' },
    });
  }

  return Response.json({ status: capture.status, payer: capture.payer });
}
