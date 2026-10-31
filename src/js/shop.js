import { $, el, clear } from './dom.js';
import { PRODUCTS, CATEGORIES, listProducts } from './products.js';
import { productCard } from './card.js';
import { formatINR } from './format.js';

const MAX = Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)) / 1000) * 1000;
const SORTS = { featured: 'Featured', low: 'Price: low to high', high: 'Price: high to low', name: 'Name' };

export function init() {
  const q0 = new URLSearchParams(location.search);
  const state = {
    q: (q0.get('q') ?? '').slice(0, 60),
    cat: CATEGORIES.some((c) => c.id === q0.get('cat')) ? q0.get('cat') : '',
    max: Math.min(MAX, Math.max(0, parseInt(q0.get('max') ?? MAX, 10) || MAX)),
    sort: SORTS[q0.get('sort')] ? q0.get('sort') : 'featured',
  };
  const q = el('input', { id: 'f-q', type: 'search', placeholder: 'Search sofa, bed, table', maxlength: 60, value: state.q });
  const cat = el('select', { id: 'f-cat' }, el('option', { value: '' }, 'All categories'),
    CATEGORIES.map((c) => el('option', { value: c.id, selected: c.id === state.cat }, c.name)));
  const max = el('input', { id: 'f-max', type: 'range', min: 0, max: MAX, step: 1000, value: state.max });
  const maxOut = el('output', { for: 'f-max' }, '');
  const sort = el('select', { id: 'f-sort' }, Object.entries(SORTS).map(([v, t]) => el('option', { value: v, selected: v === state.sort }, t)));
  const reset = el('button', { class: 'btn btn--ghost', type: 'button' }, 'Reset filters');
  const field = (label, id, ...c) => el('div', { class: 'field' }, el('label', { for: id }, label), ...c);
  $('#filters').append(field('Search', 'f-q', q), field('Category', 'f-cat', cat),
    field('Maximum price', 'f-max', max, maxOut), field('Sort by', 'f-sort', sort), reset);

  const grid = $('#results'), count = $('#count');
  function render() {
    state.q = q.value.trim(); state.cat = cat.value; state.max = Number(max.value); state.sort = sort.value;
    maxOut.textContent = state.max >= MAX ? 'Any price' : `Up to ${formatINR(state.max)}`;
    let list = listProducts({ category: state.cat, maxPrice: state.max >= MAX ? undefined : state.max, query: state.q });
    if (state.sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    clear(grid);
    list.forEach((p) => grid.append(productCard(p)));
    count.textContent = list.length ? `${list.length} ${list.length === 1 ? 'design' : 'designs'}` : 'No designs match. Try a higher price or clear the search.';
    const sp = new URLSearchParams();
    if (state.q) sp.set('q', state.q); if (state.cat) sp.set('cat', state.cat);
    if (state.max < MAX) sp.set('max', state.max); if (state.sort !== 'featured') sp.set('sort', state.sort);
    history.replaceState(null, '', sp.size ? `?${sp}` : location.pathname);
  }
  [q, cat, max, sort].forEach((n) => n.addEventListener('input', render));
  reset.addEventListener('click', () => { q.value = ''; cat.value = ''; max.value = MAX; sort.value = 'featured'; render(); });
  render();
}
