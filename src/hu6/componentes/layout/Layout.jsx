// Estructura común de cada página: cabecera 72 px · navegación 56 px · contenido · pie 84 px
import { USAR_LAYOUT_PROPIO } from "../../config";
import { ADMIN, ESTUDIANTE } from "../../data/sesion";
import Enlace from "../Enlace";
import { iniciales, nombreCompleto } from "../../utils/personas";

const NAVEGACION = {
  admin: [
    { texto: "Tablero" },
    { texto: "Trabajos" },
    { texto: "Carga por asesor" },
    { texto: "Sustentaciones", ruta: "/sustentaciones/programar", activo: true },
    { texto: "Usuarios" },
    { texto: "Mi cuenta" },
  ],
  estudiante: [
    { texto: "Mi trabajo" },
    { texto: "Entregables" },
    { texto: "Retroalimentación" },
    { texto: "Directorio de asesores" },
    { texto: "Mi sustentación", ruta: "/mi-sustentacion", activo: true },
    { texto: "Mi cuenta" },
  ],
};

const PERFIL = {
  admin: {
    marca: "Trabajos de Fin de Carrera · Administración",
    sub: "Universidad de Lima · Facultad de Ingeniería",
    badge: "Administrador",
    usuario: ADMIN,
    detalle: ADMIN.cargo,
  },
  estudiante: {
    marca: "Trabajos de Fin de Carrera",
    sub: "Universidad de Lima · Facultad de Ingeniería",
    badge: "Estudiante",
    usuario: ESTUDIANTE,
    detalle: `${ESTUDIANTE.codigo} · ${ESTUDIANTE.carrera}`,
  },
};

export default function Layout({ rol, contexto, estadoNav, pie, children }) {
  // Con el Layout del grupo solo se dibuja el contenido de la pantalla.
  if (!USAR_LAYOUT_PROPIO) return <main className="contenido">{children}</main>;
  const perfil = PERFIL[rol];
  return (
    <div className="app no-print-bg">
      <header className="cabecera no-print">
        <div className="marca">
          <span className="marca__logo">Tf</span>
          <div>
            <p className="marca__titulo">{perfil.marca}</p>
            <p className="marca__sub">{perfil.sub}</p>
          </div>
        </div>
        <div className="cabecera__der">
          {contexto && <div className="chip-contexto">{contexto}</div>}
          <span className={`badge-rol badge-rol--${rol}`}>{perfil.badge}</span>
          <div className="usuario">
            <span className="avatar">{iniciales(perfil.usuario)}</span>
            <div>
              <p className="usuario__nombre">{`${perfil.usuario.nombres.split(" ")[0]} ${perfil.usuario.apellidos}`}</p>
              <p className="usuario__detalle">{perfil.detalle}</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="navegacion no-print" aria-label="Navegación principal">
        <ul>
          {NAVEGACION[rol].map((item) => (
            <li key={item.texto}>
              {item.ruta ? (
                <Enlace a={item.ruta} className={`navegacion__item ${item.activo ? "navegacion__item--activo" : ""}`}>{item.texto}</Enlace>
              ) : (
                <span className="navegacion__item navegacion__item--inerte" title="Pantalla de otra historia de usuario">{item.texto}</span>
              )}
            </li>
          ))}
        </ul>
        <div className="navegacion__der">
          {estadoNav && <span>{estadoNav}</span>}
          <span className="navegacion__cerrar">Cerrar sesión</span>
        </div>
      </nav>

      <main className="contenido">{children}</main>

      <footer className="pie no-print">
        <span>{pie ?? `Sesión iniciada como ${nombreCompleto(perfil.usuario)} · rol ${perfil.badge}`}</span>
        <span className="pie__links">
          <Enlace a="/">Reglamento TFC</Enlace>
          <a href="mailto:tfc@ulima.edu.pe">tfc@ulima.edu.pe</a>
          <span>© 2026 Universidad de Lima</span>
        </span>
      </footer>
    </div>
  );
}
