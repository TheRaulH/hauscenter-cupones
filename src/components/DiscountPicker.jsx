import { Check } from 'lucide-react';
import { capFirst } from '../lib/format';
import { sounds } from '../lib/sound';

export default function DiscountPicker({ discounts, value, onChange, disabled }) {
  return (
    <div role="radiogroup" aria-label="Descuento" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {discounts.map((d) => {
        const selected = d.id === value;
        return (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => { sounds.select(); onChange(d.id); }}
            className={`relative flex min-h-[132px] flex-col justify-between rounded-3xl rounded-bl-none border-2 p-4 text-left transition active:scale-[0.97] disabled:opacity-60 ${
              selected
                ? 'border-haus-azul bg-haus-azul text-haus-blanco shadow-lg shadow-haus-azul/30'
                : 'border-haus-apoyo bg-white text-haus-azul hover:border-haus-azul/50'
            }`}
          >
            {selected && (
              <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-haus-arena text-haus-azul">
                <Check size={16} strokeWidth={3} />
              </span>
            )}
            <span className="text-5xl font-extrabold leading-none text-haus-naranja">{d.percentage}%</span>
            <span className={`text-sm font-medium leading-snug ${selected ? 'text-haus-arena' : 'text-haus-azul/80'}`}>
              {capFirst(d.applies_to)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
