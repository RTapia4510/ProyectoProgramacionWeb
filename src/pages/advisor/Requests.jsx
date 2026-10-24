// HU-3 · Solicitudes recibidas: aceptar (valida cupo) o rechazar (motivo obligatorio).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { ConfirmModal, EmptyState, PageHeader, Tag } from '../../components/ui.jsx';

export default function Requests() {
  const { db, user, resolveRequest, notify } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState('pendientes');
  const [rech, setRech] = useState(null);
  const cupo = D.cupoAsesor(db, user);
  const mias = db.solicitudes.filter((s) => s.asesorId === user.id);
  const pend = mias.filter((s) => s.estado === 'pendiente').sort((a, b) => a.fecha.localeCompare(b.fecha));
  const res = mias.filter((s) => s.estado !== 'pendiente').sort((a, b) => (b.fechaResolucion || '').localeCompare(a.fechaResolucion || ''));
  const lista = tab === 'pendientes' ? pend : res;

  const aceptar = (s) => {
    const r = resolveRequest(s.id, true);
    if (!r.ok) return notify('danger', 'No se pudo aceptar', r.error);
    notify('success', 'Asesoría aceptada', 'Define ahora el plan de entregables del trabajo.');
    nav(`/asesor/asesorados/${r.trabajoId}/plan`);
  };

  return (
    <>
      <PageHeader crumbs={[['Inicio'], ['Solicitudes recibidas']]} title="Solicitudes recibidas" subtitle={`${pend.length} solicitudes pendientes · aceptar ocupa un cupo de los ${cupo.disponible} disponibles`}
        actions={<div className="btn-group"><button className={`btn ${tab === 'pendientes' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('pendientes')}>Pendientes ({pend.length})</button><button className={`btn ${tab === 'resueltas' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('resueltas')}>Resueltas ({res.length})</button></div>} />
      {cupo.disponible === 0 && tab === 'pendientes' && <div className="card-tfc warn pad mb-3"><b className="text-warn2">Cupo completo · 0 de {cupo.max}</b><div className="small text-warn2">Para aceptar una nueva solicitud debes terminar una asesoría vigente o pedir a la coordinación ampliar tu cupo máximo. El botón «Aceptar asesoría» queda deshabilitado.</div></div>}
      {lista.length === 0 && <div className="card-tfc"><EmptyState icon="✉" title={tab === 'pendientes' ? 'Sin solicitudes pendientes' : 'Sin solicitudes resueltas'} text={tab === 'pendientes' ? `Tienes ${cupo.disponible} cupos disponibles. Los estudiantes te encontrarán en el directorio según tus líneas de investigación.` : ''} /></div>}
      <div className="d-grid gap-3">
        {lista.map((s) => {
          const t = D.byId(db.trabajos, s.trabajoId);
          const resp = D.byId(db.usuarios, t.responsableId);
          const otros = t.integrantes.filter((i) => i !== t.responsableId).map((i) => D.nombreCompleto(D.byId(db.usuarios, i)));
          return (
            <div className="card-tfc pad" key={s.id}>
              <div className="d-flex justify-content-between gap-3"><h2 className="mb-1" style={{ fontSize: '1.2rem' }}>{t.titulo}</h2><Tag k={s.estado} /></div>
              <div className="aux">{t.linea} · recibida el {fmt(s.fecha)} · {D.diffDays(D.HOY, s.fecha)} días en espera · código {t.codigo}</div>
              <div className="text-muted2 my-2">Equipo: {[`${D.nombreCompleto(resp)} (responsable)`, ...otros].join(', ')}</div>
              <div className="quote mb-3">«{s.mensaje}»</div>
              {s.motivo && <div className="small text-muted2 mb-2">Motivo: {s.motivo}</div>}
              {s.estado === 'pendiente' && (
                <div className="d-flex flex-wrap justify-content-between align-items-center border-top pt-3 gap-2">
                  <span className="aux">Al aceptar quedarás con {Math.max(0, cupo.disponible - 1)} cupos disponibles y deberás definir el plan de entregables</span>
                  <div className="d-flex gap-2"><button className="btn btn-outline-danger" onClick={() => setRech(s)}>Rechazar</button><button className="btn btn-primary" disabled={cupo.disponible <= 0} onClick={() => aceptar(s)}>Aceptar asesoría</button></div>
                </div>)}
            </div>);
        })}
      </div>
      <div className="card-tfc flat p-3 mt-3 small text-muted2">Rechazar una solicitud exige un motivo que el estudiante verá en su bandeja. Las solicitudes sin responder en 7 días se marcan como demoradas en el tablero de la coordinación.</div>
      {rech && <ConfirmModal title="Rechazar solicitud" danger confirmLabel="Rechazar" motivo minMotivo={20} onClose={() => setRech(null)} onConfirm={(m) => { resolveRequest(rech.id, false, m); setRech(null); notify('success', 'Solicitud rechazada', 'El estudiante verá el motivo en su bandeja.'); }}>El estudiante podrá solicitar a otro asesor. Explica brevemente por qué rechazas «{D.byId(db.trabajos, rech.trabajoId).titulo}».</ConfirmModal>}
    </>
  );
}
