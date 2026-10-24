// Piezas de trabajo compartidas entre roles: línea de tiempo de entregables y tarjeta de avance.
import { Link } from 'react-router-dom';
import * as D from '../services/domain.jsx';
import { fmt } from '../services/dates.jsx';
import { Tag } from './ui.jsx';

// Línea de tiempo. `acciones(e, info)` permite al rol inyectar botones por entregable.
export function Timeline({ db, trabajo, acciones, historialTo }) {
  const es = D.entregablesDe(db, trabajo.id);
  return (
    <div className="timeline">
      {es.map((e) => {
        const i = D.infoEntregable(db, e, es);
        const u = i.ultimo;
        const detalle = i.bloqueado
          ? `Fecha límite ${fmt(e.fechaLimite)} · se habilita al aprobar los entregables previos`
          : u
            ? `Límite ${fmt(e.fechaLimite)} · entregado el ${fmt(u.fechaEntrega)} · versión ${u.version}${u.estado === 'aprobado' ? ` aprobada el ${fmt(u.fechaRevision)}` : u.estado === 'observado' ? ` observada el ${fmt(u.fechaRevision)}` : ' · en revisión'}`
            : `Fecha límite ${fmt(e.fechaLimite)}`;
        const cuerpo = (
          <div className="d-flex flex-wrap justify-content-between gap-3">
            <div className={i.bloqueado ? 'text-muted2' : ''}>
              <div className="d-flex align-items-center gap-2 mb-1"><Tag k={i.estado} /><span className="aux">Peso {e.peso}{e.obligatorio ? ' · obligatorio' : ''}</span></div>
              <div className="tl-title">{e.orden}. {e.nombre}</div>
              <div className={`small ${i.estado === 'vencido' ? 'text-danger2' : 'text-muted2'}`}>
                {i.estado === 'vencido' ? `Fecha límite ${fmt(e.fechaLimite)} · ${i.diasRetraso} días de retraso · sin avances registrados` : detalle}
              </div>
              {i.estado === 'vencido' && <div className="small text-muted2 mt-1">Debes registrar el avance cuanto antes; tu asesor ve el retraso en su bandeja.</div>}
            </div>
            <div className="d-flex flex-column gap-2 align-items-end">
              {historialTo && i.versiones > 0 && <Link to={historialTo(e)} className="small fw-semibold">Ver historial</Link>}
              {i.bloqueado && <span className="small text-muted2 fw-semibold">Bloqueado</span>}
              {acciones && acciones(e, i)}
            </div>
          </div>
        );
        return (
          <div className="tl-item" key={e.id}>
            <span className={`tl-dot ${i.estado}`} />
            {i.estado === 'vencido' ? <div className="tl-box vencido">{cuerpo}</div> : cuerpo}
          </div>
        );
      })}
    </div>
  );
}

export const Comentario = ({ db, c }) => {
  const a = D.byId(db.usuarios, c.autorId);
  const esAsesor = c.rol === 'asesor';
  return (
    <div className="mb-2 p-3 rounded" style={{ background: esAsesor ? '#fafaf6' : 'var(--c-primary-soft)', border: esAsesor ? '1px solid var(--c-border)' : '1px solid var(--c-primary)' }}>
      <div className="d-flex justify-content-between"><span className="fw-semibold small">{esAsesor ? D.nombreAsesor(a) : D.nombreCompleto(a)} · {esAsesor ? 'asesor' : c.rol === 'admin' ? 'coordinación' : 'estudiante'}</span><span className="aux">{fmt(c.fecha)}</span></div>
      <div>{c.texto}</div>
    </div>
  );
};
