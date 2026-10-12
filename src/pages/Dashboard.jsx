import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { capFirst } from '../lib/format';

function Stat({ label, value }) {
  return (
    <div className="rounded-3xl rounded-bl-none bg-haus-azul p-6 text-haus-blanco">
      <div className="text-5xl font-extrabold leading-none">{value}</div>
      <div className="mt-2 text-haus-apoyo">{label}</div>
    </div>
  );
}

function Bars({ title, items }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <section className="rounded-3xl rounded-bl-none border border-haus-apoyo bg-white p-6">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-haus-azul/60">Sin datos todavía.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.label}>
              <div className="mb-1 flex justify-between gap-3 text-sm">
                <span className="truncate font-medium">{i.label}</span>
                <span className="font-bold">{i.count}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-haus-apoyo">
                <div className="h-full rounded-full bg-haus-azul" style={{ width: `${(i.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    supabase.rpc('coupon_stats').then(({ data, error }) => {
      if (error) return toast.error('No se pudieron cargar las estadísticas');
      setStats(data);
    });
  }, []);

  if (!stats) return <div className="h-40 animate-pulse rounded-3xl bg-haus-apoyo" />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Panel</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Cupones hoy" value={stats.today} />
        <Stat label="Cupones en total" value={stats.total} />
        <Stat label="Con perfil de TikTok" value={stats.with_tiktok} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Bars title="Por descuento" items={stats.by_discount.map((d) => ({ label: `${d.percent}% · ${capFirst(d.applies_to)}`, count: d.count }))} />
        <Bars title="Por vendedor" items={stats.by_seller.map((s) => ({ label: s.name, count: s.count }))} />
      </div>
    </div>
  );
}
