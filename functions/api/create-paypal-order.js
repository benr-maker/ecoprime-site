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
  const { price, name, address } = await context.request.json();
  const clientId     = context.env.PAYPAL_CLIENT_ID;
  const clientSecret = context.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(JSON.stringify({ error: 'PayPal not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = await getPayPalToken(clientId, clientSecret);

  const res = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: price.toFixed(2),
        },
        description: `EcoPrime lawn service – ${address}`,
        custom_id: name,
      }],
    }),
  });

  const order = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: order.message }), {
      status: 502, headers: { 'Content-Type': 'application/json' },
    });
  }

  return Response.json({ orderID: order.id });
}
