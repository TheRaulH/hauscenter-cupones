import { Navigate, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

function Splash() {
  return (
    <div className="grid min-h-screen place-items-center bg-haus-azul">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-haus-arena/30 border-t-haus-naranja" aria-label="Cargando" />
    </div>
  );
}

function NoAccess() {
  const { signOut } = useAuth();
  return (
    <div className="grid min-h-screen place-items-center bg-haus-azul p-6 text-center text-haus-blanco">
      <div className="max-w-sm space-y-5">
        <BrandLogo variant="blanco" height={48} className="mx-auto" />
        <h1 className="text-2xl font-bold">Tu usuario aún no tiene acceso</h1>
        <p className="text-haus-apoyo">
          Tu cuenta no tiene un perfil activo. Pide al administrador que la habilite y vuelve a ingresar.
        </p>
        <button onClick={signOut} className="btn-soft mx-auto">
          <LogOut size={18} /> Salir
        </button>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ roles }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <Splash />;
  if (!session) return <Navigate to="/login" replace />;
  if (!profile || !profile.active) return <NoAccess />;
  if (roles && !roles.includes(profile.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
