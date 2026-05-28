export async function onRequestPost(context) {
  const { name, phone, address } = await context.request.json();

  const price = await getQuotePrice(address);

  return Response.json({ name, phone, address, price });
}

// Dummy pricing — replace with real parcel/satellite API call
async function getQuotePrice(_address) {
  return 45.00;
}
