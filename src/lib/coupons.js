import { supabase } from './supabase';
import { generateCode } from './codes';

// Inserta el cupón; si el código ya existe (único), genera otro y reintenta.
export async function createCoupon({ discountId, tiktok, branch }) {
  let lastError;
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = generateCode(attempt);
    const { data, error } = await supabase
      .from('coupons')
      .insert({ code, discount_id: discountId, tiktok_profile: tiktok || null, branch: branch || null })
      .select()
      .single();
    if (!error) return data;
    if (error.code === '23505') {
      lastError = error;
      continue;
    }
    throw error;
  }
  throw lastError ?? new Error('No se pudo generar un código único');
}

export function redeemErrorMessage(error) {
  const m = error?.message ?? '';
  if (m.includes('CUPON_YA_CANJEADO')) return 'Este cupón ya fue canjeado.';
  if (m.includes('CUPON_NO_ENCONTRADO')) return 'No existe un cupón con ese código.';
  return 'No se pudo completar la acción. Inténtalo de nuevo.';
}

// "mango47" -> "MANGO-47"
export function normalizeCode(raw = '') {
  const v = raw.trim().toUpperCase().replace(/\s+/g, '');
  const m = v.match(/^([A-Z]+)(\d{2,3})$/);
  return m ? `${m[1]}-${m[2]}` : v;
}
