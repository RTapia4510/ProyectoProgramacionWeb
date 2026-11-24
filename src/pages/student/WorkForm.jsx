// HU-2 · Registro y edición del trabajo (título, línea, resumen, objetivos y palabras clave).
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { LINEAS } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { Field, PageHeader, Progress, Tag, TagsInput, inv } from '../../components/ui.jsx';

export default function WorkForm({ editar }) {
  const { db, user, createWork, updateWork, saveDraft, notify } = useApp();
  const nav = useNavigate();
  const vigente = D.trabajosDe(db, user.id).find(D.esVigente);
  const base = editar && vigente ? vigente : db.borradores[user.id] || {};
  const [f, setF] = useState({ titulo: base.titulo || '', linea: base.linea || '', resumen: base.resumen || '', objetivos: base.objetivos || '', palabras: base.palabras || [] });
  const [intentado, setIntentado] = useState(false); // tras el primer intento de envío, los errores se actualizan mientras se escribe
  const [guardado, setGuardado] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  // Autoguardado del borrador (solo en el registro nuevo): se guarda 1 s después de dejar de escribir.
  useEffect(() => {
    if (editar || vigente || !(f.titulo || f.linea || f.resumen || f.objetivos || f.palabras.length)) return undefined;
    const id = setTimeout(() => { saveDraft(user.id, f); setGuardado(new Date().toTimeString().slice(0, 5)); }, 1000);
    return () => clearTimeout(id);
  }, [f]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editar && vigente) {
    return (
      <div className="card-tfc mx-auto text-center p-5" style={{ maxWidth: 600 }}>
        <div className="empty warn p-0"><div className="icon">!</div></div>
        <h1 className="mb-2">Ya tienes un trabajo vigente</h1>
        <p className="text-muted2">Solo puedes tener un trabajo en desarrollo a la vez. Para registrar uno nuevo debes concluir o desistir del actual.</p>
        <div className="card-tfc flat p-3 text-start mb-3"><div className="serif">{vigente.titulo}</div><div className="d-flex align-items-center gap-2 mt-1"><Tag k={vigente.estado} /><div style={{ width: 70 }}><Progress value={D.avanceTrabajo(db, vigente.id)} /></div><b className="small">{D.avanceTrabajo(db, vigente.id)}%</b></div></div>
        <div className="d-flex gap-2 justify-content-center"><Link to="/mi-trabajo" className="btn btn-primary">Ver mi trabajo actual</Link><Link to="/entregables" className="btn btn-outline-primary">Ver entregables</Link></div>
      </div>
    );
  }
  if (editar && !vigente) return <div className="card-tfc pad">No tienes un trabajo vigente para editar. <Link to="/mi-trabajo">Volver</Link></div>;

  const validar = () => {
    const e = {};
    const n = f.titulo.trim().length;
    if (n < 20) e.titulo = 'El título debe tener al menos 20 caracteres';
    if (!f.linea) e.linea = 'Debes elegir una línea de investigación';
    const r = f.resumen.trim().length;
    if (r < 300) e.resumen = `Faltan ${300 - r} caracteres para el mínimo · ${r} / 1200`;
    if (f.objetivos.trim().length < 20) e.objetivos = 'Describe al menos un objetivo (mínimo 20 caracteres)';
    if (f.palabras.length < 3) e.palabras = 'Agrega entre 3 y 6 palabras clave';
    return e;
  };
  const err = intentado ? validar() : {};
  const enviar = () => {
    const e = validar();
    setIntentado(true);
    if (Object.keys(e).length) return notify('danger', 'No pudimos registrar el trabajo', `Revisa ${Object.keys(e).length} campos antes de continuar.`);
    const datos = { titulo: f.titulo.trim(), linea: f.linea, resumen: f.resumen.trim(), objetivos: f.objetivos.trim(), palabras: f.palabras };
    if (editar) { updateWork(vigente.id, datos); notify('success', 'Ficha actualizada', 'Los cambios se guardaron.'); return nav('/mi-trabajo'); }
    const r = createWork(datos, user.id);
    if (!r.ok) return notify('danger', 'No se pudo registrar', r.error);
    notify('success', 'Trabajo registrado', `Código ${r.trabajo.codigo}. Ahora puedes agregar integrantes y solicitar asesor.`);
    nav('/mi-trabajo');
  };
  const lineaBloqueada = editar && vigente.asesorId;

  return (
    <>
      <PageHeader crumbs={[['Mi trabajo', '/mi-trabajo'], [editar ? 'Editar ficha' : 'Nuevo registro']]} title={editar ? 'Editar la ficha de mi trabajo' : 'Registrar mi trabajo de fin de carrera'} />
      {Object.keys(err).length > 0 && <div className="card-tfc danger p-2 small text-danger2 mb-3" role="alert">Revisa {Object.keys(err).length} campos antes de continuar.</div>}
      <div className="row g-3">
        <div className="col-lg-9">
          <div className="card-tfc pad">
            <Field label="Título del trabajo" error={err.titulo} hint={`${f.titulo.trim().length} de 160 caracteres · mínimo 20`} className="mb-3"><input className={`form-control serif${inv(err.titulo)}`} maxLength={160} value={f.titulo} onChange={set('titulo')} /></Field>
            <div className="row g-3 mb-3">
              <Field className="col-md-7" label="Línea de investigación" error={err.linea} hint={lineaBloqueada ? 'No se puede cambiar cuando ya hay asesor' : ''}><select className={`form-select${inv(err.linea)}`} disabled={lineaBloqueada} value={f.linea} onChange={set('linea')}><option value="">Selecciona una línea</option>{LINEAS.map((l) => <option key={l}>{l}</option>)}</select></Field>
              <Field className="col-md-5" label="Carrera"><input className="form-control" readOnly value={`${user.carrera} · tomada de tu perfil`} /></Field>
            </div>
            <Field label="Resumen" error={err.resumen} hint={<div className="d-flex justify-content-between"><span>Entre 300 y 1200 caracteres</span><span>{f.resumen.trim().length} / 1200</span></div>} className="mb-3"><textarea className={`form-control${inv(err.resumen)}`} rows={5} maxLength={1200} value={f.resumen} onChange={set('resumen')} /></Field>
            <Field label="Objetivos" error={err.objetivos} className="mb-3"><textarea className={`form-control${inv(err.objetivos)}`} rows={3} maxLength={1000} value={f.objetivos} onChange={set('objetivos')} /></Field>
            <Field label="Palabras clave" error={err.palabras} hint="Entre 3 y 6 palabras clave · escribe y presiona Enter" className="mb-3"><TagsInput value={f.palabras} onChange={(v) => setF({ ...f, palabras: v })} invalid={err.palabras} placeholder="Escribe y presiona Enter…" /></Field>
            <hr />
            <div className="d-flex justify-content-end align-items-center gap-2">
              {!editar && guardado && <span className="aux me-auto">Borrador guardado automáticamente {guardado}</span>}
              <Link to="/mi-trabajo" className="btn btn-link">Cancelar</Link>
              {!editar && <button className="btn btn-outline-primary" onClick={() => { saveDraft(user.id, f); notify('info', 'Borrador guardado', 'Podrás retomarlo cuando vuelvas a esta pantalla.'); }}>Guardar borrador</button>}
              <button className="btn btn-primary" onClick={enviar}>{editar ? 'Guardar cambios' : 'Registrar trabajo'}</button>
            </div>
          </div>
        </div>
        <div className="col-lg-3 d-grid gap-3 align-content-start">
          <div className="card-tfc pad"><div className="eyebrow mb-2">Qué sigue</div><div className="small text-muted2">Al registrar el trabajo podrás agregar hasta dos compañeros y solicitar asesor entre quienes tengan cupo en tu línea de investigación.</div></div>
          <div className="card-tfc soft pad"><div className="fw-semibold mb-1">Plan de entregables</div><div className="small">Se creará con la plantilla del ciclo: Plan de investigación (15), Marco teórico (20), Diseño metodológico (20), Resultados preliminares (20) e Informe final (25).</div></div>
          <div className="card-tfc pad"><div className="eyebrow mb-2">Reglas</div><div className="small d-grid gap-2"><span>Un solo trabajo vigente por estudiante</span><span>Equipo de 1 a 3 integrantes</span><span>Una sola solicitud de asesoría activa</span></div></div>
        </div>
      </div>
    </>
  );
}
