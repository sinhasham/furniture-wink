// Diwali sale pop-up. Text comes from CONFIG.sale. Shown once per browser session.
import { el } from './dom.js';
import { CONFIG } from './config.js';

const KEY = 'wink-sale-seen';
const seen = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } };
const remember = () => { try { sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked: fine */ } };

export function mountSale() {
  const s = CONFIG.sale;
  if (!s?.enabled || seen()) return;
  const opener = document.activeElement;
  const link = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(s.ctaMessage)}`;
  const closeBtn = el('button', { class: 'sale__x', type: 'button', 'aria-label': 'Close' }, '×');
  const later = el('button', { class: 'btn btn--ghost', type: 'button' }, s.close);
  const cta = el('a', { class: 'btn', href: link, target: '_blank' }, s.cta);
  const box = el('div', { class: 'sale__box', role: 'dialog', 'aria-modal': 'true', 'aria-label': s.title, tabindex: '-1' },
    closeBtn,
    el('p', { class: 'sale__badge' }, s.badge),
    el('h2', { class: 'sale__title' }, s.title),
    el('p', { class: 'sale__text' }, s.text),
    el('p', { class: 'meta' }, s.detail),
    el('div', { class: 'actions' }, cta, later));
  const overlay = el('div', { class: 'sale' }, box);

  const close = () => {
    remember();
    overlay.remove();
    document.removeEventListener('keydown', onKey);
    if (opener && opener.focus) opener.focus();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = [closeBtn, cta, later];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  };
  closeBtn.addEventListener('click', close);
  later.addEventListener('click', close);
  cta.addEventListener('click', remember);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  setTimeout(() => {
    document.body.append(overlay);
    document.addEventListener('keydown', onKey);
    box.focus();
  }, s.delayMs ?? 1200);
}
