// HU-3 · Mis asesorados: trabajos a cargo, estado de revisión y próximos vencimientos.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { ConfirmModal, EmptyState, PageHeader, Progress, Tag } from '../../components/ui.jsx';

export default function Mentees() {
  const { db, user, endAdvisory, notify } = useApp();
  const [fin, setFin] = useState(null);
  const mios = db.trabajos.filter((t) => t.asesorId === user.id && t.estado !== 'desistido');
  const pend = D.pendientesRevision(db, user.id);
  const cupo = D.cupoAsesor(db, user);
  const venc = mios.flatMap((t) => D.entregablesDe(db, t.id).filter((e) => !D.aprobadoE(db, e) && D.avancesDe(db, e.id).length === 0).map((e) => ({ t, e })))
    .sort((a, b) => a.e.fechaLimite.localeCompare(b.e.fechaLimite)).slice(0, 6);

  return (
    <>
      <PageHeader crumbs={[['Inicio'], ['Mis asesorados']]} title="Mis asesorados" subtitle={`${mios.length} trabajos a cargo · ${pend.length} avances pendientes de revisión`} actions={<Link to="/asesor/revision" className="btn btn-outline-primary">Ir a la bandeja de revisión</Link>} />
      {mios.length === 0 ? <div className="card-tfc"><EmptyState title="Aún no tienes asesorados" text="Los estudiantes te encontrarán en el directorio según tus líneas de investigación." action={<Link to="/asesor/ficha" className="btn btn-outline-primary">Revisar mi ficha</Link>} /></div> : (
        <div className="row g-3 mb-3">
          {mios.map((t) => {
            const pct = D.avanceTrabajo(db, t.id);
            const n = pend.filter((x) => x.e.trabajoId === t.id).length;
            const al = D.alertasTrabajo(db, t.id);
            const prox = D.proximoVencimiento(db, t.id);
            const sust = D.sustDe(db, t.id);
            return (
              <div className="col-lg-6 col-xl-4" key={t.id}><div className="card-tfc pad h-100 d-flex flex-column">
                <div className="d-flex justify-content-between mb-2"><Tag k={t.estado} /><span className={`tag ${n ? 'st-warn' : 'st-muted'}`}>{n ? `${n} por revisar` : 'Sin pendientes'}</span></div>
                <h3 className="serif mb-1" style={{ fontFamily: 'Lora, serif', fontSize: '1.15rem' }}>{t.titulo}</h3>
                <div className="aux mb-3">{t.integrantes.map((i) => D.nombreCompleto(D.byId(db.usuarios, i))).join(', ')}</div>
                <div className="d-flex align-items-center gap-2 mb-1"><Progress value={pct} className="flex-grow-1" tone={pct === 100 ? 'ok' : ''} /><b>{pct}%</b></div>
                <div className={`small mb-3 ${al.vencidos.length ? 'text-danger2' : 'text-warn2'}`}>
                  {al.vencidos.length ? `${al.vencidos.length} entregable vencido sin presentar` : t.estado === 'concluido' ? (sust ? `Sustentación ${fmt(sust.fecha)} · ${sust.hora}` : 'Sustentación pendiente de programar por coordinación') : prox ? `Próximo vencimiento ${fmt(prox)}` : 'Sin vencimientos próximos'}
                </div>
                <div className="d-flex gap-2 flex-wrap mt-auto border-top pt-3">
                  <Link to={`/asesor/asesorados/${t.id}`} className="btn btn-primary btn-sm">Ver trabajo</Link>
                  <Link to={`/asesor/asesorados/${t.id}/plan`} className="btn btn-outline-primary btn-sm">Plan</Link>
                  {D.esVigente(t) && <button className="btn btn-outline-danger btn-sm" onClick={() => setFin(t)}>Terminar asesoría</button>}
                </div>
              </div></div>);
          })}
        </div>
      )}
      {venc.length > 0 && (
        <div className="card-tfc"><div className="card-head"><span className="eyebrow">Próximos vencimientos de mis asesorados</span></div>
          <div className="table-responsive"><table className="table table-tfc mb-0"><tbody>{venc.map(({ t, e }) => {
            const d = D.diffDays(e.fechaLimite, D.HOY);
            return <tr key={e.id}><td className="text-truncate" style={{ maxWidth: 360 }}>{t.titulo}</td><td>{e.orden}. {e.nombre}</td><td className={d < 0 ? 'text-danger2 fw-semibold' : d <= 14 ? 'text-warn2 fw-semibold' : 'text-muted2'}>{d < 0 ? `Vencido · ${fmt(e.fechaLimite)}` : d <= 14 ? `Faltan ${d} días · ${fmt(e.fechaLimite)}` : fmt(e.fechaLimite)}</td><td>Peso {e.peso}</td></tr>;
          })}</tbody></table></div></div>
      )}
      <div className="aux mt-3">Cupo: {cupo.disponible} de {cupo.max} disponibles.</div>
      {fin && (
        <ConfirmModal title="Terminar la asesoría" danger confirmLabel="Terminar asesoría" motivo minMotivo={20} onClose={() => setFin(null)}
          onConfirm={(m) => { endAdvisory(fin.id, m); setFin(null); notify('success', 'Asesoría terminada', 'Se notificó al equipo y a la coordinación. Tu cupo se actualizó.'); }}>
          El trabajo «{fin.titulo}» quedará sin asesor y su plan de entregables se detendrá hasta que otro asesor acepte. Se notificará al equipo y a la coordinación. Tu cupo pasará de {cupo.disponible} a {cupo.disponible + 1} disponibles.
        </ConfirmModal>
      )}
    </>
  );
}
