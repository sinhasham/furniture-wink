import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, unitPrice, listProducts } from '../src/js/products.js';
import { validateBooking, validateCartLine, normalisePhone, cartTotal } from '../src/js/validate.js';
import { createCart } from '../src/js/store.js';
import { formatINR } from '../src/js/format.js';

const memory = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };
const NOW = new Date('2026-10-21T10:00:00');
const good = {
  name: 'Ravi Kumar', phone: '+91 98765 43210', pincode: '800001', city: 'Patna',
  address: '12 Boring Road, Patna', kind: 'order',
  items: [{ id: 'sofa-01', color: 'olive', fabric: 'linen', qty: 1 }],
};

test('catalogue: every product has valid colours, fabrics and a positive price', () => {
  assert.equal(PRODUCTS.length, 57);
  for (const p of PRODUCTS) {
    assert.ok(p.price > 0 && p.colours.length && p.fabrics.length && p.isSample === true, p.id);
    assert.ok(unitPrice({ id: p.id, color: p.colours[0], fabric: p.fabrics[0] }) >= p.price);
  }
  assert.equal(new Set(PRODUCTS.map((p) => p.id)).size, 57);
});

test('price comes from catalogue, fabric adds delta, bad combos return null', () => {
  // 48,000 base + 5,000 GST + 2,500 linen
  assert.equal(unitPrice({ id: 'sofa-01', color: 'olive', fabric: 'linen' }), 55500);
  assert.equal(unitPrice({ id: 'sofa-01', color: 'pink', fabric: 'linen' }), null);
  assert.equal(unitPrice({ id: 'nope', color: 'olive', fabric: 'linen' }), null);
});

test('cart line drops client-sent price and extra fields', () => {
  const line = validateCartLine({ id: 'sofa-01', color: 'olive', fabric: 'cotton', qty: 2, price: 1, evil: '<img>' });
  assert.deepEqual(line, { id: 'sofa-01', color: 'olive', fabric: 'cotton', size: 'seat3', counter: null, qty: 2 });
  assert.equal(validateCartLine({ id: 'sofa-01', color: 'olive', fabric: 'cotton', qty: 999 }), null);
  assert.equal(validateCartLine({ id: 'sofa-01', color: 'olive', fabric: 'cotton', qty: 1.5 }), null);
});

test('phone normalisation', () => {
  assert.equal(normalisePhone('+91 98765-43210'), '9876543210');
  assert.equal(normalisePhone('09876543210'), '9876543210');
  assert.equal(normalisePhone('1234567890'), null);
  assert.equal(normalisePhone('98765'), null);
});

test('booking: valid order passes and consent defaults to false', () => {
  const r = validateBooking(good, NOW);
  assert.equal(r.ok, true);
  assert.equal(r.value.phone, '9876543210');
  assert.equal(r.value.whatsappConsent, false);
  assert.equal(validateBooking({ ...good, whatsappConsent: 'true' }, NOW).value.whatsappConsent, false);
  assert.equal(validateBooking({ ...good, whatsappConsent: true }, NOW).value.whatsappConsent, true);
});

test('booking: rejects bad input with field errors', () => {
  const r = validateBooking({ ...good, name: '<script>', pincode: '12', phone: '123', items: [] }, NOW);
  assert.equal(r.ok, false);
  for (const k of ['name', 'pincode', 'phone', 'items']) assert.ok(r.errors[k], k);
  assert.equal(validateBooking({ ...good, items: [{ id: 'sofa-01', color: 'x', fabric: 'cotton', qty: 1 }] }, NOW).ok, false);
});

test('booking: visit needs a date within 90 days', () => {
  const v = { ...good, kind: 'visit', items: [] };
  assert.ok(validateBooking(v, NOW).errors.date);
  assert.ok(validateBooking({ ...v, date: '2026-10-01' }, NOW).errors.date);
  assert.ok(validateBooking({ ...v, date: '2027-03-01' }, NOW).errors.date);
  assert.equal(validateBooking({ ...v, date: '2026-11-05' }, NOW).ok, true);
});

test('cart store: merges lines, caps qty, survives tampered storage', () => {
  const s = memory();
  const cart = createCart(s);
  const item = { id: 'chair-04', color: 'beige', fabric: 'velvet' };
  assert.ok(cart.add(item)); assert.ok(cart.add(item));
  assert.equal(cart.count(), 2);
  assert.equal(cart.total(), (7400 + 3000 + 4000) * 2);
  assert.equal(cart.add({ id: 'nope', color: 'x', fabric: 'y' }), false);
  assert.deepEqual(Object.keys(JSON.parse(s.getItem('wink.cart.v1'))[0]).sort(), ['color', 'counter', 'fabric', 'id', 'qty', 'size']);
  s.setItem('wink.cart.v1', JSON.stringify([{ id: 'chair-04', color: 'beige', fabric: 'velvet', qty: 1, price: 1 }, { id: 'bad' }]));
  assert.equal(createCart(s).count(), 0);
  s.setItem('wink.cart.v1', '{not json');
  assert.equal(createCart(s).count(), 0);
});

test('filters and INR formatting', () => {
  assert.equal(listProducts({ category: 'sofas' }).length, 8);
  assert.ok(listProducts({ maxPrice: 10000 }).every((p) => p.price <= 10000));
  assert.match(formatINR(48000), /48,000/);
  assert.equal(cartTotal([]), 0);
});

test('every product has a local image path', () => {
  for (const p of PRODUCTS) assert.match(p.image, /^\/images\/gallery\/[a-z]+-\d+\.jpg$/, p.id);
});

import { orderMessage, orderLink } from '../src/js/whatsapp.js';
import { validateAuth } from '../src/js/validate.js';

test('whatsapp message: totals from catalogue, consent line only when opted in, link is encoded', () => {
  const v = validateBooking({ ...good, note: 'Call after 5pm & bring catalogue', whatsappConsent: true }, NOW).value;
  const msg = orderMessage(v);
  assert.match(msg, /Wooden sofa set with a three-seater and armchairs, Olive, Linen, 3 seater x 1 = .*55,500/);
  assert.match(msg, /STOP/);
  assert.doesNotMatch(orderMessage({ ...v, whatsappConsent: false }), /STOP/);
  const link = orderLink(v);
  assert.ok(link.startsWith('https://wa.me/') && !link.includes(' ') && !link.includes('\n'));
});

test('auth format validation', () => {
  assert.equal(validateAuth({ email: 'a@b.in', password: 'longenough1' }).ok, true);
  assert.ok(validateAuth({ email: 'bad', password: 'short' }).errors.email);
  assert.ok(validateAuth({ email: 'a@b.in', password: 'longenough1', name: 'Ravi Kumar', confirm: 'nope' }, 'signup').errors.confirm);
});
