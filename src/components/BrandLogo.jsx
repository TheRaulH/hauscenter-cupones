import { useState } from 'react';
import { BRAND } from '../config/brand';

// Usa SIEMPRE los archivos oficiales (public/brand). El texto es solo un provisional.
export default function BrandLogo({ variant = 'blanco', height = 40, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`font-semibold leading-none tracking-tight ${className}`}
        style={{ fontSize: height * 0.62, color: variant === 'blanco' ? '#FAF7F0' : '#123B64' }}
      >
        {BRAND.name}
      </span>
    );
  }
  return (
    <img
      src={BRAND.logos[variant]}
      alt={BRAND.name}
      style={{ height }}
      className={className}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
