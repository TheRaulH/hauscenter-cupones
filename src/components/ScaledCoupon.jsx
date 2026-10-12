import { useEffect, useRef, useState } from 'react';
import CouponCard from './CouponCard';
import { COUPON_W, COUPON_H } from '../lib/share';

// Muestra el cupón (1080x1350) escalado al ancho disponible. nodeRef apunta al nodo a exportar.
export default function ScaledCoupon({ coupon, nodeRef, dim = false, className = '' }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / COUPON_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={`relative w-full overflow-hidden rounded-2xl shadow-xl shadow-haus-azul/25 ${className}`} style={{ height: COUPON_H * scale }}>
      <div
        ref={nodeRef}
        style={{
          width: COUPON_W, height: COUPON_H, position: 'absolute', top: 0, left: 0,
          transform: `scale(${scale})`, transformOrigin: 'top left', opacity: dim ? 0.6 : 1,
        }}
      >
        <CouponCard coupon={coupon} />
      </div>
    </div>
  );
}
