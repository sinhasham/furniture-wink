import { $, el, clear } from './dom.js';
import { cart } from './layout.js';
import { formatINR } from './format.js';
import { CONFIG } from './config.js';
import { cartLink } from './whatsapp.js';

export function init() {
  const root = $('#cart');
  function render() {
    clear(root);
    const lines = cart.detailed();
    if (!lines.length) {
      root.append(el('p', {}, 'Your cart is empty.'), el('a', { class: 'btn', href: '/shop.html' }, 'Browse the shop'));
      return;
    }
    const list = el('ul', { class: 'lines' });
    lines.forEach((l) => {
      const key = { id: l.id, color: l.color, fabric: l.fabric };
      const minus = el('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'aria-label': `Remove one ${l.product.name}` }, '−');
      const plus = el('button', { class: 'btn btn--ghost btn--sm', type: 'button', 'aria-label': `Add one ${l.product.name}` }, '+');
      const del = el('button', { class: 'btn btn--ghost btn--sm', type: 'button' }, 'Remove');
      minus.addEventListener('click', () => { cart.setQty(key, l.qty - 1); render(); });
      plus.addEventListener('click', () => { cart.setQty(key, l.qty + 1); render(); });
      del.addEventListener('click', () => { cart.remove(key); render(); });
      list.append(el('li', { class: 'line' },
        el('img', { src: l.product.image, alt: '', width: 720, height: 540 }),
        el('div', {}, el('h3', {}, el('a', { class: 'plain', href: `/product.html?id=${l.id}` }, l.product.name)),
          el('p', { class: 'meta' }, `${l.colourName}${l.fabric === 'none' ? '' : ` · ${l.fabricName}`} · ${formatINR(l.unit)} each`),
          el('div', { class: 'qty' }, minus, el('span', { 'aria-live': 'polite' }, `${l.qty}`), plus, del)),
        el('p', { class: 'price' }, formatINR(l.subtotal))));
    });
    root.append(list,
      el('p', { class: 'total' }, 'Total before delivery: ', el('strong', {}, formatINR(cart.total()))),
      el('p', { class: 'meta' }, 'Delivery charge is confirmed for your pincode. Final price is confirmed when we accept your order.'),
      el('div', { class: 'actions' }, el('a', { class: 'btn', href: cartLink(cart.lines()), target: '_blank' }, 'Order on WhatsApp'), el('a', { class: 'btn btn--ghost', href: '/booking.html?kind=order' }, 'Fill the order form'), el('a', { class: 'btn btn--ghost', href: '/shop.html' }, 'Keep shopping')),
      el('p', { class: 'meta' }, 'Order on WhatsApp opens a message with your items. You tap Send, and we confirm everything there.'),
      el('p', { class: 'notice' }, `${CONFIG.sampleLabel} Online payment is not connected yet.`));
  }
  render();
}
