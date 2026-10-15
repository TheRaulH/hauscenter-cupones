import { Navigate, Route, Routes } from 'react-router-dom';
import { isConfigured } from './lib/supabase';
import SetupNotice from './components/SetupNotice';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Generator from './pages/Generator';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Discounts from './pages/Discounts';
import Sorteo from './pages/Sorteo';
import Canjear from './pages/Canjear';

export default function App() {
  if (!isConfigured) return <SetupNotice />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Generator />} />
          <Route path="canjear" element={<Canjear />} />
          <Route path="historial" element={<History />} />
          <Route path="sorteo" element={<Sorteo />} />
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="panel" element={<Dashboard />} />
            <Route path="descuentos" element={<Discounts />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
