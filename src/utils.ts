import type { Sale } from './types';

export const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 9);

export const calcSubtotal = (s: Sale) => Number((s.quantity * s.unitPrice).toFixed(2));
export const calcTotalNailer = (s: Sale) => Number(((calcSubtotal(s) * s.percentNailer) / 100).toFixed(2));
