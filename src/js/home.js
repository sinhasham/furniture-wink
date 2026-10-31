import { $, el } from './dom.js';
import { PRODUCTS, CATEGORIES, getProduct } from './products.js';
import { productCard } from './card.js';

const FEATURED = ['bed-03', 'sofa-01', 'dining-01', 'storage-01', 'door-01', 'chair-01'];

export function init() {
  const cats = $('#home-cats');
  CATEGORIES.forEach((c) => {
    const list = PRODUCTS.filter((p) => p.category === c.id);
    cats.append(el('a', { class: 'cat', href: `/shop.html?cat=${c.id}` },
      el('img', { src: list[0].image, alt: list[0].name, width: 720, height: 540, loading: 'lazy' }),
      el('span', { class: 'cat__name' }, c.name), el('span', { class: 'meta' }, `${list.length} ${list.length === 1 ? 'design' : 'designs'}`)));
  });
  const feat = $('#home-featured');
  FEATURED.map(getProduct).filter(Boolean).forEach((p) => feat.append(productCard(p)));
}
