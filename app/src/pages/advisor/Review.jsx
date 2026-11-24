// HU-5 · Revisión de un avance: aprobar (suma puntos) u observar (comentario obligatorio).
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { EmptyState, Field, PageHeader, Progress, Tag, inv } from '../../components/ui.jsx';
import { Comentario } from '../../components/WorkViews.jsx';

export default function Review() {
  const { db, user, reviewAvance, notify } = useApp();
  const { avanceId } = useParams();
  const nav = useNavigate();
  const [txt, setTxt] = useState('');
  const [err, setErr] = useState('');
  const [res, setRes] = useState(null); // {decision, antes}
  const a = D.byId(db.avances, avanceId);
  const e = a && D.byId(db.entregables, a.entregableId);
  const t = e && D.byId(db.trabajos, e.trabajoId);
  if (!a || !t || t.asesorId !== user.id) return <div className="card-tfc"><EmptyState title="Avance no disponible" action={<Link className="btn btn-primary" to="/asesor/revision">Volver a la bandeja</Link>} /></div>;

  const pend = D.pendientesRevision(db, user.id);
  const idx = pend.findIndex((x) => x.a.id === a.id);
  const sig = pend.find((x) => x.a.id !== a.id && (idx < 0 || pend.indexOf(x) > idx)) || pend.find((x) => x.a.id !== a.id);
  const ant = idx > 0 ? pend[idx - 1] : null;
  const siguiente = idx >= 0 && idx < pend.length - 1 ? pend[idx + 1] : null;
  const previas = D.avancesDe(db, e.id).filter((v) => v.version < a.version);
  const resp = D.byId(db.usuarios, t.responsableId);
  const pendiente = a.estado === 'entregado';
  const pct = D.avanceTrabajo(db, t.id);

  const decidir = (decision) => {
    if (decision === 'observado' && txt.trim().length < 30) return setErr(`Para observar un avance debes indicar qué corregir. Mínimo 30 caracteres · ${txt.trim().length} / 800`);
    const antes = pct;
    const r = reviewAvance(a.id, decision, txt, user.id);
    if (!r.ok) return setErr(r.error);
    setRes({ decision, antes });
    notify('success', decision === 'aprobado' ? 'Avance aprobado' : 'Avance observado', 'Se notificó al equipo.');
  };

  if (res) {
    const ok = res.decision === 'aprobado';
    return (
      <div className="card-tfc pad mx-auto" style={{ maxWidth: 640 }}>
        <div className="d-flex justify-content-between mb-3"><h2 className="mb-0">{e.nombre} · v{a.version}</h2><Tag k={res.decision} /></div>
        <div className={`card-tfc ${ok ? 'soft' : 'warn'} p-2 small mb-3 ${ok ? '' : 'text-warn2'}`}>{ok ? `Aprobado el ${fmt(D.HOY)}. El avance del trabajo pasó de ${res.antes}% a ${pct}% y se notificó al equipo.` : `Observado el ${fmt(D.HOY)}. El estudiante debe registrar la versión ${a.version + 1}${e.fechaLimite >= D.HOY ? ` antes del ${fmt(e.fechaLimite)}` : ' cuanto antes'}.`}</div>
        {txt.trim() && <><div className="eyebrow mb-1">{ok ? 'Comentario' : 'Qué debe corregirse'}</div><div className={`quote ${ok ? 'green' : 'accent'} mb-3`}>{txt.trim()}</div></>}
        {ok ? <div className="d-flex align-items-center gap-2 mb-3"><Progress value={pct} className="flex-grow-1" /><b>{pct}%</b></div> : <div className="aux mb-3">El avance del trabajo se mantiene en {pct}%. El entregable no suma puntos hasta ser aprobado.</div>}
        <div className="d-flex justify-content-end gap-2"><Link to="/asesor/revision" className="btn btn-outline-primary">Volver a la bandeja</Link>{sig ? <Link to={`/asesor/revision/${sig.a.id}`} onClick={() => { setRes(null); setTxt(''); }} className="btn btn-primary">Revisar el siguiente</Link> : <Link to={`/asesor/asesorados/${t.id}`} className="btn btn-primary">Ver el trabajo</Link>}</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader crumbs={[['Bandeja de revisión', '/asesor/revision'], ['Avance']]} title={`${e.nombre} · versión ${a.version}`}
        actions={idx >= 0 ? <span className="small"><button className="btn btn-link btn-sm" disabled={!ant} onClick={() => ant && nav(`/asesor/revision/${ant.a.id}`)}>‹ Anterior</button> {idx + 1} de {pend.length} <button className="btn btn-link btn-sm" disabled={!siguiente} onClick={() => siguiente && nav(`/asesor/revision/${siguiente.a.id}`)}>Siguiente ›</button></span> : null} />
      <div className="row g-3">
        <div className="col-lg-6 d-grid gap-3 align-content-start">
          <div className="card-tfc pad">
            <div className="d-flex justify-content-between mb-3"><h2 className="mb-0">Datos del avance</h2><Tag k={pendiente ? 'entregado' : a.estado} label={pendiente ? 'En revisión' : undefined} /></div>
            <div className="eyebrow">Trabajo</div><div className="serif mb-3">{t.titulo}</div>
            <div className="row g-3 mb-3">{[['Entregado', `${fmt(a.fechaEntrega)} · ${a.retraso ? 'con retraso' : 'a tiempo'}`], ['Fecha límite', fmt(e.fechaLimite)], ['Peso', e.peso], ['Registró', D.nombreCompleto(resp)]].map(([l, v]) => <div className="col-6" key={l}><div className="eyebrow">{l}</div>{v}</div>)}</div>
            <div className="eyebrow">Descripción de lo entregado</div><p>{a.descripcion}</p>
            <div className="eyebrow">Documento</div>
            <div className="card-tfc flat p-2 px-3 d-flex justify-content-between align-items-center"><span className="text-truncate small">{a.enlace.replace('https://', '')}</span><a className="btn btn-primary btn-sm" href={a.enlace} target="_blank" rel="noreferrer">Abrir documento</a></div>
          </div>
          <div className="card-tfc pad"><div className="eyebrow mb-2">Versiones anteriores</div>
            {previas.length === 0 && <div className="small text-muted2">Esta es la primera versión.</div>}
            {previas.map((v) => <div className="card-tfc p-2 px-3 d-flex justify-content-between mb-2" key={v.id}><div><b>Versión {v.version}</b><div className="aux">Entregada el {fmt(v.fechaEntrega)} · {v.comentarios.length} comentario(s)</div></div><Tag k={v.estado} label={`${D.TAGS[v.estado][0]} el ${fmt(v.fechaRevision)}`} /></div>)}
            {pendiente && <div className="aux mt-2">Al aprobar la versión {a.version}, el entregable queda cerrado y suma {e.peso} puntos al avance del trabajo.</div>}</div>
        </div>
        <div className="col-lg-6">
          <div className="card-tfc pad">
            <h2 className="mb-3">Comentarios</h2>
            {a.comentarios.length === 0 && <div className="small text-muted2 mb-3">Aún no hay comentarios en esta versión.</div>}
            {a.comentarios.map((c) => <Comentario key={c.id} db={db} c={c} />)}
            {pendiente ? (
              <>
                <Field label="Qué debe corregirse" error={err} hint={`Obligatorio si observas el avance. Sé específico: capítulo, página y qué falta. · ${txt.trim().length} / 800`} className="mt-4 mb-3"><textarea className={`form-control${inv(err)}`} rows={5} maxLength={800} value={txt} onChange={(x) => { setTxt(x.target.value); setErr(''); }} placeholder="Escribe tu retroalimentación…" /></Field>
                <div className="row g-2"><div className="col"><button className="btn btn-primary w-100 py-2" onClick={() => decidir('aprobado')}>Aprobar avance</button></div><div className="col"><button className="btn btn-outline-accent w-100 py-2" onClick={() => decidir('observado')}>Observar avance</button></div></div>
                <div className="aux mt-2">Aprobar suma {e.peso} puntos al avance del trabajo ({pct}% → {Math.min(100, pct + Math.round((e.peso * 100) / D.entregablesDe(db, t.id).reduce((s, x) => s + x.peso, 0)))}%). Observar exige comentario y habilita una nueva versión al estudiante.</div>
              </>
            ) : <div className="card-tfc flat p-2 small mt-3 text-muted2">Este avance ya fue revisado el {fmt(a.fechaRevision)}.</div>}
          </div>
        </div>
      </div>
    </>
  );
}
