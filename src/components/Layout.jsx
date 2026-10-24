// Marco común de todas las páginas: cabecera (72px), barra de navegación propia del rol (56px), contenido y pie.
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import * as D from '../services/domain.jsx';
import { fmt } from '../services/dates.jsx';
import { Avatar, RolePill, Toasts } from './ui.jsx';

const NAV = {
  publico: [['Inicio', '/', true], ['El proceso', '/proceso'], ['Directorio de asesores', '/asesores'], ['Cronograma', '/cronograma'], ['Preguntas frecuentes', '/faq']],
  estudiante: [['Mi trabajo', '/mi-trabajo'], ['Entregables', '/entregables'], ['Retroalimentación', '/retroalimentacion'], ['Directorio de asesores', '/asesores'], ['Mi sustentación', '/mi-sustentacion'], ['Mi cuenta', '/cuenta']],
  asesor: [['Mis asesorados', '/asesor/asesorados'], ['Solicitudes', '/asesor/solicitudes', false, 'sol'], ['Bandeja de revisión', '/asesor/revision', false, 'rev'], ['Mi ficha', '/asesor/ficha'], ['Mi cuenta', '/cuenta']],
  admin: [['Tablero', '/admin/tablero'], ['Trabajos', '/admin/trabajos'], ['Carga por asesor', '/admin/carga'], ['Sustentaciones', '/admin/sustentaciones'], ['Usuarios', '/admin/usuarios'], ['Mi cuenta', '/cuenta']],
};

export default function AppLayout() {
  const { user, db, logout, toasts, dismiss } = useApp();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const rol = user ? user.rol : 'publico';
  const etapa = D.etapaActual();

  let items = [...NAV[rol]];
  if (rol === 'publico') {
    if (pathname === '/login') items.push(['Iniciar sesión', '/login']);
    if (pathname.startsWith('/registro')) items.push(['Crear cuenta', pathname]);
    if (pathname.startsWith('/recuperar')) items.push(['Recuperar contraseña', '/recuperar']);
  }
  const counts = {};
  let headRight = null;
  let sinAsesor = false; // sin trabajo o sin asesor: Entregables, Retroalimentación y Mi sustentación aún no aplican
  let sessionLine = 'Sin sesión';
  let navRight = `Semestre 2026-2 · etapa ${etapa.n} de 5 en curso`;

  if (rol === 'estudiante') {
    const t = D.trabajoActivo(db, user.id);
    const pct = t ? D.avanceTrabajo(db, t.id) : 0;
    sinAsesor = !t || !t.asesorId;
    headRight = t ? (
      <span className="chip"><span className="text-truncate" style={{ maxWidth: 240 }}>{t.titulo}</span><span className="mini-bar"><span style={{ width: `${pct}%` }} /></span><b>{pct}%</b></span>
    ) : <span className="chip gray">Sin trabajo registrado</span>;
    navRight = `Etapa ${etapa.n} de 5 · ${fmt(etapa.ini).slice(0, 5)} – ${fmt(etapa.fin).slice(0, 5)}`;
    sessionLine = `Sesión iniciada como ${D.nombreCompleto(user)} · rol Estudiante${t ? ` · ${t.codigo}` : ''}`;
  } else if (rol === 'asesor') {
    const c = D.cupoAsesor(db, user);
    counts.sol = db.solicitudes.filter((s) => s.asesorId === user.id && s.estado === 'pendiente').length;
    counts.rev = D.pendientesRevision(db, user.id).length;
    headRight = <span className="chip">Cupo disponible <b className="text-ok">{c.disponible} de {c.max}</b></span>;
    sessionLine = `Sesión iniciada como ${D.nombreAsesor(user)} · rol Asesor · cupo ${c.disponible} de ${c.max} disponible`;
    navRight = 'Semestre 2026-2';
  } else if (rol === 'admin') {
    headRight = <span className="chip gray">Periodo <b className="text-dark">2026-2</b></span>;
    sessionLine = `Sesión iniciada como ${D.nombreCompleto(user)} · rol Administrador · coordinación TFC 2026-2`;
    navRight = `Etapa ${etapa.n} de 5 en curso`;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <header className="app-header d-flex align-items-center">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 w-100 px-3 px-xl-5 py-2" style={{ maxWidth: 1760, margin: '0 auto' }}>
          <Link to="/" className="d-flex align-items-center gap-3 text-decoration-none">
            <span className="brand-mark">Tf</span>
            <span><span className="serif d-block fw-bold" style={{ fontSize: '1.1rem', lineHeight: 1.1 }}>Trabajos de Fin de Carrera{rol === 'admin' ? ' · Administración' : ''}</span><span className="aux">Universidad de Lima · Facultad de Ingeniería</span></span>
          </Link>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {headRight}
            {user ? (
              <>
                <span className={`role-pill ${rol}`}>{D.ROL_CORTO[rol]}</span>
                <div className="d-flex align-items-center gap-2">
                  <Avatar name={D.nombreCompleto(user)} size={40} dark />
                  <div style={{ lineHeight: 1.2 }}>
                    <div className="fw-semibold small">{D.nombreCompleto(user)}</div>
                    <div className="aux">{rol === 'estudiante' ? `${user.codigo} · ${D.carreraCorta(user.carrera)}` : rol === 'asesor' ? `Dpto. ${D.carreraCorta(user.departamento)}` : 'Coordinación TFC'}</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="tag" style={{ background: '#efeaf8', color: '#5b4b8a' }}>Visitante · sin sesión</span>
                {pathname !== '/login' && <Link to="/login" className="btn btn-outline-primary">Iniciar sesión</Link>}
                {pathname === '/' || pathname === '/login' ? <Link to="/registro/estudiante" className="btn btn-primary">Crear cuenta</Link> : null}
              </>
            )}
          </div>
        </div>
      </header>

      <nav className="app-nav" aria-label="Navegación principal">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 w-100 px-3 px-xl-5" style={{ maxWidth: 1760, margin: '0 auto' }}>
          <div className="d-flex flex-wrap">
            {items.map(([l, to, end, cnt]) => (
              rol === 'estudiante' && sinAsesor && ['Entregables', 'Retroalimentación', 'Mi sustentación'].includes(l)
                ? <span key={l} className="nav-off" aria-disabled="true" title="Se habilita cuando tu trabajo tenga asesor">{l}</span>
                : <NavLink key={l} to={to} end={end}>{l}{cnt && counts[cnt] > 0 && <span className="nav-count">{counts[cnt]}</span>}</NavLink>
            ))}
          </div>
          <div className="nav-right d-flex align-items-center gap-3">
            <span>{navRight}</span>
            {user && <button onClick={() => { logout(); nav('/'); }}>Cerrar sesión</button>}
          </div>
        </div>
      </nav>

      <main className="page flex-grow-1 w-100"><Outlet /></main>

      <footer className="app-footer d-flex align-items-center">
        <div className="d-flex flex-wrap justify-content-between gap-2 w-100 px-3 px-xl-5 py-3" style={{ maxWidth: 1760, margin: '0 auto' }}>
          <span>{user ? sessionLine : 'Universidad de Lima · Facultad de Ingeniería · Oficina de Trabajos de Fin de Carrera · Av. Javier Prado Este 4600, Santiago de Surco'}</span>
          <span className="d-flex gap-3"><a href="#reglamento" onClick={(e) => e.preventDefault()}>Reglamento TFC</a><a href="mailto:tfc@ulima.edu.pe">tfc@ulima.edu.pe</a><span>© 2026 Universidad de Lima</span></span>
        </div>
      </footer>
      <Toasts toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
