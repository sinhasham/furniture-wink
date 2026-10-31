// Photos are Wink's own work. Names, prices and sizes are PLACEHOLDERS until Wink sends the real catalogue.
// This file is the single source of truth for prices: browser and server both import it.
// Prices are whole rupees (INR).

export const COLOURS = Object.freeze({
  ivory:    { id: 'ivory',    name: 'Ivory',    hex: '#F1ECE2' },
  beige:    { id: 'beige',    name: 'Beige',    hex: '#D8CBB6' },
  walnut:   { id: 'walnut',   name: 'Walnut',   hex: '#604A39' },
  olive:    { id: 'olive',    name: 'Olive',    hex: '#77775F' },
  charcoal: { id: 'charcoal', name: 'Charcoal', hex: '#3A3A34' },
  teak:     { id: 'teak',     name: 'Teak',     hex: '#9A6B3F' },
});

// priceDelta is added per unit on top of the product base price.
export const FABRICS = Object.freeze({
  cotton:  { id: 'cotton',  name: 'Cotton blend',   priceDelta: 0 },
  linen:   { id: 'linen',   name: 'Linen',          priceDelta: 2500 },
  velvet:  { id: 'velvet',  name: 'Velvet',         priceDelta: 4000 },
  leather: { id: 'leather', name: 'Faux leather',   priceDelta: 6000 },
  none:    { id: 'none',    name: 'Wood finish',    priceDelta: 0 },
});

import { GALLERY } from './gallery-data.js';

export const CATEGORIES = Object.freeze([
  { id: 'beds',    name: 'Beds' },
  { id: 'sofas',   name: 'Sofa sets' },
  { id: 'dining',  name: 'Dining' },
  { id: 'chairs',  name: 'Chairs' },
  { id: 'storage', name: 'Wardrobes and storage' },
  { id: 'tables',  name: 'Dressing and tables' },
  { id: 'doors',   name: 'Doors' },
  { id: 'panels',  name: 'Carved panels' },
]);

const UPH = ['ivory', 'beige', 'olive', 'charcoal', 'walnut'];
const WOOD = ['teak', 'walnut', 'charcoal', 'ivory'];
const UPH_FAB = ['cotton', 'linen', 'velvet', 'leather'];

// Per design: [3D model used, size in cm, placeholder price, colours, fabrics, lead time].
// The 3D model is the nearest simple shape, not the exact carving in the photo.
const K = { w: 195, d: 215, h: 110 }, Q = { w: 170, d: 210, h: 105 };
const bed = (dims, price) => ['bed-' + (dims === K ? 'king' : 'queen'), dims, price, WOOD, ['none'], 28];
const chair = (price) => ['chair-dining', { w: 45, d: 52, h: 88 }, price, WOOD, ['cotton', 'linen'], 21];
const door = (price) => ['door', { w: 90, d: 5, h: 210 }, price, WOOD, ['none'], 25];
const SPEC = {
  'bed-01': bed(Q, 44000), 'bed-02': bed(K, 58000), 'bed-03': bed(K, 56000), 'bed-04': bed(K, 60000), 'bed-05': bed(Q, 48000), 'bed-06': bed(K, 64000),
  'bed-07': bed(Q, 42000), 'bed-08': bed(Q, 40000), 'bed-09': bed(K, 46000), 'bed-10': bed(Q, 38000), 'bed-11': bed(Q, 41000), 'bed-12': bed(K, 52000),
  'sofa-01': ['sofa-aria-3', { w: 215, d: 92, h: 84 }, 48000, UPH, UPH_FAB, 21],
  'sofa-02': ['sofa-aria-3', { w: 190, d: 80, h: 95 }, 42000, UPH, UPH_FAB, 21],
  'sofa-03': ['sofa-aria-3', { w: 200, d: 85, h: 90 }, 45000, UPH, UPH_FAB, 21],
  'sofa-04': ['sofa-aria-3', { w: 220, d: 95, h: 75 }, 52000, UPH, UPH_FAB, 28],
  'dining-01': ['dining-6', { w: 180, d: 90, h: 76 }, 52000, WOOD, ['none'], 28],
  'dining-02': ['dining-6', { w: 150, d: 90, h: 76 }, 46000, WOOD, ['none'], 28],
  'dining-03': ['dining-6', { w: 200, d: 100, h: 76 }, 58000, WOOD, ['none'], 28],
  'chair-01': chair(5500), 'chair-02': chair(5500), 'chair-03': chair(4800),
  'chair-04': ['chair-lounge', { w: 76, d: 80, h: 95 }, 16500, UPH, UPH_FAB, 21],
  'storage-01': ['wardrobe-3d', { w: 120, d: 55, h: 200 }, 42000, WOOD, ['none'], 30],
  'storage-02': ['wardrobe-3d', { w: 100, d: 55, h: 200 }, 38000, WOOD, ['none'], 30],
  'storage-03': ['wardrobe-3d', { w: 180, d: 55, h: 210 }, 62000, WOOD, ['none'], 30],
  'storage-04': ['sideboard', { w: 160, d: 42, h: 80 }, 28500, WOOD, ['none'], 21],
  'table-01': ['table-study', { w: 110, d: 45, h: 76 }, 14500, WOOD, ['none'], 21],
  'table-02': ['table-side', { w: 40, d: 40, h: 45 }, 3800, WOOD, ['none'], 14],
  'door-01': door(18000), 'door-02': door(16000), 'door-03': door(20000), 'door-04': door(22000), 'door-05': door(21000), 'door-06': door(19000),
  'panel-01': ['frame-jaali', { w: 150, d: 4, h: 70 }, 12000, WOOD, ['none'], 35],
  'panel-02': ['frame-lotus', { w: 80, d: 4, h: 80 }, 9500, WOOD, ['none'], 35],
  'panel-03': ['frame-jaali', { w: 150, d: 4, h: 65 }, 11000, WOOD, ['none'], 35],
  'panel-04': ['frame-jaali', { w: 60, d: 4, h: 30 }, 3500, WOOD, ['none'], 21],
};

export const PRODUCTS = Object.freeze(GALLERY.map((g) => {
  const [model, dims, price, colours, fabrics, leadTimeDays] = SPEC[g.ref];
  return Object.freeze({
    id: g.ref, name: g.alt, category: g.cat, price, colours, fabrics, dims, leadTimeDays, model,
    summary: `Design ${g.ref}, made to order in Wink's Patna factory. Size, finish and final price are confirmed on WhatsApp.`,
    image: g.src, // Wink's own photo
    isSample: true, // price and size are placeholders
  });
}));

const BY_ID = new Map(PRODUCTS.map((x) => [x.id, x]));

export const getProduct = (id) => (typeof id === 'string' ? BY_ID.get(id) ?? null : null);
export const getCategory = (id) => CATEGORIES.find((c) => c.id === id) ?? null;

export const listProducts = ({ category, maxPrice, query } = {}) =>
  PRODUCTS.filter((x) =>
    (!category || x.category === category) &&
    (maxPrice == null || x.price <= maxPrice) &&
    (!query || x.name.toLowerCase().includes(String(query).toLowerCase())));

/** Unit price for a validated {id, color, fabric}. Returns null if anything is not in the catalogue. */
export function unitPrice({ id, color, fabric }) {
  const prod = getProduct(id);
  if (!prod || !prod.colours.includes(color) || !prod.fabrics.includes(fabric)) return null;
  return prod.price + FABRICS[fabric].priceDelta;
}
