import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { homeDe, ROL_CORTO } from '../../services/domain.jsx';

const SECCIONES = {
  '/admin/tablero': 'Tablero de métricas', '/admin/trabajos': 'Trabajos del periodo', '/admin/carga': 'Carga por asesor', '/admin/sustentaciones': 'Sustentaciones', '/admin/usuarios': 'Gestión de usuarios',
  '/asesor/asesorados': 'Mis asesorados', '/asesor/solicitudes': 'Solicitudes recibidas', '/asesor/revision': 'Bandeja de revisión', '/asesor/ficha': 'Mi ficha de asesor',
  '/mi-trabajo': 'Mi trabajo', '/mis-trabajos': 'Mis trabajos', '/entregables': 'Plan de entregables', '/retroalimentacion': 'Retroalimentación', '/mi-sustentacion': 'Mi sustentación',
};

export default function AccessDenied({ requeridos = ['admin'] }) {
  const { user } = useApp();
  const { pathname } = useLocation();
  const clave = Object.keys(SECCIONES).find((k) => pathname.startsWith(k));
  const req = requeridos.map((r) => ROL_CORTO[r]).join(' o ');
  return (
    <div className="card-tfc mx-auto text-center p-5" style={{ maxWidth: 640, marginTop: '4rem' }}>
      <div className="empty danger p-0"><div className="icon">⛔</div></div>
      <h1 className="mb-2">Acceso denegado</h1>
      <p className="text-muted2">La sección «{clave ? SECCIONES[clave] : 'solicitada'}» es exclusiva del rol {req}. Tu sesión tiene rol {ROL_CORTO[user.rol]}. Si crees que deberías tener acceso, escribe a tfc@ulima.edu.pe{user.codigo ? ' indicando tu código de alumno' : ''}.</p>
      <div className="card-tfc flat p-2 small text-muted2 mb-3">Ruta solicitada <b className="text-dark">{pathname}</b> · rol requerido <b className="text-dark">{req}</b> · rol actual <b className="text-dark">{ROL_CORTO[user.rol]}</b></div>
      <div className="d-flex gap-2 justify-content-center">
        <Link className="btn btn-primary" to={homeDe(user.rol)}>{user.rol === 'estudiante' ? 'Volver a mi trabajo' : 'Volver a mi inicio'}</Link>
        <a className="btn btn-outline-primary" href="mailto:tfc@ulima.edu.pe">Escribir a la coordinación</a>
      </div>
    </div>
  );
}
