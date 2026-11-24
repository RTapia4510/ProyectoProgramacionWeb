// Fecha "hoy" fija para que los datos semilla (alertas, retrasos, plazos) sean reproducibles.
export const HOY = '2026-09-06';
const P = (s) => new Date(s + 'T00:00:00Z');
export const addDays = (s, n) => {
  const d = P(s);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const diffDays = (a, b) => Math.round((P(a) - P(b)) / 864e5);
export const fmt = (s) => (s ? s.split('-').reverse().join('/') : '—');
export const cap = (s) => (s > HOY ? HOY : s);
