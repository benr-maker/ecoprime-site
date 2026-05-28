var STRIPE_PK = 'pk_test_51TUudQRew1gCXHq7arYxLYvD5KJaYNmf6yfTTMfCX3utQ5dEV1meCMsGliPVRU0ppfsqS46fRSQrIUaQ1Z7DlYrK00eLd1pdC1';

(function () {
  var p       = new URLSearchParams(location.search);
  var price   = parseFloat(p.get('price')   || '0');
  var name    = p.get('name')    || '';
  var address = p.get('address') || '';

  if (!price || !address) {
    window.location.href = 'index.html#quote';
    return;
  }

  document.getElementById('pay-summary').innerHTML =
    '<strong>Name:</strong> '    + name    + '<br>' +
    '<strong>Address:</strong> ' + address + '<br>' +
    '<strong>Price:</strong> $'  + price.toFixed(2) + ' per visit';

  document.getElementById('back-link').href =
    'estimate.html?' + new URLSearchParams({ name: name, address: address, price: price });

  var stripe   = Stripe(STRIPE_PK);
  var elements;

  fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price: price, name: name, address: address }),
  })
  .then(function (r) { return r.json(); })
  .then(function (data) {
    if (data.error) { showError(data.error); return; }

    elements = stripe.elements({ clientSecret: data.clientSecret });
    elements.create('payment').mount('#payment-element');

    document.getElementById('pay-loading').style.display = 'none';
    document.getElementById('stripe-form').style.display = 'block';
  })
  .catch(function () {
    showError('Could not load payment form. Please try again or call us at 281-624-6514.');
  });

  document.getElementById('stripe-form').addEventListener('submit', function (e) {
    e.preventDefault();
    setSubmitting(true);

    var returnUrl = window.location.origin + '/thank-you.html?' +
      new URLSearchParams({ name: name, address: address, price: price, method: 'card' });

    stripe.confirmPayment({ elements: elements, confirmParams: { return_url: returnUrl } })
      .then(function (result) {
        if (result.error) {
          showError(result.error.message);
          setSubmitting(false);
        }
      });
  });

  function showError(msg) {
    var el = document.getElementById('pay-error');
    el.textContent = msg;
    el.style.display = 'block';
  }

  function setSubmitting(on) {
    var btn = document.getElementById('submit-btn');
    btn.disabled = on;
    btn.textContent = on ? 'Processing…' : 'Pay Now';
  }
})();
