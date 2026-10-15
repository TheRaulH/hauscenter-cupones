import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Dices, Loader2, Plus, Trash2, Trophy, UserMinus, X } from 'lucide-react';
import { sounds } from '../lib/sound';

// La lista vive solo en este navegador (localStorage). No se guarda en Supabase.
const STORAGE_KEY = 'hc_sorteo_v1';
const ROW_H = 88;          // alto de cada nombre (px)
const VISIBLE = 5;         // nombres visibles a la vez
const CENTER = Math.floor(VISIBLE / 2) * ROW_H;
const TRAVEL = 70;         // cuántos nombres pasan antes de caer en el ganador
const DURATION = 6500;     // ms que dura el giro
const COLORS = ['#E76100', '#F3E4CD', '#123B64', '#DCE3EB'];

function loadData() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      names: Array.isArray(d.names) ? d.names.filter((n) => typeof n === 'string') : [],
      winners: Array.isArray(d.winners) ? d.winners.filter((n) => typeof n === 'string') : [],
    };
  } catch {
    return { names: [], winners: [] };
  }
}

function randInt(n) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % n;
}

// Columna "infinita": nombres al azar; el ganador queda en la posición TRAVEL.
function buildStrip(names, winner) {
  const total = TRAVEL + VISIBLE + 2;
  const strip = [];
  let prev = null;
  for (let i = 0; i < total; i++) {
    let pick = i === TRAVEL ? winner : names[randInt(names.length)];
    if (i !== TRAVEL && names.length > 1) {
      let guard = 0;
      while ((pick === prev || (Math.abs(i - TRAVEL) <= 1 && pick === winner)) && guard++ < 12) {
        pick = names[randInt(names.length)];
      }
    }
    strip.push(pick);
    prev = pick;
  }
  return strip;
}

function buildIdle(names) {
  if (names.length === 0) return [];
  const shuffled = [...names].sort(() => Math.random() - 0.5);
  return Array.from({ length: VISIBLE + 4 }, (_, i) => shuffled[i % shuffled.length]);
}

