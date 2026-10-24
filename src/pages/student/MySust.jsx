// HU-6 · Mi sustentación: programada, realizada con resultado, o sin programar.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { CRITERIOS, REQ_ADMIN } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { EmptyState, Modal, PageHeader, Tag } from '../../components/ui.jsx';
import ActaSheet from '../../components/ActaSheet.jsx';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function MySust() {
  const { db, user, notify } = useApp();
  const [acta, setActa] = useState(false);
  const t = D.trabajoActivo(db, user.id);
  const s = t && D.sustDe(db, t.id);
  const juradoBox = s && s.jurado.length > 0;
  if (!s) return (
    <div className="card-tfc mx-auto" style={{ maxWidth: 640 }}><EmptyState icon="▤" title="Aún no tienes fecha de sustentación" text="La coordinación programa las sustentaciones de los trabajos concluidos entre el 07/12 y el 19/12/2026. Te avisaremos por correo con la fecha, hora, sala y jurado."
      action={<Link to="/mi-trabajo" className="btn btn-outline-primary">Ver mi trabajo</Link>} /></div>
  );
  const hecho = s.estado === 'realizada' || s.estado === 'desaprobada';
  const dia = DIAS[new Date(s.fecha + 'T00:00:00Z').getUTCDay()];
  const jur = s.jurado.map((j) => D.byId(db.usuarios, j));
  const equipo = t.integrantes.map((i) => D.byId(db.usuarios, i));
  const asesor = D.byId(db.usuarios, t.asesorId);

  return (
    <>
      <PageHeader crumbs={[['Mi trabajo', '/mi-trabajo'], ['Mi sustentación']]} title="Mi sustentación"
        subtitle={hecho ? `Realizada el ${fmt(s.fecha)} · acta registrada por la coordinación el ${fmt(s.acta.fecha)}` : `Programada por la coordinación el ${fmt(s.programadaEl)} · faltan ${D.diffDays(s.fecha, D.HOY)} días`} />
      <div className="row g-3">
        <div className="col-lg-8 d-grid gap-3 align-content-start">
          {hecho ? (
            <>
              <div className="card-tfc soft pad d-flex justify-content-between align-items-center">
                <div><div className="eyebrow">Resultado del jurado</div><div className="serif" style={{ fontSize: '2.2rem' }}>{s.acta.resultado}</div><div className="small">{fmt(s.fecha)} · Sala {s.sala}</div></div>
                <div className="text-end"><div className="eyebrow">Nota final</div><div className="stat-big text-ok" style={{ fontSize: '3rem' }}>{s.acta.final}</div></div>
              </div>
              <div className="card-tfc pad"><h2 className="mb-3">Detalle de la calificación</h2>
                <table className="table table-tfc"><thead><tr><th>Criterio</th><th>Peso</th><th>Nota</th></tr></thead><tbody>{CRITERIOS.map((c) => <tr key={c.id}><td>{c.nombre}</td><td>{c.peso}%</td><td className="fw-bold">{s.acta.notas[c.id]}</td></tr>)}</tbody></table>
                <div className="eyebrow mt-3 mb-1">Observaciones del jurado</div><div className="quote green">{s.acta.observaciones || '—'}</div></div>
            </>
          ) : (
            <>
              <div className="card-tfc soft pad">
                <div className="d-flex justify-content-between"><Tag k={s.estado} /><span className="small">Modalidad {s.modalidad.toLowerCase()}</span></div>
                <div className="row mt-3 g-3"><div className="col-md-4"><div className="eyebrow">Fecha</div><div className="serif fs-3">{fmt(s.fecha)}</div><div className="small text-muted2">{dia}</div></div><div className="col-md-4"><div className="eyebrow">Hora</div><div className="serif fs-3">{s.hora}</div><div className="small text-muted2">Duración estimada 60 min</div></div><div className="col-md-4"><div className="eyebrow">Sala</div><div className="serif fs-3">{s.sala}</div><div className="small text-muted2">Campus Santiago de Surco</div></div></div>
              </div>
              <div className="card-tfc pad"><h2 className="mb-3">Requisitos antes de la fecha</h2>
                <div className="rowline"><span className="dot done" /><b>Informe final aprobado</b><div className="aux ms-4">{D.entregablesDe(db, t.id).some((e) => !D.aprobadoE(db, e)) ? 'Pendiente de aprobación' : 'Aprobado por el asesor'}</div></div>
                <div className="rowline"><span className="dot todo" /><b>{REQ_ADMIN.nombre}</b><div className="aux ms-4 text-warn2">En la oficina TFC hasta el 04/12/2026 (5 días hábiles antes)</div></div>
                <div className="rowline"><span className="dot todo" /><b>Constancia de no adeudo</b><div className="aux ms-4">Se solicita en Tesorería y se adjunta al expediente</div></div></div>
            </>
          )}
        </div>
        <div className="col-lg-4 d-grid gap-3 align-content-start">
          {hecho && <div className="card-tfc pad"><div className="eyebrow mb-2">Documentos</div><div className="d-grid gap-2"><button className="btn btn-primary" onClick={() => setActa(true)}>Descargar acta firmada (PDF)</button><button className="btn btn-outline-primary" onClick={() => notify('info', 'Informe final', 'En esta entrega el informe se consulta mediante el enlace del avance.')}>Descargar informe final</button><Link to="/mi-trabajo" className="btn btn-outline-secondary">Ver mi trabajo</Link></div></div>}
          <div className="card-tfc pad"><div className="eyebrow mb-2">{hecho ? 'Jurado' : 'Jurado designado'}</div>
            {juradoBox ? jur.map((j) => <div className="card-tfc p-2 px-3 mb-2 d-flex justify-content-between" key={j.id}><div><div className="fw-semibold">{D.nombreAsesor(j)}</div><div className="aux">{j.departamento}</div></div>{s.presidenteId === j.id && <span className="tag st-warn align-self-start">Presidente</span>}</div>) : <div className="small text-muted2">La coordinación aún no conforma el jurado.</div>}</div>
          {!hecho && <div className="card-tfc pad"><div className="eyebrow mb-2">Equipo y asesor</div>{equipo.map((u) => <div className="small" key={u.id}>{D.nombreCompleto(u)} · {t.responsableId === u.id ? 'responsable' : 'integrante'}</div>)}<div className="small border-top mt-2 pt-2">{D.nombreAsesor(asesor)} · asesor</div></div>}
          {!hecho && <div className="card-tfc flat pad"><div className="eyebrow mb-1">Cambios de fecha</div><div className="small text-muted2">Solo la coordinación puede reprogramar. Si tienes un impedimento, escribe a tfc@ulima.edu.pe con al menos 5 días de anticipación.</div></div>}
          {hecho && s.estado === 'realizada' && <div className="card-tfc soft pad"><div className="fw-bold mb-1">Siguiente paso</div><div className="small">Con el acta aprobada puedes iniciar el trámite de bachillerato en la Secretaría Académica.</div></div>}
        </div>
      </div>
      {acta && <Modal title="Acta de sustentación" size="lg" onClose={() => setActa(false)} footer={<><button className="btn btn-link" onClick={() => setActa(false)}>Cerrar</button><button className="btn btn-primary" onClick={() => window.print()}>Imprimir / guardar como PDF</button></>}><ActaSheet db={db} sust={s} /></Modal>}
    </>
  );
}
