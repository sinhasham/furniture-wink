// Cart. Stores ONLY {id, color, fabric, size, counter, qty}. Prices are always recomputed from products.js.
import { CONFIG } from './config.js';
import { FABRICS, COLOURS, getProduct, unitPrice, optionsText } from './products.js';
import { validateCart, validateCartLine, cartTotal } from './validate.js';

const KEY = 'wink.cart.v1';

export function createCart(storage = globalThis.localStorage) {
  let lines = [];
  const listeners = new Set();

  const read = () => {
    try {
      const parsed = JSON.parse(storage?.getItem(KEY) ?? '[]');
      lines = validateCart(parsed) ?? []; // corrupted or tampered storage is discarded
    } catch { lines = []; }
  };
  const write = () => {
    try { storage?.setItem(KEY, JSON.stringify(lines)); } catch { /* storage full or blocked */ }
    listeners.forEach((fn) => fn(api.lines()));
  };
  const same = (a, b) => a.id === b.id && a.color === b.color && a.fabric === b.fabric && (a.size ?? null) === (b.size ?? null) && (a.counter ?? null) === (b.counter ?? null);

  const api = {
    add(item) {
      const next = validateCartLine({ qty: 1, ...item });
      if (!next) return false;
      const found = lines.find((l) => same(l, next));
      if (found) {
        found.qty = Math.min(CONFIG.maxQtyPerItem, found.qty + next.qty);
      } else {
        if (lines.length >= CONFIG.maxCartLines) return false;
        lines.push(next);
      }
      write();
      return true;
    },
    setQty(item, qty) {
      const idx = lines.findIndex((l) => same(l, item));
      if (idx < 0) return false;
      if (qty <= 0) lines.splice(idx, 1);
      else if (Number.isInteger(qty) && qty <= CONFIG.maxQtyPerItem) lines[idx].qty = qty;
      else return false;
      write();
      return true;
    },
    remove(item) { return api.setQty(item, 0); },
    clear() { lines = []; write(); },
    count: () => lines.reduce((n, l) => n + l.qty, 0),
    lines: () => lines.map((l) => ({ ...l })),
    /** Display lines with catalogue data and prices attached. */
    detailed: () => lines.map((l) => ({
      ...l,
      product: getProduct(l.id),
      colourName: COLOURS[l.color].name,
      fabricName: FABRICS[l.fabric].name,
      optionsText: optionsText(l),
      unit: unitPrice(l),
      subtotal: unitPrice(l) * l.qty,
    })),
    total: () => cartTotal(lines),
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
  read();
  return api;
}