export default function Sorteo() {
  const [data, setData] = useState(loadData);
  const [text, setText] = useState('');
  const [run, setRun] = useState(null);        // { strip, winner } del giro actual
  const [phase, setPhase] = useState('idle');  // idle | spinning | done
  const stripRef = useRef(null);

  const { names, winners } = data;
  const spinning = phase === 'spinning';

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* sin storage */ }
  }, [data]);

  const idleStrip = useMemo(() => buildIdle(names), [names]);
  const rows = run ? run.strip : idleStrip;

  // Posición de reposo: el nombre central queda dentro del recuadro
  useLayoutEffect(() => {
    if (run || !stripRef.current) return;
    stripRef.current.style.transform = `translateY(${CENTER - CENTER}px)`;
  }, [run, idleStrip]);

  // Animación del giro
  useEffect(() => {
    if (!run) return;
    const el = stripRef.current;
    const target = TRAVEL * ROW_H;
    const setOffset = (o) => { el.style.transform = `translateY(${CENTER - o}px)`; };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finish = () => {
      setPhase('done');
      sounds.success();
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.45 }, colors: COLORS, disableForReducedMotion: true });
      setData((d) => ({ ...d, winners: [run.winner, ...d.winners.filter((w) => w !== run.winner)] }));
    };

    if (reduce) {
      setOffset(target);
      finish();
      return;
    }

    let raf;
    let start = 0;
    let lastIdx = 0;
    let lastTick = 0;
    const frame = (now) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / DURATION);
      const o = (1 - Math.pow(1 - t, 4)) * target;
      setOffset(o);
      const idx = Math.round(o / ROW_H);
      if (idx !== lastIdx) {
        lastIdx = idx;
        if (now - lastTick > 45) { sounds.click(); lastTick = now; }
      }
      if (t < 1) raf = requestAnimationFrame(frame);
      else finish();
    };
    setOffset(0);
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [run]);

  const addNames = () => {
    const incoming = text.split(/[\n,;]+/).map((n) => n.trim().replace(/^@+/, '').replace(/\s+/g, ' ')).filter(Boolean);
    if (incoming.length === 0) return;
    const seen = new Set(names.map((n) => n.toLowerCase()));
    const fresh = [];
    let dups = 0;
    for (const n of incoming) {
      const key = n.toLowerCase();
      if (seen.has(key)) { dups++; continue; }
      seen.add(key);
      fresh.push(n);
    }
    if (fresh.length) {
      setData((d) => ({ ...d, names: [...d.names, ...fresh] }));
      setRun(null);
      setPhase('idle');
      sounds.select();
    }
    setText('');
    if (fresh.length) toast.success(`${fresh.length} ${fresh.length === 1 ? 'nombre agregado' : 'nombres agregados'}`);
    if (dups) toast.info(`${dups} repetido${dups === 1 ? '' : 's'} (no se agregó${dups === 1 ? '' : 'ron'})`);
  };

  const removeName = (name) => {
    setData((d) => ({ ...d, names: d.names.filter((n) => n !== name) }));
    setRun(null);
    setPhase('idle');
  };

  const clearAll = () => {
    if (!window.confirm('¿Vaciar toda la lista de participantes?')) return;
    setData((d) => ({ ...d, names: [] }));
    setRun(null);
    setPhase('idle');
  };

  const spin = () => {
    if (names.length < 2 || spinning) return;
    const winner = names[randInt(names.length)];
    setRun({ strip: buildStrip(names, winner), winner });
    setPhase('spinning');
  };

  const winner = phase === 'done' ? run?.winner : null;

  return (
    <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
      {/* Columna que gira */}
      <section className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold">Sorteo</h1>
          <p className="mt-1 text-haus-azul/70">Agrega a los participantes del live y sortea al final.</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl rounded-bl-none bg-haus-azul" style={{ height: VISIBLE * ROW_H }}>
          {rows.length === 0 ? (
            <div className="grid h-full place-items-center px-6 text-center text-lg text-haus-apoyo">
              Aún no hay participantes. Agrégalos en la lista.
            </div>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 28%, #000 72%, transparent)',
                maskImage: 'linear-gradient(to bottom, transparent, #000 28%, #000 72%, transparent)',
              }}
            >
              <div ref={stripRef} className="will-change-transform">
                {rows.map((name, i) => (
                  <div
                    key={i}
                    className="truncate px-16 text-center text-[40px] font-bold text-haus-blanco"
                    style={{ height: ROW_H, lineHeight: `${ROW_H}px` }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recuadro del nombre elegido */}
          {rows.length > 0 && (
            <div
              className="pointer-events-none absolute left-4 right-4 rounded-2xl rounded-bl-none border-4 border-haus-arena"
              style={{ top: CENTER, height: ROW_H }}
            >
              <span className="absolute -left-3 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[12px] border-l-[16px] border-y-transparent border-l-haus-naranja" />
              <span className="absolute -right-3 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[12px] border-r-[16px] border-y-transparent border-r-haus-naranja" />
            </div>
          )}
        </div>

        {winner ? (
          <div className="space-y-4 rounded-3xl rounded-bl-none bg-haus-arena p-6 text-center" role="status">
            <p className="font-accent text-5xl leading-none">¡Felicidades!</p>
            <p className="break-words text-4xl font-extrabold">{winner}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button onClick={() => removeName(winner)} className="btn-soft px-4 py-2 text-sm">
                <UserMinus size={16} /> Quitar de la lista
              </button>
              <button onClick={spin} disabled={names.length < 2} className="btn-primary px-6 py-3">
                <Dices size={22} /> Sortear otra vez
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button onClick={spin} disabled={names.length < 2 || spinning} className="btn-primary w-full py-4">
              {spinning ? <Loader2 size={22} className="animate-spin" /> : <Dices size={22} />}
              {spinning ? 'Sorteando…' : 'Sortear'}
            </button>
            {names.length < 2 && <p className="text-center text-sm text-haus-azul/60">Agrega al menos 2 participantes para sortear.</p>}
          </div>
        )}
      </section>

      {/* Lista de participantes */}
      <aside className="space-y-5">
        <div className="space-y-3 rounded-3xl rounded-bl-none border border-haus-apoyo bg-white p-5">
          <label htmlFor="names" className="label">Agregar participantes</label>
          <textarea
            id="names"
            rows={3}
            className="input resize-none"
            placeholder="Usuario de TikTok o nombre completo. Puedes pegar varios, uno por línea."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNames(); }
            }}
            disabled={spinning}
          />
          <button onClick={addNames} disabled={!text.trim() || spinning} className="btn-azul w-full">
            <Plus size={18} /> Agregar
          </button>
        </div>

        <div className="rounded-3xl rounded-bl-none border border-haus-apoyo bg-white p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Participantes ({names.length})</h2>
            {names.length > 0 && (
              <button onClick={clearAll} disabled={spinning} className="flex items-center gap-1.5 text-sm font-semibold text-haus-azul/70 hover:text-haus-azul disabled:opacity-50">
                <Trash2 size={15} /> Vaciar
              </button>
            )}
          </div>
          {names.length === 0 ? (
            <p className="text-haus-azul/60">La lista está vacía.</p>
          ) : (
            <ul className="max-h-96 space-y-1 overflow-y-auto pr-1">
              {names.map((n) => (
                <li key={n} className="flex items-center justify-between gap-2 rounded-xl bg-haus-blanco px-3 py-2">
                  <span className="truncate">{n}</span>
                  <button onClick={() => removeName(n)} disabled={spinning} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-haus-azul/60 hover:bg-haus-apoyo disabled:opacity-40" aria-label={`Quitar ${n}`}>
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-haus-azul/50">Se guarda solo en este equipo, no en la base de datos.</p>
        </div>

        {winners.length > 0 && (
          <div className="rounded-3xl rounded-bl-none bg-haus-apoyo p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold"><Trophy size={18} /> Ganadores</h2>
              <button onClick={() => setData((d) => ({ ...d, winners: [] }))} className="text-sm font-semibold text-haus-azul/70 hover:text-haus-azul">Limpiar</button>
            </div>
            <ol className="list-decimal space-y-1 pl-5">
              {winners.map((w) => <li key={w} className="truncate">{w}</li>)}
            </ol>
          </div>
        )}
      </aside>
    </div>
  );
}
