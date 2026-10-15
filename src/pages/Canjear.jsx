import { useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheck, Loader2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { normalizeCode, redeemErrorMessage } from '../lib/coupons';
import { capFirst, formatDateTime } from '../lib/format';
import { sounds } from '../lib/sound';

// Para canjear en caja: busca el cupón por código (aunque lo haya generado otra persona).
export default function Canjear() {
  const [input, setInput] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const search = async (e) => {
    e?.preventDefault();
    const code = normalizeCode(input);
    if (!code) return;
    setSearching(true);
    setCoupon(null);
    setNotFound(false);
    const { data, error } = await supabase.rpc('lookup_coupon', { p_code: code });
    setSearching(false);
    if (error) {
      sounds.error();
      return toast.error('No se pudo buscar el cupón. Inténtalo de nuevo.');
    }
    if (!data) {
      sounds.error();
      return setNotFound(true);
    }
    sounds.select();
    setCoupon(data);
  };

  const redeem = async () => {
    setRedeeming(true);
    const { data, error } = await supabase.rpc('redeem_coupon', { p_code: coupon.code });
    setRedeeming(false);
    if (error) {
      sounds.error();
      toast.error(redeemErrorMessage(error));
      return search();
    }
    sounds.success();
    toast.success(`Cupón ${coupon.code} canjeado`);
    setCoupon((c) => ({ ...c, redeemed: data.redeemed, redeemed_at: data.redeemed_at }));
  };

  const next = () => {
    setInput('');
    setCoupon(null);
    setNotFound(false);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Canjear cupón</h1>
        <p className="mt-1 text-haus-azul/70">Escribe el código que muestra el cliente.</p>
      </div>

      <form onSubmit={search} className="flex gap-2">
        <input
          className="input text-xl font-bold uppercase tracking-wide"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="MANGO-47"
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          aria-label="Código del cupón"
        />
        <button type="submit" disabled={!input.trim() || searching} className="btn-azul shrink-0">
          {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} Buscar
        </button>
      </form>

      {notFound && (
        <p role="alert" className="rounded-2xl bg-rose-50 p-5 font-medium text-rose-800">
          No existe un cupón con el código {normalizeCode(input)}. Revisa que esté bien escrito.
        </p>
      )}

      {coupon && (
        <div className="space-y-5 rounded-3xl rounded-bl-none bg-haus-azul p-6 text-haus-blanco">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-haus-naranja text-2xl font-extrabold">{coupon.discount_percent}%</div>
            <div className="min-w-0">
              <div className="truncate text-3xl font-extrabold tracking-wide">{coupon.code}</div>
              <div className="text-haus-apoyo">en {coupon.applies_to}</div>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-haus-apoyo">Sucursal</dt><dd className="font-semibold">{coupon.branch ?? 'Sin sucursal'}</dd></div>
            <div><dt className="text-haus-apoyo">Creado</dt><dd className="font-semibold">{formatDateTime(coupon.created_at)}</dd></div>
            <div><dt className="text-haus-apoyo">TikTok</dt><dd className="font-semibold">{coupon.tiktok_profile ? `@${coupon.tiktok_profile}` : '—'}</dd></div>
            <div><dt className="text-haus-apoyo">Generado por</dt><dd className="font-semibold">{coupon.seller ?? '—'}</dd></div>
          </dl>

          {coupon.redeemed ? (
            <div className="rounded-2xl bg-haus-arena p-4 text-haus-azul">
              <div className="flex items-center gap-2 text-lg font-bold"><BadgeCheck size={22} /> Cupón ya canjeado</div>
              {coupon.redeemed_at && <div className="mt-1 text-sm">El {capFirst(formatDateTime(coupon.redeemed_at))}. No se puede usar otra vez.</div>}
            </div>
          ) : (
            <button onClick={redeem} disabled={redeeming} className="btn-primary w-full py-4">
              {redeeming ? <Loader2 size={22} className="animate-spin" /> : <BadgeCheck size={22} />} Marcar como canjeado
            </button>
          )}

          <button onClick={next} className="btn-soft w-full">Buscar otro cupón</button>
        </div>
      )}
    </div>
  );
}
