// HU-4 · Alertas de vencimiento: vencidos sin presentar y próximos a vencer (14 días).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { REQ_ADMIN } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { EmptyState, Modal, PageHeader } from '../../components/ui.jsx';
import { AmpliacionModal, AvanceModal } from '../../components/AvanceModal.jsx';

export default function Alerts() {
  const { db, user } = useApp();
  const [modal, setModal] = useState(null);
  const [req, setReq] = useState(false);
  const t = D.trabajoActivo(db, user.id);
  if (!t) return <div className="card-tfc"><EmptyState title="Aún no tienes trabajo" action={<Link className="btn btn-primary" to="/mi-trabajo/nuevo">Registrar mi trabajo</Link>} /></div>;
  const al = D.alertasTrabajo(db, t.id);
  const adminDias = D.diffDays(REQ_ADMIN.fecha, D.HOY);
  const mostrarAdmin = D.esVigente(t) && adminDias >= 0;
  const hayAlertas = al.vencidos.length + al.proximos.length + (mostrarAdmin ? 1 : 0) > 0;
  const puede = (i) => i.puedeRegistrar && t.asesorId;

  return (
    <>
      <PageHeader crumbs={[['Entregables', '/entregables'], ['Alertas']]} title="Alertas de vencimiento" subtitle={`Al ${fmt(D.HOY)} · ${al.vencidos.length} vencido(s) y ${al.proximos.length + (mostrarAdmin ? 1 : 0)} próximo(s) a vencer en los siguientes 14 días`} actions={<Link to="/entregables" className="btn btn-outline-primary">Ver plan completo</Link>} />
      {!hayAlertas && <div className="card-tfc mb-3"><EmptyState tone="ok" icon="✓" title="Todo al día" text="No tienes entregables vencidos ni próximos a vencer en los siguientes 14 días." action={<Link to="/entregables" className="btn btn-outline-primary">Ver plan de entregables</Link>} /></div>}
      {al.vencidos.length > 0 && (
        <div className="card-tfc danger mb-3 overflow-hidden"><div className="p-3 fw-bold text-danger2 d-flex justify-content-between">Vencidos sin presentar<span className="tag bg-white text-danger2">{al.vencidos.length} entregable(s)</span></div>
          {al.vencidos.map(({ e, i }) => (
            <div className="bg-white p-3 d-flex flex-wrap justify-content-between gap-2 border-top" key={e.id}>
              <div><div className="fw-semibold"><span className="dot" style={{ background: 'var(--c-danger)' }} />{e.orden}. {e.nombre}</div><div className="aux">{t.titulo} · peso {e.peso}</div><div className="small text-danger2">Venció el {fmt(e.fechaLimite)} · {i.diasRetraso} días de retraso · sin avances registrados</div></div>
              <div className="d-flex gap-2 align-items-center"><button className="btn btn-outline-danger" onClick={() => setModal({ tipo: 'amp', e })}>Solicitar ampliación</button><button className="btn btn-danger" disabled={!puede(i)} onClick={() => setModal({ tipo: 'avance', e })}>Registrar avance</button></div>
            </div>))}
        </div>
      )}
      {(al.proximos.length > 0 || mostrarAdmin) && (
        <div className="card-tfc warn mb-3 overflow-hidden"><div className="p-3 fw-bold text-warn2 d-flex justify-content-between">Próximos a vencer · siguientes 14 días<span className="tag bg-white text-warn2">{al.proximos.length + (mostrarAdmin ? 1 : 0)} entregable(s)</span></div>
          {al.proximos.map(({ e, i }) => (
            <div className="bg-white p-3 d-flex flex-wrap justify-content-between gap-2 border-top" key={e.id}>
              <div><div className="fw-semibold"><span className="dot todo" />{e.orden}. {e.nombre}</div><div className="aux">{t.titulo} · peso {e.peso}</div><div className="small text-warn2">Vence el {fmt(e.fechaLimite)} · faltan {D.diffDays(e.fechaLimite, D.HOY)} días</div></div>
              <button className="btn btn-outline-primary align-self-center" disabled={!puede(i)} onClick={() => setModal({ tipo: 'avance', e })}>Registrar avance</button>
            </div>))}
          {mostrarAdmin && (
            <div className="bg-white p-3 d-flex flex-wrap justify-content-between gap-2 border-top">
              <div><div className="fw-semibold"><span className="dot" style={{ background: 'var(--c-accent)' }} />{REQ_ADMIN.nombre}</div><div className="aux">{REQ_ADMIN.descripcion}</div><div className="small text-warn2">Vence el {fmt(REQ_ADMIN.fecha)} · faltan {adminDias} días</div></div>
              <button className="btn btn-outline-primary align-self-center" onClick={() => setReq(true)}>Ver requisitos</button>
            </div>)}
        </div>
      )}
      <div className="card-tfc pad d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex gap-3 align-items-center"><span className="empty ok p-0"><span className="icon m-0">✓</span></span><div><div className="serif fs-5 fw-semibold">Sin alertas para los entregables ya aprobados</div><div className="aux">{D.entregablesDe(db, t.id).filter((e) => D.aprobadoE(db, e)).map((e) => e.nombre).join(', ') || 'Aún no hay entregables aprobados'}.</div></div></div>
        <div className="d-flex gap-4"><div><div className="eyebrow">Aprobados</div><div className="fs-3 fw-semibold text-ok">{al.aprobados}</div></div><div><div className="eyebrow">Vencidos</div><div className="fs-3 fw-semibold text-danger2">{al.vencidos.length}</div></div><div><div className="eyebrow">Pendientes</div><div className="fs-3 fw-semibold text-muted2">{al.pendientes}</div></div></div>
      </div>
      {modal?.tipo === 'avance' && <AvanceModal e={modal.e} onClose={() => setModal(null)} />}
      {modal?.tipo === 'amp' && <AmpliacionModal e={modal.e} onClose={() => setModal(null)} />}
      {req && <Modal title="Entrega de informe impreso" onClose={() => setReq(false)} footer={<button className="btn btn-primary" onClick={() => setReq(false)}>Entendido</button>}><p>Presenta el informe final impreso en la oficina TFC hasta el {fmt(REQ_ADMIN.fecha)}, al menos 5 días hábiles antes de la sustentación.</p><p className="text-muted2 small mb-0">Este requisito es administrativo y no suma puntos al avance del trabajo.</p></Modal>}
    </>
  );
}
