import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, Download, Eye, Loader2, Search, Undo2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, startOfTodayISO, toCSV } from '../lib/format';
import { redeemErrorMessage } from '../lib/coupons';
import { downloadBlob } from '../lib/share';
import { sounds } from '../lib/sound';
import CouponViewer from '../components/CouponViewer';

const PAGE = 40;

function Modal({ onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-haus-azul/80 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mx-auto my-6 w-full max-w-md rounded-3xl rounded-bl-none bg-haus-blanco p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex justify-end">
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-haus-apoyo" aria-label="Cerrar"><X size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Segmented({ value, onChange, options, label }) {
  return (
    <div className="flex rounded-full bg-haus-apoyo p-1" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} onClick={() => onChange(v)} aria-pressed={value === v}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${value === v ? 'bg-haus-azul text-haus-blanco' : 'text-haus-azul'}`}>
          {text}
        </button>
      ))}
    </div>
  );
}

export default function History() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [range, setRange] = useState('hoy');
  const [status, setStatus] = useState('todos');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().replace(/[,()%*@]/g, '')), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async (from) => {
    setLoading(true);
    let q = supabase
      .from('coupons')
      .select('*, seller:profiles!coupons_created_by_fkey(full_name)')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (range === 'hoy') q = q.gte('created_at', startOfTodayISO());
    if (status === 'pendientes') q = q.eq('redeemed', false);
    if (status === 'canjeados') q = q.eq('redeemed', true);
    if (debounced) q = q.or(`code.ilike.%${debounced}%,tiktok_profile.ilike.%${debounced}%`);
    const { data, error } = await q;
    if (error) toast.error('No se pudo cargar el historial');
    const list = data ?? [];
    setRows((prev) => (from === 0 ? list : [...prev, ...list]));
    setHasMore(list.length === PAGE);
    setLoading(false);
  }, [range, status, debounced]);

  useEffect(() => { load(0); }, [load]);

  const patchRow = (id, patch) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const redeem = async (r) => {
    if (!window.confirm(`¿Marcar el cupón ${r.code} como canjeado?`)) return;
    setBusyId(r.id);
    const { data, error } = await supabase.rpc('redeem_coupon', { p_code: r.code });
    setBusyId(null);
    if (error) {
      sounds.error();
      toast.error(redeemErrorMessage(error));
      if (error.message?.includes('CUPON_YA_CANJEADO')) load(0);
      return;
    }
    sounds.done();
    toast.success(`Cupón ${r.code} canjeado`);
    patchRow(r.id, data);
  };

  // Solo administradores: corregir un canje marcado por error
  const undo = async (r) => {
    if (!window.confirm(`¿Deshacer el canje del cupón ${r.code}?`)) return;
    setBusyId(r.id);
    const patch = { redeemed: false, redeemed_at: null, redeemed_by: null };
    const { error } = await supabase.from('coupons').update(patch).eq('id', r.id);
    setBusyId(null);
    if (error) return toast.error('No se pudo deshacer el canje');
    toast.success('Canje deshecho');
    patchRow(r.id, patch);
  };

  const exportCsv = () => {
    downloadBlob(new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8' }), `cupones-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Historial</h1>
          <p className="mt-1 text-haus-azul/70">{isAdmin ? 'Todos los cupones generados.' : 'Los cupones que generaste.'}</p>
        </div>
        {isAdmin && rows.length > 0 && (
          <button onClick={exportCsv} className="btn-ghost"><Download size={18} /> Exportar CSV</button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-haus-azul/40" />
          <input className="input pl-11" placeholder="Buscar por código o TikTok" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Segmented label="Rango" value={range} onChange={setRange} options={[['hoy', 'Hoy'], ['todos', 'Todos']]} />
        <Segmented label="Estado" value={status} onChange={setStatus} options={[['todos', 'Todos'], ['pendientes', 'Pendientes'], ['canjeados', 'Canjeados']]} />
      </div>

      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl rounded-bl-none border border-haus-apoyo bg-white p-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-haus-naranja text-lg font-extrabold text-haus-blanco">{r.discount_percent}%</div>
            <div className="min-w-[180px] flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-xl font-extrabold tracking-wide">{r.code}</span>
                {r.redeemed && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-haus-azul px-2.5 py-0.5 text-xs font-semibold text-haus-blanco">
                    <Check size={12} strokeWidth={3} /> Canjeado
                  </span>
                )}
              </div>
              <div className="truncate text-sm text-haus-azul/70">
                {r.applies_to}{r.tiktok_profile && <> · @{r.tiktok_profile}</>}
              </div>
              <div className="text-xs text-haus-azul/50">
                {r.branch ?? 'Sin sucursal'} · {formatDateTime(r.created_at)}
                {isAdmin && r.seller?.full_name && <> · {r.seller.full_name}</>}
                {r.redeemed && r.redeemed_at && <> · canjeado {formatDateTime(r.redeemed_at)}</>}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {!r.redeemed && (
                <button onClick={() => redeem(r)} disabled={busyId === r.id} className="btn-primary px-4 py-2.5 text-sm">
                  {busyId === r.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />} Canjeado
                </button>
              )}
              {r.redeemed && isAdmin && (
                <button onClick={() => undo(r)} disabled={busyId === r.id} className="btn-ghost px-4 py-2.5 text-sm">
                  <Undo2 size={16} /> Deshacer
                </button>
              )}
              <button onClick={() => setOpen(r)} className="btn-soft px-4 py-2.5"><Eye size={18} /> <span className="hidden sm:inline">Ver</span></button>
            </div>
          </li>
        ))}
      </ul>

      {!loading && rows.length === 0 && (
        <p className="rounded-2xl bg-haus-apoyo p-6 text-center">
          {debounced ? 'No hay cupones que coincidan con la búsqueda.' : range === 'hoy' ? 'No hay cupones para mostrar hoy.' : 'No hay cupones para mostrar.'}
        </p>
      )}

      {loading && <div className="grid place-items-center py-6"><Loader2 className="animate-spin" /></div>}

      {hasMore && !loading && (
        <button onClick={() => load(rows.length)} className="btn-ghost mx-auto">Cargar más</button>
      )}

      {open && <Modal onClose={() => setOpen(null)}><CouponViewer coupon={open} /></Modal>}
    </div>
  );
}
