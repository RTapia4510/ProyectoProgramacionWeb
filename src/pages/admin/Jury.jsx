// HU-6 · Conformación del jurado: 3 miembros, 1 presidente, ≥1 doctor y ≥1 del departamento; advierte conflictos.
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { EmptyState, PageHeader } from '../../components/ui.jsx';

export default function Jury() {
  const { db, setJury, notify } = useApp();
  const { id } = useParams();
  const nav = useNavigate();
  const s = D.byId(db.sustentaciones, id);
  const [sel, setSel] = useState(s ? s.jurado : []);
  const [pres, setPres] = useState(s ? s.presidenteId : null);
  if (!s) return <div className="card-tfc"><EmptyState title="Sustentación no encontrada" action={<Link className="btn btn-primary" to="/admin/sustentaciones">Volver</Link>} /></div>;
  const t = D.byId(db.trabajos, s.trabajoId);
  const asesor = D.byId(db.usuarios, t.asesorId);
  const docentes = db.usuarios.filter((u) => u.rol === 'asesor' && u.estado === 'activo').sort((a, b) => D.juradosCiclo(db, a) - D.juradosCiclo(db, b));
  const miembros = sel.map((x) => D.byId(db.usuarios, x));
  const hayDoctor = miembros.some((m) => m.grado === 'Doctor');
  const hayDepto = miembros.some((m) => m.departamento === t.carrera);
  const conflictivos = docentes.filter((d) => d.conflictos[t.id] && d.id !== t.asesorId);
  const agregar = (d) => { if (sel.length >= 3) return notify('warning', 'Jurado completo', 'Quita un miembro antes de agregar otro.'); setSel([...sel, d.id]); if (!pres) setPres(d.id); };
  const quitar = (x) => { setSel(sel.filter((i) => i !== x)); if (pres === x) setPres(null); };
  const confirmar = () => {
    const r = setJury(s.id, sel, pres);
    if (!r.ok) return notify('danger', 'No se pudo confirmar el jurado', r.error);
    notify('success', 'Jurado confirmado', 'Se notificó a los tres miembros, al equipo y al asesor.');
    nav('/admin/sustentaciones');
  };

  return (
    <>
      <PageHeader crumbs={[['Sustentaciones', '/admin/sustentaciones'], [`${fmt(s.fecha)} · ${s.hora} · ${s.sala}`], ['Conformar jurado']]} title="Conformación del jurado" subtitle={<span className="serif">{t.titulo}</span>} />
      <div className="card-tfc warn p-3 small text-warn2 mb-3">❗ {D.nombreAsesor(asesor)} es el asesor del trabajo: no puede integrar el jurado.{conflictivos.map((c) => ` ${D.nombreAsesor(c)} ${c.conflictos[t.id]}; revisa el posible conflicto antes de agregarla.`).join('')}</div>
      <div className="row g-3">
        <div className="col-lg-8"><div className="card-tfc">
          <div className="card-head"><span className="eyebrow">Docentes disponibles</span><span className="aux">Ordenados por carga de jurados del ciclo</span></div>
          {docentes.map((d) => {
            const esAsesor = d.id === t.asesorId; const conf = d.conflictos[t.id]; const ya = sel.includes(d.id);
            return (
              <div className={`d-flex justify-content-between align-items-center p-3 border-bottom ${esAsesor ? 'row-muted' : ''}`} key={d.id} style={conf && !ya ? { background: '#fdf1dc' } : esAsesor ? { background: '#fafaf6' } : null}>
                <div><div className={`fw-semibold ${esAsesor ? 'text-muted2' : ''}`}>{D.nombreAsesor(d)}</div>
                  <div className="aux">{esAsesor ? <span className="text-danger2">Asesor del trabajo · no elegible por reglamento</span> : conf ? <span className="text-warn2">Posible conflicto: {conf.replace('dictó', 'dictó')}</span> : `${d.departamento} · ${D.juradosCiclo(db, d)} jurados este ciclo · ${d.grado.toLowerCase()}`}</div></div>
                {esAsesor ? <button className="btn btn-sm btn-outline-secondary" disabled>No disponible</button> : ya ? <button className="btn btn-sm btn-outline-secondary" disabled>Agregado</button> : <button className={`btn btn-sm ${conf ? 'btn-outline-accent' : 'btn-outline-primary'}`} onClick={() => agregar(d)}>{conf ? 'Agregar de todos modos' : 'Agregar'}</button>}
              </div>);
          })}
          <div className="card-foot">El jurado se compone de 3 miembros; al menos uno debe tener grado de doctor y uno debe pertenecer al departamento del trabajo ({t.carrera}).</div>
        </div></div>
        <div className="col-lg-4"><div className="card-tfc pad">
          <div className="d-flex justify-content-between mb-3"><span className="eyebrow">Jurado seleccionado</span><span className={`tag ${sel.length === 3 ? 'st-ok' : 'st-warn'}`}>{sel.length} de 3</span></div>
          {miembros.map((m) => (
            <div className={`card-tfc p-3 mb-2 ${pres === m.id ? 'soft' : ''}`} key={m.id}>
              <div className="d-flex justify-content-between"><b>{D.nombreAsesor(m)}</b>{pres === m.id ? <span className="tag st-warn">Presidente</span> : <button className="btn btn-link btn-sm p-0 text-danger2" onClick={() => quitar(m.id)}>Quitar</button>}</div>
              <div className="d-flex justify-content-between"><span className="aux">{m.departamento} · {m.grado.toLowerCase()}</span>{pres !== m.id && <button className="btn btn-link btn-sm p-0" onClick={() => setPres(m.id)}>Designar presidente</button>}</div>
              {pres === m.id && <button className="btn btn-link btn-sm p-0 text-danger2" onClick={() => quitar(m.id)}>Quitar</button>}
            </div>))}
          <div className="card-tfc flat p-2 small mb-3">
            <div className={sel.length === 3 ? 'text-ok' : ''}>{sel.length === 3 ? '✓' : '○'} 3 miembros</div><div className={hayDoctor ? 'text-ok' : ''}>{hayDoctor ? '✓' : '○'} 1 doctor</div><div className={hayDepto ? 'text-ok' : ''}>{hayDepto ? '✓' : '○'} 1 del departamento de {t.carrera}</div><div className={pres ? 'text-ok' : ''}>{pres ? '✓' : '○'} Presidente designado</div>
          </div>
          <button className="btn btn-primary w-100 py-2" disabled={!(sel.length === 3 && hayDoctor && hayDepto && pres)} onClick={confirmar}>Confirmar jurado</button>
          <div className="aux text-center mt-2">Se notificará a los tres miembros, al equipo y al asesor</div>
        </div></div>
      </div>
    </>
  );
}
