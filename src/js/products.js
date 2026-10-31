// Photos are Wink's own work. Names, prices and sizes are PLACEHOLDERS until Wink sends the real catalogue.
// This file is the single source of truth for prices: browser and server both import it.
// Prices are whole rupees (INR). The price shown to customers INCLUDES GST (see gstFor below).
import { CONFIG } from './config.js';
import { GALLERY } from './gallery-data.js';

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

/* ---- GST -------------------------------------------------------------
 * GST is added on top of every product's base price below.
 * Rule: base price of 20,000 or more gets 5,000, anything smaller gets 3,000.
 * To set GST for one design, add it to GST_OVERRIDE, e.g. { 'bed-01': 4000 }.
 */
export const GST_BIG = 5000;
export const GST_SMALL = 3000;
export const GST_LIMIT = 20000;
export const GST_OVERRIDE = Object.freeze({});
export const gstFor = (id, base) => GST_OVERRIDE[id] ?? (base >= GST_LIMIT ? GST_BIG : GST_SMALL);

/* ---- Sizes and counter -------------------------------------------------
 * rate = placeholder price for that size. A product's default size keeps the base price,
 * the other sizes add or subtract the difference between the two rates. Edit the rates here.
 */
const SIZE_SETS = {
  beds: [
    { id: 'single', name: 'Single (3 x 6.5 ft)', dims: { w: 105, d: 205 }, rate: -14000 },
    { id: 'queen',  name: 'Queen (5 x 6.5 ft)',  dims: { w: 170, d: 210 }, rate: 0 },
    { id: 'king',   name: 'King (6 x 6.5 ft)',   dims: { w: 195, d: 215 }, rate: 8000 },
  ],
  dining: [
    { id: 'seat4', name: '4 seater', dims: { w: 120, d: 80 },  rate: -10000 },
    { id: 'seat6', name: '6 seater', dims: { w: 180, d: 90 },  rate: 0 },
    { id: 'seat8', name: '8 seater', dims: { w: 220, d: 100 }, rate: 14000 },
  ],
  wardrobes: [
    { id: 'door2', name: '2 door', dims: { w: 100 }, rate: 0 },
    { id: 'door3', name: '3 door', dims: { w: 150 }, rate: 9000 },
    { id: 'door4', name: '4 door', dims: { w: 200 }, rate: 20000 },
  ],
  sofas: [
    { id: 'seat2', name: '2 seater', dims: { w: 150 }, rate: -15000 },
    { id: 'seat3', name: '3 seater', dims: { w: 200 }, rate: 0 },
    { id: 'seat4', name: '4 seater', dims: { w: 250 }, rate: 14000 },
  ],
  // Smaller / larger version of the same design: size = share of the design's own measurements, price = share of its base price.
  scaled: [
    { id: 'small',    name: 'Small',    scale: { w: 0.8, h: 0.8 },   factor: 0.8 },
    { id: 'standard', name: 'Standard', scale: { w: 1, h: 1 },       factor: 1 },
    { id: 'large',    name: 'Large',    scale: { w: 1.25, h: 1.25 }, factor: 1.3 },
  ],
  doors: [
    { id: 'ft65', name: '3 x 6.5 ft', dims: { w: 90,  h: 195 }, rate: -2000 },
    { id: 'ft7',  name: '3 x 7 ft',   dims: { w: 90,  h: 210 }, rate: 0 },
    { id: 'ft7w', name: '3.5 x 7 ft', dims: { w: 105, h: 210 }, rate: 3500 },
  ],
};
export const COUNTER_RATE = 6000; // headboard counter (side drawers and shelf) on beds
export const COUNTER_NAMES = Object.freeze({ with: 'With counter', without: 'Without counter' });
// Beds whose photo already shows a counter: the base price includes it.
const COUNTER_IN_PHOTO = new Set(['bed-05', 'bed-06', 'bed-07', 'bed-13', 'bed-14', 'bed-15', 'bed-20', 'bed-21', 'bed-22', 'bed-25']);
const SIZE_DEFAULT = { 'storage-01': 'door2', 'storage-02': 'door2', 'storage-03': 'door3' };

const UPH = ['ivory', 'beige', 'olive', 'charcoal', 'walnut'];
const WOOD = ['teak', 'walnut', 'charcoal', 'ivory'];
const UPH_FAB = ['cotton', 'linen', 'velvet', 'leather'];

