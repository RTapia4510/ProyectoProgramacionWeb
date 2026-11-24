// HU-4 · Definir el plan de entregables con control de pesos (deben sumar exactamente 100).
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { SEMESTRE } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { ConfirmModal, EmptyState, Field, PageHeader, Tag, inv } from '../../components/ui.jsx';

const VACIO = { nombre: '', descripcion: '', fechaLimite: '', peso: '', obligatorio: true };

export default function PlanEditor() {
  const { db, user, addEntregable, updateEntregable, deleteEntregable, applyTemplate, notify } = useApp();
  const { id } = useParams();
  const nav = useNavigate();
  const [f, setF] = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState({});
  const [del, setDel] = useState(null);
  const t = D.byId(db.trabajos, id);
  if (!t || t.asesorId !== user.id) return <div className="card-tfc"><EmptyState title="Trabajo no disponible" text="Solo puedes definir el plan de tus asesorados." action={<Link to="/asesor/asesorados" className="btn btn-primary">Volver a mis asesorados</Link>} /></div>;

  const es = D.entregablesDe(db, t.id);
  const suma = D.sumaPesos(db, t.id, editId);
  const peso = Number(f.peso) || 0;
  const total = suma + peso;
  const tone = total > 100 ? 'danger' : total === 100 ? 'ok' : 'warn';
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const reset = () => { setF(VACIO); setEditId(null); setErr({}); };

  const guardar = () => {
    const e = {};
    if (f.nombre.trim().length < 3) e.nombre = 'Escribe el nombre del entregable';
    if (f.descripcion.trim().length < 10) e.descripcion = 'Describe el entregable (mínimo 10 caracteres)';
    if (!f.fechaLimite) e.fechaLimite = 'Elige una fecha límite';
    else if (f.fechaLimite < SEMESTRE.ini || f.fechaLimite > SEMESTRE.fin) e.fechaLimite = 'Debe caer dentro del semestre 2026-2';
    if (!Number.isInteger(peso) || peso < 5 || peso > 40) e.peso = 'Entre 5 y 40';
    else if (total > 100) e.peso = `Con este peso el plan suma ${total}`;
    setErr(e);
    if (Object.keys(e).length) return;
    const datos = { nombre: f.nombre.trim(), descripcion: f.descripcion.trim(), fechaLimite: f.fechaLimite, peso, obligatorio: f.obligatorio };
    const r = editId ? updateEntregable(editId, datos) : addEntregable(t.id, datos);
    if (!r.ok) return notify('danger', 'No se puede guardar el entregable', r.error);
    notify('success', editId ? 'Entregable actualizado' : 'Entregable agregado', editId ? 'Si cambió la fecha límite, se notificó al equipo.' : `La suma de pesos del plan es ${total}.`);
    reset();
  };
  const editar = (e) => { setEditId(e.id); setF({ nombre: e.nombre, descripcion: e.descripcion, fechaLimite: e.fechaLimite, peso: String(e.peso), obligatorio: e.obligatorio }); setErr({}); };

  return (
    <>
      <PageHeader crumbs={[['Mis asesorados', '/asesor/asesorados'], [t.titulo.slice(0, 32) + '…'], ['Plan de entregables']]} title="Definir el plan de entregables" subtitle="Los pesos deben sumar exactamente 100. El avance del trabajo se calcula con el peso de los entregables aprobados." />
      <div className="row g-3">
        <div className="col-lg-5">
          <div className="card-tfc pad">
            <h2 className="mb-3">{editId ? 'Editar entregable' : 'Nuevo entregable'}</h2>
            <Field label="Nombre" error={err.nombre} className="mb-3"><input className={`form-control${inv(err.nombre)}`} value={f.nombre} onChange={set('nombre')} /></Field>
            <Field label="Descripción" error={err.descripcion} className="mb-3"><textarea className={`form-control${inv(err.descripcion)}`} rows={3} value={f.descripcion} onChange={set('descripcion')} /></Field>
            <div className="row g-3 mb-3">
              <Field className="col-7" label="Fecha límite" error={err.fechaLimite} hint="Debe caer dentro del semestre 2026-2"><input type="date" className={`form-control${inv(err.fechaLimite)}`} min={SEMESTRE.ini} max={SEMESTRE.fin} value={f.fechaLimite} onChange={set('fechaLimite')} /></Field>
              <Field className="col-5" label="Peso" error={err.peso} hint="Entre 5 y 40"><input className={`form-control${inv(err.peso)}`} inputMode="numeric" value={f.peso} onChange={set('peso')} /></Field>
            </div>
            <div className="form-check mb-3"><input className="form-check-input" type="checkbox" id="obl" checked={f.obligatorio} onChange={set('obligatorio')} /><label className="form-check-label" htmlFor="obl">Es obligatorio para calcular el avance</label></div>
            <div className={`card-tfc ${tone === 'danger' ? 'danger' : tone === 'ok' ? 'soft' : 'warn'} p-3 mb-3`}>
              <div className="d-flex justify-content-between fw-semibold"><span>Suma de pesos del plan</span><span>{total} de 100</span></div>
              <div className={`progress-tfc my-2 ${tone}`}><span style={{ width: `${Math.min(100, total)}%` }} /></div>
              <div className="aux">{total > 100 ? `Excede en ${total - 100} puntos. Reduce el peso de otro entregable antes de guardar.` : total === 100 ? 'El plan está balanceado.' : `Faltan ${100 - total} puntos para completar el plan.`}</div>
            </div>
            <hr />
            <div className="d-flex justify-content-end gap-2"><button className="btn btn-link" onClick={reset}>Cancelar</button><button className="btn btn-primary" disabled={total > 100} onClick={guardar}>{editId ? 'Guardar cambios' : 'Guardar entregable'}</button></div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="card-tfc">
            <div className="card-head"><h2 className="mb-0">Entregables del plan</h2><span className={`tag ${es.reduce((s, e) => s + e.peso, 0) === 100 ? 'st-ok' : 'st-warn'}`}>Suma {es.reduce((s, e) => s + e.peso, 0)} / 100</span></div>
            {es.length === 0 ? <EmptyState icon="⋮" title="El plan está vacío" text="Agrega los entregables uno por uno o carga la plantilla del ciclo." action={<button className="btn btn-outline-primary" onClick={() => { const r = applyTemplate(t.id); notify(r.ok ? 'success' : 'danger', r.ok ? 'Plantilla cargada' : 'No se pudo cargar', r.ok ? 'Se agregaron los 5 entregables del ciclo.' : r.error); }}>Usar plantilla del ciclo</button>} /> : (
              <div className="table-responsive"><table className="table table-tfc"><thead><tr><th>Entregable</th><th>Fecha límite</th><th>Peso</th><th className="text-end">Acción</th></tr></thead>
                <tbody>{es.map((e) => { const i = D.infoEntregable(db, e, es); const bloq = i.estado === 'aprobado'; const tieneAv = i.versiones > 0; return (
                  <tr key={e.id} style={editId === e.id ? { background: 'var(--c-primary-soft)' } : null}>
                    <td><div className="fw-semibold">{e.orden}. {e.nombre}</div><Tag k={i.estado} /></td><td>{fmt(e.fechaLimite)}</td><td className="fw-bold">{e.peso}</td>
                    <td className="text-end">{bloq ? <span className="text-muted2">Bloqueado</span> : <><button className="btn btn-link btn-sm" onClick={() => editar(e)}>Editar</button>{!tieneAv && <button className="btn btn-link btn-sm text-danger2" onClick={() => setDel(e)}>Eliminar</button>}</>}</td></tr>); })}</tbody></table></div>
            )}
            <div className="card-foot d-flex flex-wrap justify-content-between align-items-center gap-2"><span>Los entregables ya aprobados no pueden editarse ni eliminarse. Cambiar una fecha límite notifica al equipo.</span>
              <span className="d-flex gap-2"><button className="btn btn-sm btn-outline-primary bg-white" onClick={() => { const r = applyTemplate(t.id); notify(r.ok ? 'success' : 'info', r.ok ? 'Plantilla cargada' : 'Plantilla no aplicada', r.ok ? 'Se agregaron los 5 entregables del ciclo.' : r.error); }}>Usar plantilla del ciclo</button><button className="btn btn-sm btn-primary" onClick={() => nav('/asesor/asesorados')}>Listo</button></span></div>
          </div>
        </div>
      </div>
      {del && <ConfirmModal title="Eliminar entregable" danger confirmLabel="Eliminar" onClose={() => setDel(null)} onConfirm={() => { const r = deleteEntregable(del.id); setDel(null); notify(r.ok ? 'success' : 'danger', r.ok ? 'Entregable eliminado' : 'No se pudo eliminar', r.ok ? '' : r.error); }}>¿Eliminar «{del.nombre}» del plan? Los pesos del plan se recalcularán.</ConfirmModal>}
    </>
  );
}
