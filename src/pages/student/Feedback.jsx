// HU-5 · Retroalimentación (índice) e historial de versiones por entregable.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { EmptyState, PageHeader, Tag } from '../../components/ui.jsx';
import { Comentario } from '../../components/WorkViews.jsx';

export function FeedbackIndex() {
  const { db, user } = useApp();
  const t = D.trabajoActivo(db, user.id);
  const es = t ? D.entregablesDe(db, t.id) : [];
  if (!t || !es.length) return <div className="card-tfc"><EmptyState title="Sin retroalimentación todavía" text="Cuando registres avances y tu asesor los revise, verás aquí el historial de cada entregable." action={<Link className="btn btn-primary" to="/entregables">Ir a mis entregables</Link>} /></div>;
  return (
    <>
      <PageHeader crumbs={[['Retroalimentación']]} title="Retroalimentación" subtitle="Historial de versiones y comentarios de tu asesor por entregable." />
      <div className="row g-3">
        {es.map((e) => { const i = D.infoEntregable(db, e, es); const nCom = D.avancesDe(db, e.id).reduce((s, a) => s + a.comentarios.length, 0); return (
          <div className="col-md-6 col-xl-4" key={e.id}><div className="card-tfc pad h-100 d-flex flex-column">
            <div className="d-flex justify-content-between mb-2"><Tag k={i.estado} /><span className="aux">Peso {e.peso}</span></div>
            <h3 className="mb-1">{e.orden}. {e.nombre}</h3>
            <div className="aux mb-3">{i.versiones ? `${i.versiones} versión(es) · ${nCom} comentario(s)` : 'Sin versiones'}</div>
            <Link to={`/retroalimentacion/${e.id}`} className={`btn mt-auto ${i.versiones ? 'btn-outline-primary' : 'btn-outline-secondary disabled'}`}>Ver historial de versiones</Link>
          </div></div>); })}
      </div>
    </>
  );
}

export function FeedbackHistory() {
  const { db, user, addComment, notify } = useApp();
  const { entregableId } = useParams();
  const [abiertas, setAbiertas] = useState(null);
  const [resp, setResp] = useState({});
  const t = D.trabajoActivo(db, user.id);
  const e = t && D.entregablesDe(db, t.id).find((x) => x.id === entregableId);
  if (!e) return <div className="card-tfc"><EmptyState title="Entregable no encontrado" action={<Link className="btn btn-primary" to="/retroalimentacion">Volver</Link>} /></div>;
  const es = D.entregablesDe(db, t.id);
  const info = D.infoEntregable(db, e, es);
  const vs = D.avancesDe(db, e.id).slice().reverse();
  const open = abiertas ?? (vs[0] ? [vs[0].id] : []);
  const toggle = (id) => setAbiertas(open.includes(id) ? open.filter((x) => x !== id) : [...open, id]);

  return (
    <>
      <PageHeader crumbs={[['Retroalimentación', '/retroalimentacion'], [`Entregable ${e.orden}`]]} title={`Historial de versiones · ${e.nombre}`} subtitle={`${vs.length} versiones · peso ${e.peso} · fecha límite ${fmt(e.fechaLimite)}`} actions={<><Tag k={info.estado} /><Link to="/entregables" className="btn btn-outline-primary">Volver al plan</Link></>} />
      <div className="row g-3">
        <div className="col-lg-8 col-xl-9 d-grid gap-2 align-content-start">
          {vs.length === 0 && <div className="card-tfc"><EmptyState title="Sin versiones" text="Aún no registras avances de este entregable." /></div>}
          {vs.map((a) => { const abierta = open.includes(a.id); const ult = a.version === vs[0].version; return (
            <div className={`card-tfc ${abierta && a.estado === 'aprobado' ? 'soft' : ''}`} key={a.id}>
              <button className="btn w-100 text-start d-flex justify-content-between align-items-center p-3" onClick={() => toggle(a.id)} aria-expanded={abierta}>
                <span><b>{abierta ? '▾' : '▸'} Versión {a.version}</b><span className="aux d-block">Entregada el {fmt(a.fechaEntrega)} · {a.retraso ? 'con retraso' : 'a tiempo'} · {a.comentarios.length} comentario(s)</span></span>
                <Tag k={a.estado === 'entregado' ? 'entregado' : a.estado} label={a.estado === 'aprobado' ? `Aprobada el ${fmt(a.fechaRevision)}` : a.estado === 'observado' ? `Observada el ${fmt(a.fechaRevision)}` : 'En revisión'} />
              </button>
              {abierta && (
                <div className="px-3 pb-3">
                  <div className="eyebrow mb-1">Descripción de lo entregado</div><p>{a.descripcion}</p>
                  <div className="card-tfc flat p-2 px-3 d-flex justify-content-between mb-3"><span className="text-truncate small">{a.enlace.replace('https://', '')}</span><a href={a.enlace} target="_blank" rel="noreferrer" className="fw-semibold small">Abrir</a></div>
                  {a.comentarios.map((c) => <Comentario key={c.id} db={db} c={c} />)}
                  {ult && a.estado !== 'aprobado' && (
                    <div className="d-flex gap-2 mt-2"><input className="form-control" placeholder="Responder a tu asesor…" value={resp[a.id] || ''} onChange={(x) => setResp({ ...resp, [a.id]: x.target.value })} /><button className="btn btn-outline-primary" onClick={() => { if ((resp[a.id] || '').trim().length < 5) return notify('danger', 'Escribe tu respuesta', 'El comentario es muy corto.'); addComment(a.id, resp[a.id], user); setResp({ ...resp, [a.id]: '' }); notify('success', 'Respuesta enviada', 'Tu asesor la verá en su bandeja.'); }}>Responder</button></div>
                  )}
                </div>
              )}
            </div>); })}
        </div>
        <div className="col-lg-4 col-xl-3 d-grid gap-3 align-content-start">
          <div className="card-tfc pad"><div className="eyebrow mb-2">Otros entregables</div>
            {es.filter((x) => x.id !== e.id).map((x) => { const n = D.avancesDe(db, x.id).length; return <div className="d-flex justify-content-between small py-1" key={x.id}><Link to={`/retroalimentacion/${x.id}`} className={n ? '' : 'text-muted2'}>{x.orden}. {x.nombre}</Link><b className={n ? 'text-ok' : 'text-muted2'}>{n ? `${n} versión${n > 1 ? 'es' : ''}` : 'Sin versiones'}</b></div>; })}</div>
          <div className="card-tfc flat pad"><div className="eyebrow mb-1">Cómo funciona el versionado</div><div className="small text-muted2">Cada avance registrado crea una versión nueva. Las versiones observadas quedan en el historial con su comentario; solo la última puede ser aprobada.</div></div>
        </div>
      </div>
    </>
  );
}
