// HU-3 · Mi ficha de asesor (lectura y edición): grado, departamento, líneas, experiencia y cupo máximo.
import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { DEPARTAMENTOS, GRADOS, LINEAS, TITULOS } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { Avatar, Field, LineTags, Modal, PageHeader, Progress, inv } from '../../components/ui.jsx';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { db, user, updateAdvisorProfile, notify } = useApp();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState(null);
  const [err, setErr] = useState({});

  // Protección si el usuario o la base de datos aún no cargan
  if (!user || !db) {
    return <div className="p-4 text-muted">Cargando ficha...</div>;
  }

  const c = D.cupoAsesor(db, user) || { disponible: 0, max: 0, ocupados: 0, cargo: 0 };
  const pendSol = (db.solicitudes || []).filter((s) => s.asesorId === user.id && s.estado === 'pendiente').length;
  const pendRev = (D.pendientesRevision(db, user.id) || []).length;
  const sinPlan = (db.trabajos || []).filter((t) => t.asesorId === user.id && D.esVigente(t) && D.entregablesDe(db, t.id).length === 0).length;
  
  const abrir = () => { 
    setF({ 
      grado: user.grado || GRADOS[0], 
      departamento: user.departamento || DEPARTAMENTOS[0], 
      lineas: [...(user.lineas || [])], 
      experiencia: user.experiencia || '', 
      cupoMax: String(user.cupoMax || 6) 
    }); 
    setErr({}); 
    setEdit(true); 
  };

  const toggleLinea = (l) => {
    if (!f) return;
    const lineas = f.lineas || [];
    const nuevasLineas = lineas.includes(l) 
      ? lineas.filter((x) => x !== l) 
      : lineas.length < 3 ? [...lineas, l] : lineas;
    setF({ ...f, lineas: nuevasLineas });
  };

  const guardar = () => {
    if (!f) return;
    const e = {};
    if (!f.lineas || f.lineas.length < 1) e.lineas = 'Elige al menos una línea (hasta 3)';
    if ((f.experiencia || '').trim().length < 30) e.experiencia = 'Describe tu experiencia (mínimo 30 caracteres)';
    const n = Number(f.cupoMax);
    if (!Number.isInteger(n) || n < c.cargo) e.cupoMax = `No puede ser menor a los ${c.cargo} trabajos a cargo`;
    else if (n > 10) e.cupoMax = 'El cupo máximo no puede superar 10';
    setErr(e);
    if (Object.keys(e).length) return;

    updateAdvisorProfile(user.id, { 
      grado: f.grado, 
      titulo: f.grado !== user.grado ? TITULOS[f.grado] : user.titulo, 
      departamento: f.departamento, 
      lineas: f.lineas, 
      experiencia: (f.experiencia || '').trim(), 
      cupoMax: n 
    });
    setEdit(false);
    notify('success', 'Ficha actualizada', 'Los estudiantes ya ven tus cambios en el directorio público.');
  };

  return (
    <>
      <PageHeader crumbs={[['Inicio'], ['Mi ficha de asesor']]} title="Mi ficha de asesor" subtitle="Así te ven los estudiantes en el directorio público." actions={<button className="btn btn-outline-primary" onClick={abrir}>Editar ficha</button>} />
      <div className="row g-3">
        <div className="col-lg-8 d-grid gap-3 align-content-start">
          <div className="card-tfc pad d-flex gap-4 align-items-center">
            <Avatar name={D.nombreAsesor(user)} size={80} />
            <div>
              <h2 className="mb-1">{D.nombreAsesor(user)}</h2>
              <div className="text-muted2 mb-2">{user.grado || ''} · Departamento de {user.departamento || ''} · {user.email || ''}</div>
              <LineTags items={user.lineas || []} />
            </div>
          </div>
          <div className="card-tfc pad">
            <h2 className="mb-2">Experiencia</h2>
            <p>{user.experiencia || 'Aún no registraste tu experiencia.'}</p>
            <div className="row border-top pt-3">
              {[
                ['Trabajos asesorados', user.asesorados || 0], 
                ['Concluidos', user.concluidos || 0], 
                ['Tiempo de revisión', `${user.tiempoRevision || 0} días`], 
                ['Sustentaciones como jurado', (D.juradosCiclo(db, user) || 0) + (user.jurados || 0)]
              ].map(([l, v]) => (
                <div className="col-6 col-md-3" key={l}>
                  <div className="eyebrow">{l}</div>
                  <div className="serif fs-3">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4 d-grid gap-3 align-content-start">
          <div className="card-tfc pad">
            <div className="eyebrow mb-2">Cupo de asesoría</div>
            <div className="stat-big">{c.disponible} <span className="fs-6 text-muted2 fw-normal" style={{ fontFamily: 'Inter' }}>disponibles de {c.max}</span></div>
            <Progress value={c.max ? (c.ocupados * 100) / c.max : 0} className="my-2" />
            <div className="aux">{c.ocupados} trabajos a cargo · {c.max ? Math.round((c.ocupados * 100) / c.max) : 0}% del cupo ocupado</div>
          </div>
          <div className="card-tfc pad">
            <div className="eyebrow mb-2">Pendientes de tu rol</div>
            {[['Solicitudes recibidas', pendSol], ['Avances por revisar', pendRev], ['Planes sin definir', sinPlan]].map(([l, v]) => (
              <div className="d-flex justify-content-between py-1" key={l}>
                <span>{l}</span>
                <b>{v}</b>
              </div>
            ))}
            <Link to="/asesor/revision" className="btn btn-outline-primary w-100 mt-2">Ir a la bandeja de revisión</Link>
          </div>
          <div className="card-tfc flat pad">
            <div className="eyebrow mb-1">Visibilidad</div>
            <div className="small text-muted2">Solo recibes solicitudes de las líneas declaradas en tu ficha. Si tu cupo llega a 0, dejas de aparecer en el filtro «Solo con cupo».</div>
          </div>
        </div>
      </div>
      {edit && f && (
        <Modal title="Editar mi ficha" size="lg" onClose={() => setEdit(false)} footer={<><button className="btn btn-link" onClick={() => setEdit(false)}>Cancelar</button><button className="btn btn-primary" onClick={guardar}>Guardar ficha</button></>}>
          <div className="row g-3">
            <Field className="col-md-6" label="Grado académico">
              <select className="form-select" value={f.grado} onChange={(e) => setF({ ...f, grado: e.target.value })}>
                {(GRADOS || []).map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field className="col-md-6" label="Departamento">
              <select className="form-select" value={f.departamento} onChange={(e) => setF({ ...f, departamento: e.target.value })}>
                {(DEPARTAMENTOS || []).map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field className="col-12" label="Líneas de investigación" error={err.lineas} hint="Hasta 3 líneas · solo recibirás solicitudes de estas líneas">
              <div className="d-flex flex-wrap gap-2">
                {(LINEAS || []).map((l) => (
                  <button type="button" key={l} className={`btn btn-sm ${f.lineas.includes(l) ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => toggleLinea(l)}>{l}</button>
                ))}
              </div>
            </Field>
            <Field className="col-12" label="Experiencia" error={err.experiencia} hint={`${(f.experiencia || '').trim().length} / 800`}>
              <textarea 
                className={`form-control${inv(err.experiencia)}`} 
                rows={4} 
                maxLength={800} 
                value={f.experiencia || ''} 
                onChange={(e) => setF({ ...f, experiencia: e.target.value })} 
              />
            </Field>
            <Field className="col-md-4" label="Cupo máximo" error={err.cupoMax} hint={`No puede ser menor a los ${c.cargo} trabajos a cargo`}>
              <input className={`form-control${inv(err.cupoMax)}`} inputMode="numeric" value={f.cupoMax} onChange={(e) => setF({ ...f, cupoMax: e.target.value })} />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}