// Per design: [3D model used, size in cm, base price (before GST), colours, fabrics, size set].
// The 3D model is the nearest simple shape, not the exact carving in the photo.
const K = { w: 195, d: 215, h: 110 }, Q = { w: 170, d: 210, h: 105 };
const bed = (dims, price) => ['bed-' + (dims === K ? 'king' : 'queen'), dims, price, WOOD, ['none'], 'beds'];
const chair = (price) => ['chair-dining', { w: 45, d: 52, h: 88 }, price, WOOD, ['cotton', 'linen'], null];
const door = (price) => ['door', { w: 90, d: 5, h: 210 }, price, WOOD, ['none'], 'doors'];
const sofa = (dims, price) => ['sofa-aria-3', dims, price, UPH, UPH_FAB, 'sofas'];
const wardrobe = (dims, price) => ['wardrobe-3d', dims, price, WOOD, ['none'], 'wardrobes'];
const dining = (dims, price) => ['dining-6', dims, price, WOOD, ['none'], 'dining'];
const SPEC = {
  'bed-01': bed(Q, 70000), 'bed-02': bed(K, 70000), 'bed-03': bed(K, 56000), 'bed-04': bed(K, 65000), 'bed-05': bed(Q, 60000), 'bed-06': bed(K, 70000),
  'bed-07': bed(Q, 58000), 'bed-08': bed(Q, 46000), 'bed-09': bed(K, 46000), 'bed-10': bed(Q, 42000), 'bed-11': bed(Q, 44000), 'bed-12': bed(K, 46000),
  // New designs: placeholder prices until Wink confirms.
  'bed-13': bed(K, 62000), 'bed-14': bed(K, 68000), 'bed-15': bed(Q, 38000), 'bed-16': bed(K, 52000), 'bed-17': bed(K, 48000), 'bed-18': bed(K, 55000),
  'bed-19': bed(K, 50000), 'bed-20': bed(K, 66000), 'bed-21': bed(K, 70000), 'bed-22': bed(K, 72000), 'bed-23': bed(K, 58000), 'bed-24': bed(K, 45000), 'bed-25': bed(K, 68000),
  'sofa-01': sofa({ w: 215, d: 92, h: 84 }, 48000),
  'sofa-02': sofa({ w: 190, d: 80, h: 95 }, 52000),
  'sofa-03': sofa({ w: 200, d: 85, h: 90 }, 45000),
  'sofa-04': sofa({ w: 220, d: 95, h: 75 }, 40000),
  'sofa-05': sofa({ w: 215, d: 90, h: 85 }, 55000),
  'sofa-06': sofa({ w: 280, d: 200, h: 85 }, 68000),
  'sofa-07': sofa({ w: 210, d: 90, h: 80 }, 58000),
  'sofa-08': sofa({ w: 200, d: 85, h: 80 }, 62000),
  'dining-01': dining({ w: 180, d: 90, h: 76 }, 48000),
  'dining-02': dining({ w: 150, d: 90, h: 76 }, 60000),
  'dining-03': dining({ w: 200, d: 100, h: 76 }, 48000),
  'chair-01': chair(5500), 'chair-02': chair(5500), 'chair-03': chair(4800),
  'chair-04': ['chair-lounge', { w: 76, d: 80, h: 95 }, 7400, UPH, UPH_FAB, null],
  'storage-01': wardrobe({ w: 120, d: 55, h: 200 }, 42000),
  'storage-02': wardrobe({ w: 100, d: 55, h: 200 }, 38000),
  'storage-03': wardrobe({ w: 180, d: 55, h: 210 }, 42000),
  'storage-04': ['sideboard', { w: 160, d: 42, h: 80 }, 12500, WOOD, ['none'], 'scaled'],
  'table-01': ['table-study', { w: 110, d: 45, h: 76 }, 28000, WOOD, ['none'], 'scaled'],
  'table-02': ['table-side', { w: 40, d: 40, h: 45 }, 3800, WOOD, ['none'], null],
  'door-01': door(18000), 'door-02': door(16000), 'door-03': door(20000), 'door-04': door(22000), 'door-05': door(21000), 'door-06': door(19000), 'door-07': door(24000),
  'panel-01': ['frame-jaali', { w: 150, d: 4, h: 70 }, 8500, WOOD, ['none'], 'scaled'],
  'panel-02': ['frame-lotus', { w: 80, d: 4, h: 80 }, 5500, WOOD, ['none'], 'scaled'],
  'panel-03': ['frame-jaali', { w: 150, d: 4, h: 65 }, 8500, WOOD, ['none'], 'scaled'],
  'panel-04': ['frame-jaali', { w: 60, d: 4, h: 30 }, 1500, WOOD, ['none'], 'scaled'],
};

