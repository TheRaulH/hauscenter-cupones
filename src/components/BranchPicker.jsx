import { Check } from 'lucide-react';
import { BRANCHES } from '../config/brand';

export default function BranchPicker({ current, onSelect, onCancel }) {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">¿En qué sucursal estás?</h1>
        <p className="mt-1 text-haus-azul/70">Se guarda en este equipo y se usará en todos los cupones que generes aquí.</p>
      </div>
      <div role="radiogroup" aria-label="Sucursal" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BRANCHES.map((b) => {
          const selected = b === current;
          return (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(b)}
              className={`relative flex min-h-[96px] items-end rounded-3xl rounded-bl-none border-2 p-4 text-left text-lg font-bold transition active:scale-[0.97] ${
                selected ? 'border-haus-azul bg-haus-azul text-haus-blanco' : 'border-haus-apoyo bg-white hover:border-haus-azul/50'
              }`}
            >
              {selected && (
                <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-haus-arena text-haus-azul">
                  <Check size={16} strokeWidth={3} />
                </span>
              )}
              {b}
            </button>
          );
        })}
      </div>
      {onCancel && <button onClick={onCancel} className="btn-ghost">Cancelar</button>}
    </div>
  );
}
