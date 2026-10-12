import { useEffect } from 'react';
import { X } from 'lucide-react';
import ScaledCoupon from './ScaledCoupon';

// Pantalla completa para mostrar el cupón en el live
export default function FullscreenCoupon({ coupon, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-3" onClick={onClose} role="dialog" aria-modal="true" aria-label="Cupón en pantalla completa">
      <button onClick={onClose} className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-haus-arena text-haus-azul" aria-label="Cerrar">
        <X size={24} />
      </button>
      <div style={{ width: 'min(96vw, calc(96dvh * 0.8))' }} onClick={(e) => e.stopPropagation()}>
        <ScaledCoupon coupon={coupon} />
      </div>
    </div>
  );
}
