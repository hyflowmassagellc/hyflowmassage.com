/* HyFlow Massage — Google Analytics + Google Ads conversion tracking.
   Loads the Google tag on pages that don't have it yet, and records an
   Ads "Contact" conversion when a visitor clicks a Book, call, text,
   email or WeChat/WhatsApp link. */
(function () {
  var GA_ID = 'G-4X55KK41VB';
  var ADS_ID = 'AW-18235170342';
  var CONTACT_CONVERSION = 'AW-18235170342/TP5tCP2jhsUcEKa8mvdD';

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }
  if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }
  gtag('config', ADS_ID);

  function kindOf(href) {
    if (!href) return null;
    if (/squareup\.com\/appointments|book\.squareup\.com/i.test(href)) return 'book_online';
    if (/^tel:/i.test(href)) return 'phone_call';
    if (/^sms:/i.test(href)) return 'text_message';
    if (/^mailto:/i.test(href)) return 'email';
    if (/wa\.me|whatsapp/i.test(href)) return 'whatsapp';
    if (/^weixin:/i.test(href)) return 'wechat';
    return null;
  }

  var lastSent = 0;
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var kind = kindOf(a.getAttribute('href'));
    if (!kind) return;
    var now = Date.now();
    if (now - lastSent < 1500) return; // ignore double clicks
    lastSent = now;
    try {
      gtag('event', 'conversion', { send_to: CONTACT_CONVERSION, transport_type: 'beacon' });
      gtag('event', 'generate_lead', { method: kind, page_path: location.pathname, transport_type: 'beacon' });
    } catch (err) { /* never block the click */ }
  }, true);
})();
