import { toBlob } from 'html-to-image';

export const COUPON_W = 1080;
export const COUPON_H = 1350;

async function waitForImages(node) {
  const imgs = [...node.querySelectorAll('img')];
  await Promise.all(
    imgs.map((img) => (img.complete ? null : new Promise((res) => { img.onload = img.onerror = res; })))
  );
}

// Renderiza el cupón a 1080x1350 (sin la escala de pantalla)
export async function couponToBlob(node) {
  await document.fonts?.ready;
  await waitForImages(node);
  const opts = {
    width: COUPON_W,
    height: COUPON_H,
    pixelRatio: 1,
    cacheBust: true,
    style: { transform: 'none', top: '0', left: '0' },
  };
  // Safari necesita un primer render para cargar fuentes e imágenes
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) await toBlob(node, opts);
  return toBlob(node, opts);
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Hoja de compartir nativa (WhatsApp, TikTok, etc.). Si no existe, descarga.
export async function shareImage(blob, filename, text) {
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
      throw e;
    }
  }
  downloadBlob(blob, filename);
  return 'downloaded';
}

export const canCopyImage = () => typeof window !== 'undefined' && 'ClipboardItem' in window && !!navigator.clipboard?.write;

export async function copyImage(blob) {
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}
