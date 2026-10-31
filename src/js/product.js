import { $, el, clear } from './dom.js';
import { getProduct, getCategory, listProducts, COLOURS, FABRICS, unitPrice } from './products.js';
import { formatINR, formatCm } from './format.js';
import { CONFIG } from './config.js';
import { cart } from './layout.js';
import { productCard } from './card.js';
import { cartLink } from './whatsapp.js';

export function init() {
  const root = $('#product');
  const params = new URLSearchParams(location.search);
  const p = getProduct(params.get('id'));
  if (!p) {
    root.append(el('h1', {}, 'Product not found'), el('p', {}, 'This design is not in the catalogue.'), el('a', { class: 'btn', href: '/shop.html' }, 'Browse the shop'));
    return;
  }
  document.title = `${p.name} | ${CONFIG.brand}`;
  // colour and fabric from a shared link are checked against the catalogue
  const sel = {
    color: p.colours.includes(params.get('color')) ? params.get('color') : p.colours[0],
    fabric: p.fabrics.includes(params.get('fabric')) ? params.get('fabric') : p.fabrics[0],
    qty: 1,
  };
  const upholstered = p.fabrics[0] !== 'none' && p.fabrics.includes('velvet');
  const price = el('p', { class: 'price price--big' });
  const status = el('p', { class: 'status', role: 'status', 'aria-live': 'polite' });
  const colourName = el('span', {});
  const swatchBoxes = [];
  const fabricSel = el('select', { id: 'p-fabric' }, p.fabrics.map((f) => el('option', { value: f, selected: f === sel.fabric }, FABRICS[f].priceDelta ? `${FABRICS[f].name} (+${formatINR(FABRICS[f].priceDelta)})` : FABRICS[f].name)));
  const chips = el('div', { class: 'chips' });
  const waBtn = el('a', { class: 'btn btn--wa', href: '#', target: '_blank' }, 'Order on WhatsApp');
  let viewer = null;

  const apply = () => {
    colourName.textContent = COLOURS[sel.color].name;
    price.textContent = formatINR(unitPrice({ id: p.id, ...sel }) * sel.qty);
    status.textContent = '';
    fabricSel.value = sel.fabric;
    swatchBoxes.forEach(draw);
    clear(chips);
    if (p.fabrics[0] !== 'none') p.fabrics.forEach((f) => {
      const b = el('button', { class: 'chip', type: 'button', 'aria-pressed': String(f === sel.fabric) }, FABRICS[f].name);
      b.addEventListener('click', () => set({ fabric: f })); chips.append(b);
    });
    waBtn.setAttribute('href', cartLink([{ id: p.id, color: sel.color, fabric: sel.fabric, qty: sel.qty }]));
    viewer?.update(sel);
  };
  const set = (part) => { Object.assign(sel, part); apply(); };
  function draw(box) {
    clear(box);
    p.colours.forEach((id) => {
      const b = el('button', { class: 'swatch', type: 'button', 'aria-label': COLOURS[id].name, 'aria-pressed': String(id === sel.color) });
      b.style.setProperty('--c', COLOURS[id].hex);
      b.addEventListener('click', () => set({ color: id })); box.append(b);
    });
  }
  const pageSwatches = el('div', { class: 'swatches' }); swatchBoxes.push(pageSwatches);
  fabricSel.addEventListener('change', () => set({ fabric: fabricSel.value }));
  const qty = el('select', { id: 'p-qty' }, Array.from({ length: CONFIG.maxQtyPerItem }, (_, i) => el('option', { value: i + 1 }, String(i + 1))));
  qty.addEventListener('change', () => set({ qty: Number(qty.value) }));
  const add = el('button', { class: 'btn', type: 'button' }, 'Add to cart');
  add.addEventListener('click', () => {
    status.textContent = cart.add({ id: p.id, color: sel.color, fabric: sel.fabric, qty: sel.qty }) ? 'Added to your cart.' : 'Could not add this item. Your cart may be full.';
  });
  const f = (label, id, ...c) => el('div', { class: 'field' }, el('label', { for: id }, label), ...c);

  /* viewer: Wink's real photo first. The 3D view loads only when asked, so pages stay fast on phones. */
  const poster = el('img', { class: 'viewer__poster', src: p.image, alt: `${p.name}, photo by Wink`, width: 720, height: 540 });
  const stage = el('div', { class: 'viewer__stage' }, poster);
  const viewerBox = el('div', { class: 'viewer' }, stage);
  const bar = el('div', { class: 'viewer__bar', role: 'toolbar', 'aria-label': 'Photo and 3D view controls' });
  const loading = el('p', { class: 'viewer__note', role: 'status', hidden: true }, 'Loading 3D view…');
  const share = vbtn('Share');
  const view3d = vbtn('View in 3D', true);
  bar.append(view3d, share);
  viewerBox.append(loading, bar);
  const note = el('p', { class: 'meta' }, 'This is a photo of Wink\'s own work. The 3D view is a simple model of the general shape and size, not the exact carving.');

  share.addEventListener('click', async () => {
    const u = new URL(location.href); u.search = '';
    u.searchParams.set('id', p.id); u.searchParams.set('color', sel.color); if (sel.fabric !== 'none') u.searchParams.set('fabric', sel.fabric);
    try {
      if (navigator.share) await navigator.share({ title: p.name, url: u.href });
      else { await navigator.clipboard.writeText(u.href); status.textContent = 'Link copied. It opens this design in your chosen finish.'; }
    } catch { /* cancelled or blocked: nothing to do */ }
  });

  root.append(el('div', { class: 'pdp' }, el('div', {}, viewerBox, note),
    el('div', {},
      el('p', { class: 'meta' }, getCategory(p.category).name), el('h1', {}, p.name), el('p', {}, p.summary),
      el('p', { class: 'meta' }, `Size ${formatCm(p.dims)} · Made to order in about ${p.leadTimeDays} days`),
      el('p', { class: 'label' }, upholstered ? 'Colour: ' : 'Finish: ', colourName), pageSwatches,
      p.fabrics[0] !== 'none' ? f(p.fabrics.includes('velvet') ? 'Fabric' : 'Seat fabric', 'p-fabric', fabricSel) : null,
      f('Quantity', 'p-qty', qty), price,
      el('div', { class: 'actions' }, add, waBtn, el('a', { class: 'btn btn--ghost', href: '/cart.html' }, 'View cart')), status,
      el('p', { class: 'meta' }, 'Colour and fabric changes show in the 3D view. The photo always shows the original piece.'),
      el('p', { class: 'notice' }, CONFIG.sampleLabel))));
  apply();

  /* 3D: loaded on first tap, with the photo as the fallback */
  let loaded = false, showing3d = false, extras = null;
  const setView = (on) => {
    showing3d = on;
    stage.querySelector('canvas')?.toggleAttribute('hidden', !on);
    viewer?.setPaused(!on);
    view3d.setAttribute('aria-pressed', String(on)); view3d.textContent = on ? 'Show photo' : 'View in 3D';
    extras?.forEach((b) => { b.hidden = !on; });
    if (!on) { tray.hidden = true; }
  };
  const tray = el('div', { class: 'viewer__tray', hidden: true });
  async function load3d() {
    loading.hidden = false; view3d.disabled = true;
    try {
      const [{ buildModel }, { createViewer }] = await Promise.all([import('./models.js'), import('./viewer.js')]);
      viewer = createViewer(stage, buildModel(p, sel), p.dims);
      viewer.update(sel); stage.dataset.ready = '1'; loaded = true;
      const trayColours = el('div', { class: 'swatches' }); swatchBoxes.push(trayColours); draw(trayColours);
      tray.append(el('p', { class: 'label' }, upholstered ? 'Colour' : 'Finish'), trayColours, p.fabrics[0] !== 'none' ? [el('p', { class: 'label' }, 'Fabric'), chips] : null);
      const colours = vbtn('Colours', true), dim = vbtn('Dimension', true), spin = vbtn('360', true), full = vbtn('Full view', true);
      colours.addEventListener('click', () => { tray.hidden = !tray.hidden; colours.setAttribute('aria-pressed', String(!tray.hidden)); });
      dim.addEventListener('click', () => { const on = dim.getAttribute('aria-pressed') !== 'true'; dim.setAttribute('aria-pressed', String(on)); viewer.setDimensions(on); });
      spin.addEventListener('click', () => { const on = spin.getAttribute('aria-pressed') !== 'true'; spin.setAttribute('aria-pressed', String(on)); viewer.setSpin(on); });
      let fallbackFull = false;
      const setFull = (on) => { viewerBox.classList.toggle('viewer--full', on && fallbackFull); full.setAttribute('aria-pressed', String(on)); full.textContent = on ? 'Exit full view' : 'Full view'; viewer.setFull(on); };
      full.addEventListener('click', async () => {
        const on = full.getAttribute('aria-pressed') !== 'true';
        if (on && viewerBox.requestFullscreen) { try { await viewerBox.requestFullscreen(); return; } catch { /* fall through to in-page full view */ } }
        if (!on && document.fullscreenElement) { await document.exitFullscreen(); return; }
        fallbackFull = true; setFull(on);
      });
      document.addEventListener('fullscreenchange', () => { fallbackFull = false; setFull(document.fullscreenElement === viewerBox); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && fallbackFull && viewerBox.classList.contains('viewer--full')) setFull(false); });
      extras = [colours, dim, spin, full];
      bar.insertBefore(tray, null); viewerBox.insertBefore(tray, bar);
      extras.forEach((b) => bar.insertBefore(b, share));
      loading.hidden = true; view3d.disabled = false;
      apply(); setView(true);
    } catch {
      loading.textContent = '3D view is not available on this device. The photo is shown instead.';
      view3d.hidden = true;
    }
  }
  view3d.addEventListener('click', () => { if (!loaded) load3d(); else setView(!showing3d); });
  if (params.get('view') === '3d') load3d();

  const more = listProducts({ category: p.category }).filter((x) => x.id !== p.id).slice(0, 3);
  if (more.length) { const g = $('#related'); more.forEach((x) => g.append(productCard(x))); } else $('#related-wrap').hidden = true;
}

function vbtn(label, toggle = false) {
  return el('button', { class: 'vbtn', type: 'button', 'aria-pressed': toggle ? 'false' : null }, label);
}
