// Protección de rutas por rol (HU-1): sin sesión → login; rol incorrecto → vista de acceso denegado.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import AccessDenied from '../pages/shared/AccessDenied.jsx';
export { homeDe } from '../services/domain.jsx';

export function RequireRole({ roles }) {
  const { user } = useApp();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (!roles.includes(user.rol)) return <AccessDenied requeridos={roles} />;
  return <Outlet />;
}

