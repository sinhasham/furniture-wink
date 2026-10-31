// Pure validation. Runs in the browser for friendly errors AND on the server as the real boundary.
// Never trust the browser: the server must call these again and recompute prices from products.js.
import { CONFIG } from './config.js';
import { getProduct, unitPrice } from './products.js';

// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001F\u007F]/g;
export const clean = (s) => (typeof s === 'string' ? s.replace(CONTROL, ' ').replace(/\s+/g, ' ').trim() : '');

const NAME_RE = /^[\p{L}][\p{L}\p{M} .'-]{1,59}$/u;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const PIN_RE = /^[1-9][0-9]{5}$/;
const ID_RE = /^[a-z0-9-]{1,40}$/;

export function normalisePhone(raw) {
  const digits = String(raw ?? '').replace(/[\s()-]/g, '');
  const m = digits.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  return m ? m[1] : null;
}

/** Cart line: only {id, color, fabric, qty}. Anything else is dropped. Returns line or null. */
export function validateCartLine(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const { id, color, fabric } = raw;
  const qty = Number(raw.qty);
  if (typeof id !== 'string' || !ID_RE.test(id)) return null;
  if (!Number.isInteger(qty) || qty < 1 || qty > CONFIG.maxQtyPerItem) return null;
  if (unitPrice({ id, color, fabric }) === null) return null;
  return { id, color, fabric, qty };
}

export function validateCart(rawLines) {
  if (!Array.isArray(rawLines) || rawLines.length > CONFIG.maxCartLines) return null;
  const out = [];
  for (const r of rawLines) {
    const line = validateCartLine(r);
    if (!line) return null;
    out.push(line);
  }
  return out;
}

/** Total in rupees, computed only from the catalogue. */
export function cartTotal(lines) {
  return lines.reduce((sum, l) => sum + unitPrice(l) * l.qty, 0);
}

/**
 * Validate a booking request.
 * @returns {{ok:true, value:object} | {ok:false, errors:Record<string,string>}}
 */
export function validateBooking(input, now = new Date()) {
  const errors = {};
  const src = input && typeof input === 'object' ? input : {};

  const name = clean(src.name);
  if (!NAME_RE.test(name)) errors.name = 'Enter your full name (letters only, 2 to 60 characters).';

  const phone = normalisePhone(src.phone);
  if (!phone) errors.phone = 'Enter a 10-digit Indian mobile number.';

  const email = clean(src.email);
  if (email && !EMAIL_RE.test(email)) errors.email = 'Enter a valid email or leave it empty.';

  const pincode = clean(src.pincode);
  if (!PIN_RE.test(pincode)) errors.pincode = 'Enter a valid 6-digit pincode.';

  const city = clean(src.city);
  if (city.length < 2 || city.length > 60) errors.city = 'Enter your city or town.';

  const address = clean(src.address);
  if (address.length < 8 || address.length > 200) errors.address = 'Enter your full address (8 to 200 characters).';

  const kind = src.kind === 'visit' ? 'visit' : src.kind === 'order' ? 'order' : null;
  if (!kind) errors.kind = 'Choose a visit or an order.';

  let date = '';
  if (src.date) {
    date = clean(src.date);
    const d = new Date(`${date}T00:00:00`);
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const max = new Date(today); max.setDate(max.getDate() + 90);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(d.getTime()) || d < today || d > max) {
      errors.date = 'Pick a date within the next 90 days.';
    }
  } else if (kind === 'visit') {
    errors.date = 'Pick a visit date.';
  }

  const note = clean(src.note);
  if (note.length > 500) errors.note = 'Keep the note under 500 characters.';

  const items = validateCart(src.items ?? []);
  if (items === null) errors.items = 'Your cart has an item that is not available. Remove it and try again.';
  else if (kind === 'order' && items.length === 0) errors.items = 'Add at least one product to place an order.';

  // WhatsApp messages need explicit opt-in. Never default to true.
  const whatsappConsent = src.whatsappConsent === true;

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: { name, phone, email, pincode, city, address, kind, date, note, items, whatsappConsent },
  };
}

/** Login/sign-up format checks only. Real authentication must be done by a proven auth provider on the server. */
export function validateAuth(input, mode = 'login') {
  const errors = {};
  const src = input && typeof input === 'object' ? input : {};
  const email = clean(src.email);
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
  const password = typeof src.password === 'string' ? src.password : '';
  if (password.length < 8 || password.length > 128) errors.password = 'Use 8 to 128 characters.';
  if (mode === 'signup') {
    if (!NAME_RE.test(clean(src.name))) errors.name = 'Enter your full name.';
    if (src.confirm !== password) errors.confirm = 'Passwords do not match.';
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true };
}

// Exposed for tests
export { getProduct };
