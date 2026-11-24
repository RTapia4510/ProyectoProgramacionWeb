// HU-1 · Landing pública: proceso en 5 etapas, asesores con cupo y cronograma.
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { ETAPAS } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { fmt, HOY } from '../../services/dates.jsx';
import { Avatar, LineTags } from '../../components/ui.jsx';

export default function Landing() {
  const { db, user } = useApp();
  const etapa = D.etapaActual();
  const asesores = db.usuarios.filter((u) => u.rol === 'asesor' && u.estado === 'activo').map((a) => ({ a, c: D.cupoAsesor(db, a) }));
  const conCupo = asesores.filter((x) => x.c.disponible > 0).sort((x, y) => y.c.disponible - x.c.disponible);
  const corto = (s) => fmt(s).slice(0, 5);
  const estado = (n) => (n < etapa.n ? 'done' : n === etapa.n ? 'now' : 'todo');
  return (
    <>
      <section className="hero mb-3">
        <div className="row g-4 align-items-center">
          <div className="col-lg-7">
            <div className="eyebrow accent mb-2">Semestre 2026-2 · etapa {etapa.n} de 5: {etapa.nombre.toLowerCase()} hasta el {fmt(etapa.fin)}</div>
            <h1 className="mb-3">Del registro de la propuesta hasta la sustentación, en un solo lugar</h1>
            <p className="fs-6 mb-4">Registra tu trabajo, solicita asesor entre quienes tienen cupo disponible, entrega tus avances y sigue la retroalimentación con fechas límite claras.</p>
            <div className="d-flex gap-2 flex-wrap">
              <Link to={user?.rol === 'estudiante' ? '/mi-trabajo/nuevo' : '/registro/estudiante'} className="btn btn-primary btn-lg">Registrar mi trabajo</Link>
              <Link to="/asesores" className="btn btn-outline-primary btn-lg bg-white">Ver directorio de asesores</Link>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card-tfc pad">
              <div className="eyebrow mb-3">El proceso en 5 etapas</div>
              {[['Registro del trabajo y del equipo', 1], ['Solicitud y asignación de asesor', 2], ['Plan de entregables', 3], ['Revisión de avances', 4], ['Sustentación y acta', 5]].map(([l, n]) => (
                <div className={`mb-2 ${estado(n) === 'now' ? 'fw-semibold' : estado(n) === 'todo' ? 'text-muted2' : ''}`} key={n}><span className={`dot ${estado(n)}`} />{l}{estado(n) === 'now' && ' · etapa en curso'}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card-tfc pad h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div><h2 className="mb-0">Asesores con cupo disponible</h2><div className="aux">Actualizado al {fmt(HOY)} · {conCupo.length} de {asesores.length} asesores</div></div>
              <Link to="/asesores" className="fw-semibold">Ver el directorio completo</Link>
            </div>
            <div className="row g-3">
              {conCupo.slice(0, 3).map(({ a, c }) => (
                <div className="col-md-4" key={a.id}>
                  <div className="card-tfc p-3 h-100">
                    <div className="d-flex gap-2 align-items-center mb-2"><Avatar name={D.nombreAsesor(a)} /><div><div className="fw-semibold small">{D.nombreAsesor(a)}</div><div className="aux">{D.carreraCorta(a.departamento)}</div></div></div>
                    <LineTags items={a.lineas.slice(0, 1)} />
                    <div className="small">Cupo <b className="text-ok">{c.disponible} de {c.max}</b></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card-tfc pad h-100">
            <h2 className="mb-3">Cronograma 2026-2</h2>
            {ETAPAS.map((e) => (
              <div className={`stage ${estado(e.n)}`} key={e.n}>
                <div className="eyebrow" style={estado(e.n) === 'now' ? { color: 'var(--c-accent)' } : null}>Etapa {e.n}{estado(e.n) === 'done' ? ' · cerrada' : estado(e.n) === 'now' ? ' · en curso' : ''}</div>
                <div className={estado(e.n) === 'todo' ? 'text-muted2' : 'fw-semibold'}>{e.nombre} · {corto(e.ini)} – {corto(e.fin)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
