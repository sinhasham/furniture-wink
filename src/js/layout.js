import { $, el } from './dom.js';
import { createCart } from './store.js';
import { CONFIG } from './config.js';
import { mountSale } from './sale.js';

export const cart = createCart();
const NAV = [['Home', '/index.html', 'home'], ['Shop', '/shop.html', 'shop'], ['Order', '/booking.html', 'booking'], ['About', '/about.html', 'about']];

export function mountLayout(page) {
  const badge = el('span', { class: 'badge', 'aria-hidden': 'true' }, String(cart.count()));
  const cartLink = el('a', { class: 'cartlink', href: '/cart.html', 'aria-label': 'Cart' }, 'Cart ', badge);
  const nav = el('nav', { class: 'nav', id: 'nav', 'aria-label': 'Main' },
    NAV.map(([t, h, k]) => el('a', { href: h, 'aria-current': k === page ? 'page' : null }, t)),
    el('a', { href: '/login.html', 'aria-current': page === 'login' ? 'page' : null }, 'Log in'),
    cartLink);
  const btn = el('button', { class: 'menu-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'nav' }, 'Menu');
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  $('#site-header').append(el('div', { class: 'wrap topbar' }, el('a', { class: 'brand brand--stack', href: '/index.html' }, el('img', { class: 'brand__logo', src: '/images/logo.png', alt: CONFIG.brand, width: 176, height: 48 }), el('span', { class: 'brand__unit' }, CONFIG.legalLine)), btn, nav));
  mountSale();
  cart.subscribe(() => { badge.textContent = String(cart.count()); });

  $('#site-footer').append(el('div', { class: 'wrap footer' },
    el('p', { class: 'brand' }, CONFIG.brand),
    el('p', { class: 'meta' }, CONFIG.legalLine, CONFIG.gstNumber ? ` · GST No: ${CONFIG.gstNumber}` : ''),
    el('p', {}, 'Made to order. ', CONFIG.deliveryNote),
    el('p', { class: 'footer__links' },
      el('a', { href: `tel:+${CONFIG.phone}` }, 'Call to visit the factory'), ' · ',
      el('a', { href: `https://wa.me/${CONFIG.whatsappNumber}`, target: '_blank' }, 'Chat on WhatsApp'), ' · ',
      el('a', { href: CONFIG.channelUrl, target: '_blank' }, 'WhatsApp channel'), ' · ',
      el('a', { href: CONFIG.instagramUrl, target: '_blank' }, 'Instagram')),
    el('p', { class: 'meta' }, CONFIG.address)));
}
