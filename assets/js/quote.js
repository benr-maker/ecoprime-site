(function () {
  // Stub pricing — returns a fixed price without a server call.
  // Replace getQuotePrice() with a real fetch('/api/quote', ...) call
  // once the pricing API is ready.
  function getQuotePrice(_address) {
    return Promise.resolve(45.00);
  }

  document.querySelectorAll('[data-quote-form]').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn    = form.querySelector('[type=submit]');
      var errMsg = form.querySelector('[data-quote-error]');
      var name    = (form.querySelector('[name=name]')    || {}).value || '';
      var phone   = (form.querySelector('[name=phone]')   || {}).value || '';
      var address = (form.querySelector('[name=address]') || {}).value || '';

      btn.disabled = true;
      btn.textContent = 'Getting your quote…';
      if (errMsg) errMsg.hidden = true;

      try {
        var price = await getQuotePrice(address.trim());
        var params = new URLSearchParams({
          name:    name.trim(),
          phone:   phone.trim(),
          address: address.trim(),
          price:   price,
        });
        window.location.href = 'estimate.html?' + params.toString();
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Get My Instant Quote';
        if (errMsg) errMsg.hidden = false;
      }
    });
  });
})();
