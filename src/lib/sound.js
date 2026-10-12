// Sonidos sintetizados con WebAudio: sin archivos de audio que cargar.
let ctx;
let muted = false;
try { muted = localStorage.getItem('hc_muted') === '1'; } catch { /* sin storage */ }

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type = 'sine', vol = 0.16) {
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const t0 = c.currentTime + start;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const isMuted = () => muted;
export function setMuted(value) {
  muted = value;
  try { localStorage.setItem('hc_muted', value ? '1' : '0'); } catch { /* sin storage */ }
}

export const sounds = {
  click() { if (!muted) tone(660, 0, 0.07, 'triangle', 0.08); },
  select() { if (!muted) tone(880, 0, 0.09, 'triangle', 0.09); },
  success() {
    if (muted) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.28, 'triangle', 0.14));
    tone(1318.5, 0.4, 0.5, 'sine', 0.1);
  },
  done() { if (!muted) { tone(784, 0, 0.1, 'sine', 0.12); tone(1047, 0.1, 0.18, 'sine', 0.12); } },
  error() { if (!muted) { tone(220, 0, 0.18, 'sawtooth', 0.09); tone(165, 0.16, 0.25, 'sawtooth', 0.09); } },
};
