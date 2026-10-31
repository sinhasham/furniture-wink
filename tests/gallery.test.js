import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GALLERY, GALLERY_CATEGORIES } from '../src/js/gallery-data.js';
import { cartLink } from '../src/js/whatsapp.js';
import { PRODUCTS, CATEGORIES } from '../src/js/products.js';
import { CONFIG } from '../src/js/config.js';

test('gallery: refs are unique, photos exist, categories are valid, alt text is set', () => {
  assert.ok(GALLERY.length >= 57);
  assert.equal(new Set(GALLERY.map((x) => x.ref)).size, GALLERY.length);
  const cats = new Set(GALLERY_CATEGORIES.map((c) => c.id));
  for (const x of GALLERY) {
    assert.ok(cats.has(x.cat), x.ref);
    assert.ok(x.alt.length > 8, x.ref);
    for (const img of x.images) assert.ok(existsSync(new URL(`../public${img}`, import.meta.url)), `${img} file missing`);
  }
  for (const c of cats) assert.ok(GALLERY.some((x) => x.cat === c), `empty category ${c}`);
});

test('config: WhatsApp number is a real Indian number and the ask link uses it', () => {
  assert.match(CONFIG.whatsappNumber, /^91[6-9]\d{9}$/);
  assert.equal(CONFIG.whatsappIsSample, false);
  const url = new URL(cartLink([{ id: 'bed-01', color: 'teak', fabric: 'none', qty: 1 }]));
  assert.equal(url.origin + url.pathname, `https://wa.me/${CONFIG.whatsappNumber}`);
  assert.ok(url.searchParams.get('text').includes('bed-01'));
  assert.match(url.searchParams.get('text'), /75,000/);
  assert.ok(CONFIG.channelUrl.startsWith('https://whatsapp.com/channel/'));
});

test('config: factory visit phone is a valid Indian number', () => {
  assert.match(CONFIG.phone, /^91[6-9]\d{9}$/);
  assert.ok(CONFIG.address.includes('800020'));
});

test('shop shows exactly Wink\'s photos: one product per photo, real image, valid 3D spec', () => {
  assert.equal(PRODUCTS.length, GALLERY.length);
  const cats = new Set(CATEGORIES.map((c) => c.id));
  for (const p of PRODUCTS) {
    assert.ok(cats.has(p.category), p.id);
    assert.match(p.image, /^\/images\/gallery\/[a-z]+-\d+\.jpg$/, p.id);
    assert.equal(p.images[0], p.image, p.id);
    assert.equal(p.leadTimeDays, 15, p.id);
    assert.ok(p.gst === 3000 || p.gst === 5000, p.id);
    assert.ok(p.dims.w > 0 && p.dims.d > 0 && p.dims.h > 0 && p.price > 0, p.id);
  }
});

test('the site never prints a phone number (numbers only inside tel: and wa.me links)', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  const files = [...readdirSync(new URL('../src/js/', import.meta.url)).map((f) => `src/js/${f}`), 'index.html', 'about.html', 'booking.html', 'cart.html', 'shop.html'];
  for (const f of files) {
    const text = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    assert.ok(!/(\+91|91)?[\s-]?[6-9]\d{4}[\s-]?\d{5}/.test(text.replace(/(tel:\+?|wa\.me\/)\d+/g, '').replace(/'(91)?[6-9]\d{9}'/g, '')), `${f} shows a phone number`);
  }
});
