import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, History, LogOut, Percent, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import SoundToggle from './SoundToggle';

const linkClass = ({ isActive }) =>
  `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-haus-arena text-haus-azul' : 'text-haus-apoyo hover:bg-white/10'
  }`;

export default function Layout() {
  const { profile, isAdmin, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-haus-azul text-haus-blanco shadow-lg shadow-haus-azul/10">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <BrandLogo variant="blanco" height={36} />
          <nav className="mx-2 flex flex-1 gap-1 overflow-x-auto" aria-label="Principal">
            <NavLink to="/" end className={linkClass}><Ticket size={18} /> Generar</NavLink>
            <NavLink to="/historial" className={linkClass}><History size={18} /> Historial</NavLink>
            {isAdmin && (
              <>
                <NavLink to="/panel" className={linkClass}><BarChart3 size={18} /> Panel</NavLink>
                <NavLink to="/descuentos" className={linkClass}><Percent size={18} /> Descuentos</NavLink>
              </>
            )}
          </nav>
          <div className="hidden text-right text-sm leading-tight sm:block">
            <div className="font-semibold">{profile?.full_name || 'Usuario'}</div>
            <div className="text-haus-apoyo">{isAdmin ? 'Administrador' : 'Vendedor'}</div>
          </div>
          <SoundToggle />
          <button
            onClick={signOut}
            className="grid h-10 w-10 place-items-center rounded-full text-haus-blanco hover:bg-white/10"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
