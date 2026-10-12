import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Row({ item, onSaved }) {
  const [percentage, setPercentage] = useState(item.percentage);
  const [appliesTo, setAppliesTo] = useState(item.applies_to);
  const [order, setOrder] = useState(item.sort_order);
  const [busy, setBusy] = useState(false);

  const dirty = Number(percentage) !== item.percentage || appliesTo.trim() !== item.applies_to || Number(order) !== item.sort_order;
  const valid = Number(percentage) >= 1 && Number(percentage) <= 100 && appliesTo.trim().length > 0;

  const update = async (patch, okMessage) => {
    setBusy(true);
    const { error } = await supabase.from('discounts').update(patch).eq('id', item.id);
    setBusy(false);
    if (error) return toast.error('No se pudo guardar el cambio');
    toast.success(okMessage);
    onSaved();
  };

  return (
    <li className={`grid grid-cols-[84px_1fr] items-center gap-3 rounded-2xl rounded-bl-none border border-haus-apoyo bg-white p-4 sm:grid-cols-[96px_1fr_88px_auto_auto] ${item.active ? '' : 'opacity-60'}`}>
      <div className="relative">
        <input type="number" min={1} max={100} className="input pr-8 text-xl font-bold" value={percentage} onChange={(e) => setPercentage(e.target.value)} aria-label="Porcentaje" />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-bold text-haus-naranja">%</span>
      </div>
      <input className="input" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)} aria-label="Aplica a" />
      <input type="number" className="input" value={order} onChange={(e) => setOrder(e.target.value)} aria-label="Orden" title="Orden en la pantalla" />
      <button
        onClick={() => update({ active: !item.active }, item.active ? 'Descuento desactivado' : 'Descuento activado')}
        disabled={busy}
        className={`btn px-4 py-2.5 text-sm ${item.active ? 'btn-soft' : 'btn-azul'}`}
      >
        {item.active ? 'Desactivar' : 'Activar'}
      </button>
      <button
        onClick={() => update({ percentage: Number(percentage), applies_to: appliesTo.trim(), sort_order: Number(order) || 0 }, 'Cambios guardados')}
        disabled={!dirty || !valid || busy}
        className="btn-primary px-4 py-2.5 text-sm"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar
      </button>
    </li>
  );
}

export default function Discounts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [percentage, setPercentage] = useState('');
  const [appliesTo, setAppliesTo] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('discounts').select('*').order('sort_order').order('percentage');
    if (error) toast.error('No se pudieron cargar los descuentos');
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const canAdd = Number(percentage) >= 1 && Number(percentage) <= 100 && appliesTo.trim().length > 0;

  const add = async (e) => {
    e.preventDefault();
    if (!canAdd) return;
    setAdding(true);
    const nextOrder = items.reduce((m, i) => Math.max(m, i.sort_order), 0) + 10;
    const { error } = await supabase.from('discounts').insert({ percentage: Number(percentage), applies_to: appliesTo.trim(), sort_order: nextOrder });
    setAdding(false);
    if (error) return toast.error('No se pudo crear el descuento');
    toast.success('Descuento creado');
    setPercentage('');
    setAppliesTo('');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Descuentos</h1>
        <p className="mt-1 text-haus-azul/70">Los cupones ya generados conservan el porcentaje con el que se crearon.</p>
      </div>

      <form onSubmit={add} className="grid gap-3 rounded-3xl rounded-bl-none bg-haus-arena p-5 sm:grid-cols-[110px_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="new-pct" className="label">Porcentaje</label>
          <input id="new-pct" type="number" min={1} max={100} className="input" value={percentage} onChange={(e) => setPercentage(e.target.value)} placeholder="15" />
        </div>
        <div>
          <label htmlFor="new-applies" className="label">Aplica a</label>
          <input id="new-applies" className="input" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)} placeholder="lavadoras Hova" />
        </div>
        <button type="submit" disabled={!canAdd || adding} className="btn-azul">
          {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Agregar
        </button>
      </form>

      {loading ? (
        <div className="h-40 animate-pulse rounded-3xl bg-haus-apoyo" />
      ) : (
        <ul className="space-y-3">{items.map((i) => <Row key={`${i.id}-${i.percentage}-${i.applies_to}-${i.sort_order}-${i.active}`} item={i} onSaved={load} />)}</ul>
      )}
    </div>
  );
}
