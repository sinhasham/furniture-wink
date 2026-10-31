import { el } from './dom.js';
import { formatINR } from './format.js';
import { getCategory } from './products.js';

export function productCard(p) {
  const href = `/product.html?id=${encodeURIComponent(p.id)}`;
  return el('article', { class: 'card' },
    el('a', { href, 'aria-label': p.name }, el('img', { class: 'card__img', src: p.image, alt: p.name, width: 640, height: 480, loading: 'lazy' })),
    el('h3', {}, el('a', { href, class: 'plain' }, p.name)),
    el('p', { class: 'meta' }, getCategory(p.category).name),
    el('p', { class: 'price' }, `From ${formatINR(p.fromPrice)}`, el('span', { class: 'gst' }, ' incl. GST')),
    el('p', { class: 'meta' }, `Estimated delivery: ${p.leadTimeDays} days${p.images.length > 1 ? ` · ${p.images.length} photos` : ''}`),
    el('a', { class: 'btn btn--ghost', href }, 'View details'));
}
