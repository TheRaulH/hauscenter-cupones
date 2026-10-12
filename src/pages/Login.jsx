import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import { sounds } from '../lib/sound';

function translate(message = '') {
  if (/invalid login credentials/i.test(message)) return 'Correo o contraseña incorrectos.';
  if (/email not confirmed/i.test(message)) return 'Tu correo aún no está confirmado. Avisa al administrador.';
  if (/rate limit|too many/i.test(message)) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  return 'No se pudo iniciar sesión. Revisa tu conexión e inténtalo de nuevo.';
}

export default function Login() {
  const { session, profile, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!loading && session && profile?.active) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const err = await signIn(email, password);
    if (err) {
      sounds.error();
      setError(translate(err.message));
      setBusy(false);
    } else {
      sounds.done();
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-haus-azul p-12 text-haus-blanco md:flex md:flex-col md:justify-between">
        <div className="absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full border-2 border-haus-apoyo/15" />
        <div className="absolute -bottom-52 -left-40 h-[460px] w-[460px] rounded-full border-2 border-haus-apoyo/10" />
        <BrandLogo variant="blanco" height={56} />
        <div className="relative space-y-4">
          <p className="font-accent text-6xl leading-none text-haus-arena">¡A vender!</p>
          <h1 className="max-w-md text-4xl font-bold leading-tight">Cupones únicos para cada live</h1>
          <p className="max-w-sm text-lg text-haus-apoyo">Elige el descuento, genera el código y comparte la imagen en segundos.</p>
        </div>
        <div className="h-3 w-24 rounded-full bg-haus-naranja" />
      </aside>

      <main className="grid place-items-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div className="md:hidden"><BrandLogo variant="azul" height={44} /></div>
          <div>
            <h2 className="text-3xl font-bold">Ingresar</h2>
            <p className="mt-1 text-haus-azul/70">Usa el usuario que te dio el administrador.</p>
          </div>

          <div>
            <label htmlFor="email" className="label">Correo</label>
            <input id="email" type="email" autoComplete="username" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@empresa.com" />
          </div>
          <div>
            <label htmlFor="password" className="label">Contraseña</label>
            <div className="relative">
              <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" required className="input pr-12" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-haus-azul/60 hover:bg-haus-apoyo" aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
            Ingresar
          </button>
        </form>
      </main>
    </div>
  );
}
