import { supabase } from './supabase';
import { generateCode } from './codes';

// Inserta el cupón; si el código ya existe (único), genera otro y reintenta.
export async function createCoupon({ discountId, tiktok }) {
  let lastError;
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = generateCode(attempt);
    const { data, error } = await supabase
      .from('coupons')
      .insert({ code, discount_id: discountId, tiktok_profile: tiktok || null })
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
