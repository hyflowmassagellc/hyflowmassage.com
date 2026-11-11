/* HyFlow Massage — inquiry form sender.
   Sends form fields to booking@hyflowmassage.com through FormSubmit
   (https://formsubmit.co). The visitor never needs an email program.
   Success is only shown when the message was really accepted; otherwise
   the visitor sees a clear fallback (call / text / email). */
(function () {
  var ENDPOINT = 'https://formsubmit.co/ajax/booking@hyflowmassage.com';
  var CONTACT_CONVERSION = 'AW-18235170342/TP5tCP2jhsUcEKa8mvdD';

  function track() {
    try {
      if (typeof window.gtag === 'function') {
        gtag('event', 'conversion', { send_to: CONTACT_CONVERSION });
        gtag('event', 'generate_lead', { method: 'inquiry_form', page_path: location.pathname });
      }
    } catch (e) { /* ignore */ }
  }

  /* fields: plain object of label -> value. Returns a Promise<boolean>. */
  window.hyflowSendInquiry = function (subject, fields, replyTo) {
    var data = {};
    Object.keys(fields).forEach(function (k) { data[k] = fields[k] || '—'; });
    data._subject = subject;
    data._template = 'table';
    data._captcha = 'false';
    data['Page'] = location.href;
    if (replyTo) data._replyto = replyTo;
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) {
      var ok = r.ok && (j.success === true || j.success === 'true');
      if (ok) track();
      return ok;
    }); }).catch(function () { return false; });
  };

  /* Builds the fallback message shown when sending fails. */
  window.hyflowInquiryFallbackHTML = function (subject, fields) {
    var body = Object.keys(fields).map(function (k) { return k + ': ' + (fields[k] || '—'); }).join('\n');
    var mail = 'mailto:booking@hyflowmassage.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    return '<strong>Sorry — your inquiry could not be sent automatically.</strong><br>' +
      'Please reach us directly and we will reply within 1 business day: ' +
      '<a href="sms:4086686562" style="color:inherit;text-decoration:underline">text (408) 668-6562</a>, ' +
      '<a href="tel:4086686562" style="color:inherit;text-decoration:underline">call</a>, or ' +
      '<a href="' + mail + '" style="color:inherit;text-decoration:underline">email booking@hyflowmassage.com</a>.';
  };

  /* Generic handler for <form data-inquiry="Subject prefix"> elements. */
  function wire(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('[name="_honey"]') && form.querySelector('[name="_honey"]').value) return;
      var fields = {};
      var replyTo = '';
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.name.charAt(0) === '_' || el.type === 'submit') return;
        fields[el.getAttribute('data-label') || el.name] = (el.value || '').trim();
        if (el.type === 'email') replyTo = el.value.trim();
      });
      var org = fields['Company'] || fields['Organization'] || '';
      var subject = (form.getAttribute('data-inquiry') || 'Website Inquiry') + (org ? ' | ' + org : '');
      var btn = form.querySelector('[type="submit"]');
      var status = form.querySelector('.inq-status');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }
      window.hyflowSendInquiry(subject, fields, replyTo).then(function (ok) {
        if (ok) {
          form.innerHTML = '<div class="inq-ok" role="status" style="padding:28px 8px;text-align:center;line-height:1.8">' +
            '<div style="font-size:1.6rem;margin-bottom:8px">✓</div><strong>Thank you — your inquiry was sent.</strong><br>' +
            'We will reply within 1 business day. For anything urgent, text <a href="sms:4086686562" style="color:inherit">(408) 668-6562</a>.</div>';
        } else {
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
          if (status) { status.innerHTML = window.hyflowInquiryFallbackHTML(subject, fields); status.style.display = 'block'; }
        }
      });
    });
  }
  function init() { Array.prototype.forEach.call(document.querySelectorAll('form[data-inquiry]'), wire); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
