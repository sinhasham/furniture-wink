// Builds a prefilled WhatsApp link. The customer taps Send themselves; nothing is sent automatically.
import { CONFIG } from './config.js';
import { getProduct, COLOURS, FABRICS, unitPrice, optionsText } from './products.js';
import { cartTotal } from './validate.js';
import { formatINR } from './format.js';

export function orderMessage(v) {
  const out = [`Hello ${CONFIG.brand}, I would like to ${v.kind === 'visit' ? 'book a visit' : 'place an order'}.`, ''];
  out.push(`Name: ${v.name}`, `Phone: ${v.phone}`);
  if (v.email) out.push(`Email: ${v.email}`);
  out.push(`Address: ${v.address}, ${v.city} - ${v.pincode}`);
  if (v.date) out.push(`Visit date: ${v.date}`);
  if (v.items.length) {
    out.push('', 'Items:');
    v.items.forEach((l, i) => {
      const fab = (l.fabric === 'none' ? '' : `, ${FABRICS[l.fabric].name}`) + (optionsText(l) ? `, ${optionsText(l)}` : '');
      out.push(`${i + 1}. ${getProduct(l.id).name}, ${COLOURS[l.color].name}${fab} x ${l.qty} = ${formatINR(unitPrice(l) * l.qty)}`);
    });
    out.push(`Total incl. GST (before delivery): ${formatINR(cartTotal(v.items))}`);
  }
  if (v.note) out.push('', `Note: ${v.note}`);
  if (v.whatsappConsent) out.push('', 'I agree to receive order updates on WhatsApp. Reply STOP to opt out.');
  return out.join('\n');
}

export const orderLink = (v) => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(orderMessage(v))}`;

/** Direct "Order on WhatsApp" message for items chosen on the site. Prices come from the catalogue. The customer taps Send. */
export function cartMessage(lines) {
  const ok = lines.filter((l) => unitPrice(l) != null);
  const out = [`Hello ${CONFIG.brand}, I would like to order:`, ''];
  ok.forEach((l, i) => {
    const p = getProduct(l.id), fab = (l.fabric === 'none' ? '' : `, ${FABRICS[l.fabric].name}`) + (optionsText(l) ? `, ${optionsText(l)}` : '');
    out.push(`${i + 1}. ${p.name} (design ${p.id}), ${COLOURS[l.color].name}${fab} x ${l.qty} = ${formatINR(unitPrice(l) * l.qty)}`);
  });
  out.push(`Total incl. GST (before delivery): ${formatINR(cartTotal(ok))}`, '', `Please confirm the size, final price and delivery to my area (estimated delivery ${CONFIG.deliveryDays} days).`, 'My name:', 'My address and pincode:');
  return out.join('\n');
}
export const cartLink = (lines) => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(cartMessage(lines))}`;
