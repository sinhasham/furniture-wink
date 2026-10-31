import { CONFIG } from './config.js';

const inr = new Intl.NumberFormat(CONFIG.locale, {
  style: 'currency', currency: CONFIG.currency, maximumFractionDigits: 0,
});

export const formatINR = (n) => inr.format(Number.isFinite(n) ? n : 0);

export const formatCm = ({ w, d, h }) => `${w} × ${d} × ${h} cm`;
