import test from 'node:test';
import assert from 'node:assert/strict';
import { getProduct, unitPrice, optionsText } from '../src/js/products.js';
import { validateCartLine } from '../src/js/validate.js';
import { createCart } from '../src/js/store.js';

const memory = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };

test('GST: 5,000 on big items, 3,000 on small ones, already inside the price', () => {
  const bed = getProduct('bed-01'), chair = getProduct('chair-01');
  assert.equal(bed.price, 70000 + 5000);
  assert.equal(chair.price, 5500 + 3000);
  assert.equal(unitPrice({ id: 'chair-01', color: 'teak', fabric: 'cotton' }), 8500);
});

test('bed size changes the price, relative to the design default', () => {
  const base = { id: 'bed-01', color: 'teak', fabric: 'none' }; // queen, no counter
  assert.equal(unitPrice({ ...base, size: 'queen' }), 75000);
  assert.equal(unitPrice({ ...base, size: 'king' }), 83000);
  assert.equal(unitPrice({ ...base, size: 'single' }), 61000);
  assert.equal(unitPrice({ ...base, size: 'huge' }), null);
  assert.equal(unitPrice({ id: 'bed-02', color: 'teak', fabric: 'none' }), 75000); // king is default there
  assert.equal(unitPrice({ id: 'bed-02', color: 'teak', fabric: 'none', size: 'queen' }), 67000);
});

test('counter changes the price; designs that show a counter already include it', () => {
  const noCounter = { id: 'bed-01', color: 'teak', fabric: 'none' };
  assert.equal(unitPrice({ ...noCounter, counter: 'with' }), 75000 + 6000);
  const shown = { id: 'bed-05', color: 'teak', fabric: 'none' };
  assert.equal(getProduct('bed-05').defaultCounter, 'with');
  assert.equal(unitPrice({ ...shown, counter: 'without' }), unitPrice(shown) - 6000);
  assert.equal(unitPrice({ ...noCounter, counter: 'maybe' }), null);
});

test('sizes and counter are refused on designs that do not have them', () => {
  assert.equal(unitPrice({ id: 'sofa-01', color: 'olive', fabric: 'cotton', size: 'king' }), null);
  assert.equal(unitPrice({ id: 'chair-01', color: 'teak', fabric: 'cotton', size: 'small' }), null);
  assert.equal(unitPrice({ id: 'chair-01', color: 'teak', fabric: 'cotton', counter: 'with' }), null);
});

test('old cart lines without size or counter still work and get defaults', () => {
  const line = validateCartLine({ id: 'bed-01', color: 'teak', fabric: 'none', qty: 1 });
  assert.deepEqual(line, { id: 'bed-01', color: 'teak', fabric: 'none', size: 'queen', counter: 'without', qty: 1 });
  assert.equal(optionsText(line), 'Queen (5 x 6.5 ft), Without counter');
});

test('cart keeps different sizes of the same bed as separate lines', () => {
  const c = createCart(memory());
  c.add({ id: 'bed-01', color: 'teak', fabric: 'none', size: 'queen', counter: 'without' });
  c.add({ id: 'bed-01', color: 'teak', fabric: 'none', size: 'king', counter: 'without' });
  c.add({ id: 'bed-01', color: 'teak', fabric: 'none', size: 'king', counter: 'without' });
  assert.equal(c.lines().length, 2);
  assert.equal(c.total(), 75000 + 2 * 83000);
});

test('multi-angle products: bed-09 and sofa-08 have more than one photo', () => {
  assert.equal(getProduct('bed-09').images.length, 2);
  assert.equal(getProduct('sofa-08').images.length, 3);
  assert.equal(getProduct('sofa-06').inspiration, true);
});

test('every size has its own dimensions and price (like Flipkart size chips)', () => {
  const sofa = getProduct('sofa-01'); // 3 seater by default, 5,000 GST
  assert.deepEqual(sofa.sizes.map((x) => x.id), ['seat2', 'seat3', 'seat4']);
  const price = (size) => unitPrice({ id: 'sofa-01', color: 'olive', fabric: 'cotton', size });
  assert.equal(price('seat3'), 53000);
  assert.equal(price('seat2'), 38000);
  assert.equal(price('seat4'), 67000);
  assert.equal(sofa.sizes[2].dims.w, 250);
  assert.equal(sofa.sizes[1].dims.w, 215); // the default size keeps the design's own width
});

test('smaller and larger versions of panels, tables and sideboards scale size and price', () => {
  const t = getProduct('table-01');
  assert.equal(t.defaultSize, 'standard');
  const at = (size) => unitPrice({ id: 'table-01', color: 'teak', fabric: 'none', size });
  assert.equal(at('standard'), 33000);
  assert.equal(at('small'), 33000 - 5600);
  assert.equal(at('large'), 33000 + 8400);
  assert.equal(t.sizes.find((x) => x.id === 'large').dims.w, Math.round(110 * 1.25));
  assert.equal(t.fromPrice, at('small'));
});
