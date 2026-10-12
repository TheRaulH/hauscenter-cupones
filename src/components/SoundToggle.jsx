import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isMuted, setMuted, sounds } from '../lib/sound';

export default function SoundToggle() {
  const [muted, setLocal] = useState(isMuted());
  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setLocal(next);
    if (!next) sounds.click();
  };
  return (
    <button
      onClick={toggle}
      className="grid h-10 w-10 place-items-center rounded-full text-haus-blanco hover:bg-white/10"
      aria-label={muted ? 'Activar sonidos' : 'Silenciar sonidos'}
      title={muted ? 'Activar sonidos' : 'Silenciar sonidos'}
    >
      {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
}
