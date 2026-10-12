import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download, Eye, Loader2, Search, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, startOfTodayISO, toCSV } from '../lib/format';
import { downloadBlob } from '../lib/share';
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

export default function History() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [range, setRange] = useState('hoy');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(null);

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
    if (debounced) q = q.or(`code.ilike.%${debounced}%,tiktok_profile.ilike.%${debounced}%`);
    const { data, error } = await q;
    if (error) toast.error('No se pudo cargar el historial');
    const list = data ?? [];
    setRows((prev) => (from === 0 ? list : [...prev, ...list]));
    setHasMore(list.length === PAGE);
    setLoading(false);
  }, [range, debounced]);

  useEffect(() => { load(0); }, [load]);

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
        <div className="flex rounded-full bg-haus-apoyo p-1" role="group" aria-label="Rango">
          {[['hoy', 'Hoy'], ['todos', 'Todos']].map(([v, label]) => (
            <button key={v} onClick={() => setRange(v)} aria-pressed={range === v}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${range === v ? 'bg-haus-azul text-haus-blanco' : 'text-haus-azul'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-4 rounded-2xl rounded-bl-none border border-haus-apoyo bg-white p-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-haus-naranja text-lg font-extrabold text-haus-blanco">{r.discount_percent}%</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xl font-extrabold tracking-wide">{r.code}</div>
              <div className="truncate text-sm text-haus-azul/70">
                {r.applies_to}{r.tiktok_profile && <> · @{r.tiktok_profile}</>}
              </div>
              <div className="text-xs text-haus-azul/50">
                {formatDateTime(r.created_at)}{isAdmin && r.seller?.full_name && <> · {r.seller.full_name}</>}
              </div>
            </div>
            <button onClick={() => setOpen(r)} className="btn-soft shrink-0 px-4 py-2.5"><Eye size={18} /> <span className="hidden sm:inline">Ver</span></button>
          </li>
        ))}
      </ul>

      {!loading && rows.length === 0 && (
        <p className="rounded-2xl bg-haus-apoyo p-6 text-center">
          {debounced ? 'No hay cupones que coincidan con la búsqueda.' : range === 'hoy' ? 'Aún no generas cupones hoy.' : 'Todavía no hay cupones.'}
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
