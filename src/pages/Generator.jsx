import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { AtSign, Loader2, Plus, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createCoupon } from '../lib/coupons';
import { normalizeTiktok } from '../lib/format';
import { sounds } from '../lib/sound';
import DiscountPicker from '../components/DiscountPicker';
import CouponViewer from '../components/CouponViewer';
import ScaledCoupon from '../components/ScaledCoupon';

const COLORS = ['#E76100', '#F3E4CD', '#123B64', '#DCE3EB'];

export default function Generator() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [tiktok, setTiktok] = useState('');
  const [busy, setBusy] = useState(false);
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    supabase
      .from('discounts')
      .select('*')
      .eq('active', true)
      .order('sort_order')
      .order('percentage')
      .then(({ data, error }) => {
        if (error) toast.error('No se pudieron cargar los descuentos');
        setDiscounts(data ?? []);
        setLoading(false);
      });
  }, []);

  const selected = discounts.find((d) => d.id === selectedId);
  const tiktokValue = normalizeTiktok(tiktok);
  const tiktokInvalid = tiktokValue === null;

  const preview = useMemo(
    () => ({
      id: 'preview',
      code: 'TU-CODIGO',
      discount_percent: selected?.percentage ?? 5,
      applies_to: selected?.applies_to ?? 'cualquier producto',
      tiktok_profile: tiktokValue || null,
      created_at: new Date().toISOString(),
    }),
    [selected, tiktokValue]
  );

  const generate = async () => {
    if (!selected || tiktokInvalid || busy) return;
    setBusy(true);
    try {
      const row = await createCoupon({ discountId: selected.id, tiktok: tiktokValue });
      setCoupon(row);
      sounds.success();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.4 }, colors: COLORS, disableForReducedMotion: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error(e);
      sounds.error();
      toast.error(/no disponible/i.test(e?.message) ? 'Ese descuento ya no está disponible' : 'No se pudo generar el cupón. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    sounds.click();
    setCoupon(null);
    setTiktok('');
  };

  return (
    <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <section className={`space-y-6 ${coupon ? 'order-2 md:order-1' : ''}`}>
        {coupon ? (
          <div className="space-y-5 rounded-3xl rounded-bl-none bg-haus-arena p-6">
            <div>
              <h1 className="text-3xl font-bold">Cupón listo</h1>
              <p className="mt-1 text-haus-azul/80">
                <span className="font-bold">{coupon.code}</span> · {coupon.discount_percent}% en {coupon.applies_to}
                {coupon.tiktok_profile && <> · para @{coupon.tiktok_profile}</>}
              </p>
            </div>
            <button onClick={reset} className="btn-primary w-full sm:w-auto">
              <Plus size={22} /> Generar otro cupón
            </button>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold">Generar cupón</h1>
              <p className="mt-1 text-haus-azul/70">Elige el descuento que vas a dar en el live.</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[132px] animate-pulse rounded-3xl rounded-bl-none bg-haus-apoyo" />)}
              </div>
            ) : discounts.length === 0 ? (
              <p className="rounded-2xl bg-haus-apoyo p-5">No hay descuentos activos. Pide al administrador que active alguno.</p>
            ) : (
              <DiscountPicker discounts={discounts} value={selectedId} onChange={setSelectedId} disabled={busy} />
            )}

            <div>
              <label htmlFor="tiktok" className="label">Perfil de TikTok del ganador (opcional)</label>
              <div className="relative">
                <AtSign size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-haus-azul/40" />
                <input
                  id="tiktok"
                  className="input pl-11"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generate()}
                  placeholder="usuario"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={busy}
                  aria-invalid={tiktokInvalid}
                />
              </div>
              {tiktokInvalid && <p className="mt-1.5 text-sm text-rose-700">Usa solo letras, números, punto o guion bajo (2 a 24 caracteres).</p>}
            </div>

            <button onClick={generate} disabled={!selected || tiktokInvalid || busy} className="btn-primary w-full py-4">
              {busy ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
              {busy ? 'Generando…' : 'Generar cupón'}
            </button>
          </>
        )}
      </section>

      <aside className={coupon ? 'order-1 md:order-2' : ''}>
        {coupon ? (
          <CouponViewer coupon={coupon} />
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-haus-azul/60">Vista previa · el código se asigna al generar</p>
            <ScaledCoupon coupon={preview} dim />
          </div>
        )}
      </aside>
    </div>
  );
}
