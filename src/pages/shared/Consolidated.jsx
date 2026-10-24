// HU-5 · Vista consolidada del trabajo (línea de tiempo, avance, última retroalimentación).
// La usan el estudiante (/mi-trabajo/consolidado) y el asesor (/asesor/asesorados/:id).
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { Avatar, EmptyState, Progress, Tag } from '../../components/ui.jsx';
import { Timeline } from '../../components/WorkViews.jsx';

export default function Consolidated() {
  const { db, user } = useApp();
  const { id } = useParams();
  const esAsesor = user.rol === 'asesor';
  const t = id ? D.byId(db.trabajos, id) : D.trabajoActivo(db, user.id);
  const permitido = t && (esAsesor ? t.asesorId === user.id : user.rol === 'admin' || t.integrantes.includes(user.id));
  if (!permitido) return <div className="card-tfc"><EmptyState title="Trabajo no disponible" text="No encontramos este trabajo o no tienes permiso para verlo." action={<Link to="/" className="btn btn-primary">Ir al inicio</Link>} /></div>;

  const pct = D.avanceTrabajo(db, t.id);
  const es = D.entregablesDe(db, t.id);
  const al = D.alertasTrabajo(db, t.id);
  const retro = D.ultimaRetro(db, t.id);
  const asesor = D.byId(db.usuarios, t.asesorId);
  const aprobados = es.filter((e) => D.aprobadoE(db, e)).length;
  const base = esAsesor ? `/asesor` : '';

  return (
    <>
      <div className="card-tfc pad mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2"><Tag k={t.estado} /><span className="aux">{t.codigo} · {t.linea} · asesor {asesor ? D.nombreAsesor(asesor) : 'sin asignar'}</span></div>
        <h1 className="mb-3">{t.titulo}</h1>
        <div className="d-flex align-items-center gap-3 border-top pt-3">
          <span className="eyebrow">Avance</span><Progress value={pct} className="flex-grow-1" /><span className="pct">{pct}%</span>
          <span className="aux">{aprobados} de {es.length} entregables aprobados{al.vencidos.length ? ` · ${al.vencidos.length} vencido sin presentar` : ''}</span>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-lg-8 col-xl-9">
          <div className="card-tfc pad">
            <h2 className="mb-3">Línea de tiempo del trabajo</h2>
            {es.length ? <Timeline db={db} trabajo={t} historialTo={esAsesor ? null : (e) => `/retroalimentacion/${e.id}`} /> : <EmptyState title="Aún no hay plan definido" text="El plan de entregables se habilita cuando un asesor acepta el trabajo." />}
          </div>
        </div>
        <div className="col-lg-4 col-xl-3 d-grid gap-3 align-content-start">
          <div className="card-tfc pad">
            <div className="eyebrow mb-2">Última retroalimentación</div>
            {retro ? (
              <>
                <div className="d-flex justify-content-between mb-2"><b>{retro.e.nombre} · v{retro.a.version}</b><Tag k={retro.a.estado} /></div>
                <div className="quote green mb-2">«{retro.c.texto}»</div>
                <div className="aux mb-2">{D.nombreAsesor(D.byId(db.usuarios, retro.c.autorId))} · {fmt(retro.c.fecha)}</div>
                {!esAsesor && <Link to="/retroalimentacion" className="btn btn-outline-primary w-100">Ver todas las revisiones</Link>}
              </>
            ) : <div className="text-muted2 small">Aún no hay comentarios del asesor.</div>}
          </div>
          {al.vencidos.length > 0 && (
            <div className="card-tfc warn pad">
              <div className="fw-bold text-warn2">{esAsesor ? 'Entregable vencido' : 'Tienes un entregable vencido'}</div>
              <div className="small text-warn2 my-2">{al.vencidos[0].e.nombre} venció el {fmt(al.vencidos[0].e.fechaLimite)}.</div>
              {!esAsesor && <Link to="/entregables" className="btn btn-warn w-100">Registrar avance ahora</Link>}
            </div>
          )}
          <div className="card-tfc pad">
            <div className="eyebrow mb-2">Equipo y asesor</div>
            {asesor && <div className="d-flex gap-2 align-items-center rowline"><Avatar name={D.nombreAsesor(asesor)} /><div><div className="fw-semibold">{D.nombreAsesor(asesor)}</div><div className="aux">Asesor · responde en {asesor.tiempoRevision} días</div></div></div>}
            {t.integrantes.map((i) => { const u = D.byId(db.usuarios, i); return <div className="d-flex gap-2 align-items-center rowline" key={i}><Avatar name={D.nombreCompleto(u)} /><div><div className="fw-semibold">{D.nombreCompleto(u)}</div><div className="aux">{t.responsableId === i ? 'Responsable' : 'Integrante'}</div></div></div>; })}
          </div>
          {esAsesor && <Link to={`${base}/asesorados/${t.id}/plan`} className="btn btn-outline-primary">Definir / editar el plan</Link>}
        </div>
      </div>
    </>
  );
}
