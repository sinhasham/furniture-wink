import { $, el, clear } from './dom.js';
import { cart } from './layout.js';
import { validateBooking } from './validate.js';
import { orderLink } from './whatsapp.js';
import { formatINR } from './format.js';
import { CONFIG } from './config.js';

const TEXT = [['name', 'Full name', 'text', 'name'], ['phone', 'Mobile number', 'tel', 'tel'], ['email', 'Email (optional)', 'email', 'email'],
  ['pincode', 'Pincode', 'text', 'postal-code'], ['city', 'City or town', 'text', 'address-level2']];

const wrap = (id, label, input) => el('div', { class: 'field', id: `w-${id}` }, el('label', { for: id }, label), input, el('span', { class: 'err', id: `err-${id}`, 'aria-live': 'polite' }));

export function init() {
  const root = $('#booking');
  const kind0 = 'order'; // factory visits are by phone call, so this form is for orders only
  const radio = (v, t) => el('label', { class: 'radio' }, el('input', { type: 'radio', name: 'kind', value: v, checked: v === kind0 }), t);
  const date = el('input', { id: 'date', name: 'date', type: 'date' });
  const t = new Date(); const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  date.setAttribute('min', iso(t)); t.setDate(t.getDate() + 90); date.setAttribute('max', iso(t));
  const consent = el('input', { type: 'checkbox', id: 'whatsappConsent', name: 'whatsappConsent' });
  const submit = el('button', { class: 'btn', type: 'submit' }, 'Review request');
  const summary = el('div', { id: 'summary' });
  const result = el('div', { id: 'result', role: 'status', 'aria-live': 'polite' });
  const form = el('form', { novalidate: true, id: 'bform' },
    el('fieldset', { class: 'kinds' }, el('legend', {}, 'What would you like to do?'), radio('order', 'Place an order'), el('span', { class: 'err', id: 'err-kind' })),
    ...TEXT.map(([id, label, type, ac]) => wrap(id, label, el('input', { id, name: id, type, autocomplete: ac, maxlength: 80, inputmode: id === 'phone' ? 'tel' : id === 'pincode' ? 'numeric' : null }))),
    el('p', { class: 'notice' }, CONFIG.deliveryNote, ' To visit the factory, ', el('a', { href: `tel:+${CONFIG.phone}` }, 'tap here to call'), '.'),
    wrap('address', 'Full address', el('textarea', { id: 'address', name: 'address', rows: 3, maxlength: 200, autocomplete: 'street-address' })),
    wrap('date', 'Preferred visit date', date),
    wrap('note', 'Note (optional)', el('textarea', { id: 'note', name: 'note', rows: 3, maxlength: 500 })),
    el('div', { class: 'field' }, el('label', { class: 'radio', for: 'whatsappConsent' }, consent, 'Send me order updates on WhatsApp. I can reply STOP at any time.')),
    el('span', { class: 'err', id: 'err-items', 'aria-live': 'polite' }), submit);

  function drawSummary() {
    clear(summary);
    const isOrder = form.elements.kind.value === 'order';
    $('#w-date').hidden = isOrder;
    if (!isOrder) return;
    const lines = cart.detailed();
    if (!lines.length) { summary.append(el('p', { class: 'notice' }, 'Your cart is empty. ', el('a', { href: '/shop.html' }, 'Add a product first.'))); return; }
    summary.append(el('h2', {}, 'Your items'), el('ul', { class: 'mini' }, lines.map((l) => el('li', {}, `${l.product.name}, ${l.colourName} × ${l.qty}`, el('span', {}, formatINR(l.subtotal))))),
      el('p', { class: 'total' }, 'Total incl. GST, before delivery: ', el('strong', {}, formatINR(cart.total()))));
  }
  form.addEventListener('change', drawSummary);
  cart.subscribe(drawSummary);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clear(result);
    form.querySelectorAll('.err').forEach((n) => { n.textContent = ''; });
    const d = Object.fromEntries(new FormData(form));
    const r = validateBooking({ ...d, whatsappConsent: consent.checked, items: d.kind === 'order' ? cart.lines() : [] });
    if (!r.ok) {
      Object.entries(r.errors).forEach(([k, m]) => { const n = $(`#err-${k}`); if (n) n.textContent = m; });
      const first = Object.keys(r.errors)[0];
      ($(`#${first}`) ?? $('#err-items'))?.focus?.();
      return;
    }
    result.append(el('h2', {}, 'Almost done'),
      el('p', {}, 'Your details look good. This request is not saved on our server yet. Tap the button to send it to us on WhatsApp, then we will confirm price, delivery and next steps.'),
      el('a', { class: 'btn', href: orderLink(r.value), target: '_blank' }, 'Send on WhatsApp'),
      CONFIG.whatsappIsSample ? el('p', { class: 'notice' }, 'Demo: the WhatsApp number is a placeholder until Wink adds the real one.') : null,
      el('p', { class: 'meta' }, 'Online payment is not connected yet. You pay only after we confirm your order.'));
    result.scrollIntoView({ block: 'center' });
  });
  root.append(el('div', { class: 'bgrid' }, el('div', {}, form), el('aside', {}, summary, result)));
  drawSummary();
}
