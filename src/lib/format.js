import { BRAND } from '../config/brand';

const tz = BRAND.timezone;

export const formatDate = (iso) =>
  new Intl.DateTimeFormat('es-BO', { timeZone: tz, day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    iso ? new Date(iso) : new Date()
  );

export const formatDateTime = (iso) =>
  new Intl.DateTimeFormat('es-BO', {
    timeZone: tz, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(iso));

// Fecha límite del cupón: misma fecha + N meses (si el mes no tiene ese día, usa el último día).
export function validUntil(iso, months = BRAND.validityMonths) {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: tz })
    .format(iso ? new Date(iso) : new Date())
    .split('-')
    .map(Number);
  const lastDay = new Date(y, m - 1 + months + 1, 0).getDate();
  const end = new Date(y, m - 1 + months, Math.min(d, lastDay));
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(end.getDate())}/${pad(end.getMonth() + 1)}/${end.getFullYear()}`;
}

export const capFirst = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

// Inicio del día actual en hora de Bolivia (UTC-4, sin horario de verano)
export function startOfTodayISO() {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
  return new Date(`${day}T00:00:00-04:00`).toISOString();
}

// '' = sin perfil · string = válido · null = inválido
export function normalizeTiktok(raw = '') {
  let v = raw.trim();
  const fromUrl = v.match(/tiktok\.com\/@([^/?#\s]+)/i);
  if (fromUrl) v = fromUrl[1];
  v = v.replace(/^@+/, '').toLowerCase();
  if (!v) return '';
  return /^[a-z0-9._]{2,24}$/.test(v) ? v : null;
}

export function toCSV(rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['codigo', 'descuento_%', 'aplica_a', 'tiktok', 'sucursal', 'vendedor', 'fecha', 'canjeado', 'fecha_canje'];
  const lines = rows.map((r) =>
    [
      r.code, r.discount_percent, r.applies_to, r.tiktok_profile ? `@${r.tiktok_profile}` : '', r.branch ?? '',
      r.seller?.full_name ?? '', formatDateTime(r.created_at), r.redeemed ? 'sí' : 'no',
      r.redeemed_at ? formatDateTime(r.redeemed_at) : '',
    ].map(esc).join(',')
  );
  return '\uFEFF' + [head.join(','), ...lines].join('\n');
}
