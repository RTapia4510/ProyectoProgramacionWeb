// HU-4 · Plan de entregables del estudiante (línea de tiempo, composición del avance y alertas).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { EmptyState, Progress } from '../../components/ui.jsx';
import { Timeline } from '../../components/WorkViews.jsx';
import { AmpliacionModal, AvanceModal } from '../../components/AvanceModal.jsx';

export default function Plan() {
  const { db, user, notify } = useApp();
  const [modal, setModal] = useState(null); // {tipo, e}
  const t = D.trabajoActivo(db, user.id);
  if (!t) return <div className="card-tfc"><EmptyState title="Aún no tienes trabajo" text="Registra tu trabajo para recibir un plan de entregables." action={<Link className="btn btn-primary" to="/mi-trabajo/nuevo">Registrar mi trabajo</Link>} /></div>;
  const es = D.entregablesDe(db, t.id);
  const asesor = D.byId(db.usuarios, t.asesorId);
  const pct = D.avanceTrabajo(db, t.id);
  const al = D.alertasTrabajo(db, t.id);
  const retro = D.ultimaRetro(db, t.id);
  const vigente = D.esVigente(t);
  const aprobados = es.filter((e) => D.aprobadoE(db, e));

  if (!es.length) return (
    <div className="card-tfc"><EmptyState icon="⋮" title="Aún no hay plan definido"
      text={asesor ? 'Tu asesor debe definir los entregables con sus fechas límite y pesos. Te avisaremos por correo cuando el plan esté listo.' : 'El plan se habilita cuando un asesor acepte tu trabajo. Busca un asesor con cupo en el directorio.'}
      action={asesor ? <button className="btn btn-outline-primary" onClick={() => notify('success', 'Mensaje enviado', `Se notificó a ${D.nombreAsesor(asesor)}.`)}>Escribir a mi asesor</button> : <Link to="/asesores" className="btn btn-primary">Buscar asesor con cupo</Link>} /></div>
  );

  return (
    <>
      <div className="card-tfc pad mb-3">
        <div className="d-flex flex-wrap justify-content-between gap-3 align-items-end">
          <div><div className="crumbs">Mi trabajo · Plan de entregables</div><h1 className="mb-1">Plan de entregables</h1>
            <div className="text-muted2">{es.length} entregables · pesos suman {es.reduce((s, e) => s + e.peso, 0)}{asesor ? ` · definido por ${D.nombreAsesor(asesor)}` : ''}</div></div>
          <div style={{ minWidth: 280 }}><div className="d-flex justify-content-between"><span className="eyebrow">Avance acumulado</span><b>{pct}%</b></div><Progress value={pct} /><div className="aux mt-1">{aprobados.length ? `Entregables ${aprobados.map((e) => e.orden).join(', ')} aprobados (${aprobados.map((e) => e.peso).join(' + ')})` : 'Sin entregables aprobados'}</div></div>
          <span className="card-tfc flat px-3 py-2 small text-muted2">Solo tu asesor puede editar el plan</span>
        </div>
      </div>
      {!asesor && <div className="card-tfc warn p-2 small text-warn2 mb-3">Tu trabajo no tiene asesor: el plan está detenido y no puedes registrar avances hasta que otro asesor acepte. <Link to="/asesores">Buscar asesor</Link></div>}
      <div className="row g-3">
        <div className="col-lg-8 col-xl-9"><div className="card-tfc pad">
          <Timeline db={db} trabajo={t} historialTo={(e) => `/retroalimentacion/${e.id}`}
            acciones={(e, i) => vigente && asesor && i.puedeRegistrar && (
              <div className="d-flex flex-column gap-2">
                <button className={`btn ${i.estado === 'vencido' ? 'btn-danger' : 'btn-outline-primary'}`} onClick={() => setModal({ tipo: 'avance', e })}>Registrar avance</button>
                {i.estado === 'vencido' && <button className="btn btn-outline-danger" onClick={() => setModal({ tipo: 'ampliacion', e })}>Solicitar ampliación</button>}
              </div>)} />
        </div></div>
        <div className="col-lg-4 col-xl-3 d-grid gap-3 align-content-start">
          <div className="card-tfc pad"><div className="eyebrow mb-2">Composición del avance</div>
            {es.map((e) => { const ok = D.aprobadoE(db, e); return <div className={`d-flex justify-content-between small py-1 ${ok ? '' : 'text-muted2'}`} key={e.id}><span>{e.orden}. {e.nombre}</span><b className={ok ? 'text-ok' : ''}>{ok ? `+${e.peso}` : `0 de ${e.peso}`}</b></div>; })}
            <div className="d-flex justify-content-between border-top mt-2 pt-2 fw-bold"><span>Total</span><span>{pct} de 100</span></div></div>
          {(al.vencidos.length > 0 || al.proximos.length > 0) && (
            <div className="card-tfc warn pad"><div className="fw-bold text-warn2 mb-1">Alerta de vencimiento</div>
              <div className="small text-warn2 mb-2">{al.vencidos.map((x) => `${x.e.nombre} venció el ${fmt(x.e.fechaLimite)}.`).join(' ')} {al.proximos.map((x) => `${x.e.nombre} vence el ${fmt(x.e.fechaLimite)}.`).join(' ')}</div>
              <Link to="/entregables/alertas" className="btn btn-warn w-100">Ver alertas</Link></div>
          )}
          {retro && (
            <div className="card-tfc pad"><div className="eyebrow mb-2">Última retroalimentación</div><div className="fw-semibold mb-1">{retro.e.nombre} · v{retro.a.version} · {D.TAGS[retro.a.estado][0].toLowerCase()}</div><div className="quote mb-2 small">«{retro.c.texto}»</div><Link to="/retroalimentacion" className="fw-semibold small">Ver todas las revisiones</Link></div>
          )}
        </div>
      </div>
      {modal?.tipo === 'avance' && <AvanceModal e={modal.e} onClose={() => setModal(null)} />}
      {modal?.tipo === 'ampliacion' && <AmpliacionModal e={modal.e} onClose={() => setModal(null)} />}
    </>
  );
}