// Which size is the default for a design: the one closest to the design's own width.
function buildSizes(id, setName, dims, basePrice) {
  if (!setName) return { sizes: null, defaultSize: null };
  const set = SIZE_SETS[setName];
  const scaled = setName === 'scaled';
  const def = scaled ? 'standard' : (SIZE_DEFAULT[id] ?? set.reduce((a, b) => (Math.abs(b.dims.w - dims.w) < Math.abs(a.dims.w - dims.w) ? b : a)).id);
  const base = set.find((x) => x.id === def);
  const sizes = set.map((x) => {
    const isDef = x.id === def;
    const sized = scaled
      ? { ...dims, ...Object.fromEntries(Object.entries(x.scale).map(([k, v]) => [k, Math.round(dims[k] * v)])) }
      : { ...dims, ...x.dims };
    return Object.freeze({
      id: x.id, name: x.name,
      dims: Object.freeze(isDef ? { ...dims } : sized), // the default size keeps the design's own measurements
      delta: scaled ? Math.round((basePrice * (x.factor - 1)) / 100) * 100 : x.rate - base.rate,
    });
  });
  return { sizes: Object.freeze(sizes), defaultSize: def };
}

export const PRODUCTS = Object.freeze(GALLERY.map((g) => {
  const [model, dims, basePrice, colours, fabrics, setName] = SPEC[g.ref];
  const gst = gstFor(g.ref, basePrice);
  const { sizes, defaultSize } = buildSizes(g.ref, setName, dims, basePrice);
  const hasCounter = g.cat === 'beds';
  return Object.freeze({
    id: g.ref, name: g.alt, category: g.cat, price: basePrice + gst, fromPrice: basePrice + gst + (sizes ? Math.min(...sizes.map((s) => s.delta)) : 0), basePrice, gst, colours, fabrics, dims, model,
    leadTimeDays: CONFIG.deliveryDays,
    sizes, defaultSize,
    counter: hasCounter, defaultCounter: hasCounter ? (COUNTER_IN_PHOTO.has(g.ref) ? 'with' : 'without') : null,
    summary: `Design ${g.ref}, made to order in Wink's Patna factory. Size, finish and final price are confirmed on WhatsApp.`,
    image: g.src, // Wink's own photo
    images: g.images, // every angle of this design
    inspiration: g.inspiration === true, // shown with a "design inspiration" label
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

/** Fill in the default size and counter for a line that does not have them (old carts, shared links). */
export function withDefaults(line) {
  const prod = getProduct(line?.id);
  if (!prod) return line;
  return { ...line, size: line.size ?? prod.defaultSize, counter: line.counter ?? prod.defaultCounter };
}

/** Price of the counter option for a bed, relative to the counter included in the photo. */
export const counterDelta = (prod, counter) => (counter === prod.defaultCounter ? 0 : counter === 'with' ? COUNTER_RATE : -COUNTER_RATE);

/** The size option of a product, or null. */
export const getSize = (prod, size) => prod.sizes?.find((s) => s.id === size) ?? null;

/** Dimensions for the chosen size. */
export const dimsFor = (prod, size) => getSize(prod, size)?.dims ?? prod.dims;

/** Unit price (GST included) for a validated {id, color, fabric, size, counter}. Returns null if anything is not in the catalogue. */
export function unitPrice(line) {
  const { id, color, fabric } = line;
  const prod = getProduct(id);
  if (!prod || !prod.colours.includes(color) || !prod.fabrics.includes(fabric)) return null;
  const { size, counter } = withDefaults(line);
  let extra = 0;
  if (prod.sizes) { const s = getSize(prod, size); if (!s) return null; extra += s.delta; }
  else if (size != null) return null;
  if (prod.counter) { if (counter !== 'with' && counter !== 'without') return null; extra += counterDelta(prod, counter); }
  else if (counter != null) return null;
  return prod.price + FABRICS[fabric].priceDelta + extra;
}

/** Short text for the extra choices on a cart line, e.g. "King (6 x 6.5 ft), With counter". */
export function optionsText(line) {
  const prod = getProduct(line.id);
  if (!prod) return '';
  const { size, counter } = withDefaults(line);
  return [getSize(prod, size)?.name, prod.counter ? COUNTER_NAMES[counter] : null].filter(Boolean).join(', ');
}
