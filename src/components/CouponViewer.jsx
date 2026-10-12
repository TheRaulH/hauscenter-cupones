import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Copy, Download, ImageIcon, Loader2, Maximize2, Share2 } from 'lucide-react';
import ScaledCoupon from './ScaledCoupon';
import FullscreenCoupon from './FullscreenCoupon';
import { canCopyImage, copyImage, copyText, couponToBlob, downloadBlob, shareImage } from '../lib/share';
import { sounds } from '../lib/sound';

// Cupón + acciones. La imagen se prepara apenas se muestra, así "Compartir" responde al instante.
export default function CouponViewer({ coupon }) {
  const nodeRef = useRef(null);
  const [blob, setBlob] = useState(null);
  const [preparing, setPreparing] = useState(true);
  const [full, setFull] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBlob(null);
    setPreparing(true);
    (async () => {
      try {
        await new Promise((r) => setTimeout(r, 120));
        const b = await couponToBlob(nodeRef.current);
        if (!cancelled) setBlob(b);
      } catch (e) {
        console.error(e);
        if (!cancelled) toast.error('No se pudo preparar la imagen del cupón');
      } finally {
        if (!cancelled) setPreparing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [coupon.id]);

  const filename = `cupon-${coupon.code}.png`;
  const text = `Cupón ${coupon.code}: ${coupon.discount_percent}% de descuento en ${coupon.applies_to} · Hauscenter`;

  const run = (fn) => async () => {
    try { await fn(); } catch (e) { console.error(e); sounds.error(); toast.error('No se pudo completar la acción'); }
  };

  const onShare = run(async () => {
    const result = await shareImage(blob, filename, text);
    if (result === 'shared') { sounds.done(); toast.success('Cupón compartido'); }
    if (result === 'downloaded') { sounds.done(); toast.success('Imagen descargada'); }
  });
  const onDownload = run(async () => { downloadBlob(blob, filename); sounds.done(); toast.success('Imagen descargada'); });
  const onCopyImage = run(async () => { await copyImage(blob); sounds.done(); toast.success('Imagen copiada'); });
  const onCopyCode = run(async () => { await copyText(coupon.code); sounds.done(); toast.success(`Código ${coupon.code} copiado`); });

  const disabled = !blob;

  return (
    <div className="space-y-4">
      <ScaledCoupon coupon={coupon} nodeRef={nodeRef} />

      <button onClick={onShare} disabled={disabled} className="btn-azul w-full py-4 text-lg">
        {preparing ? <Loader2 size={22} className="animate-spin" /> : <Share2 size={22} />}
        {preparing ? 'Preparando imagen…' : 'Compartir cupón'}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={onDownload} disabled={disabled} className="btn-soft"><Download size={18} /> Descargar</button>
        <button onClick={onCopyCode} className="btn-soft"><Copy size={18} /> Copiar código</button>
        {canCopyImage() && (
          <button onClick={onCopyImage} disabled={disabled} className="btn-soft"><ImageIcon size={18} /> Copiar imagen</button>
        )}
        <button onClick={() => { sounds.click(); setFull(true); }} className="btn-soft"><Maximize2 size={18} /> Pantalla completa</button>
      </div>

      {full && <FullscreenCoupon coupon={coupon} onClose={() => setFull(false)} />}
    </div>
  );
}
