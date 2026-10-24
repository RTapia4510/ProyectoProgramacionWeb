// HU-5 · Bandeja de revisión: avances pendientes ordenados por antigüedad y revisados.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { EmptyState, PageHeader, Pager, Tag } from '../../components/ui.jsx';

const POR_PAG = 6;

export default function Inbox() {
  const { db, user } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState('pendientes');
  const [page, setPage] = useState(1);
  const pend = D.pendientesRevision(db, user.id);
  const mis = db.trabajos.filter((t) => t.asesorId === user.id).map((t) => t.id);
  const rev = db.avances.filter((a) => a.estado !== 'entregado').map((a) => ({ a, e: D.byId(db.entregables, a.entregableId) })).filter((x) => x.e && mis.includes(x.e.trabajoId))
    .sort((x, y) => (y.a.fechaRevision || '').localeCompare(x.a.fechaRevision || ''));
  const lista = tab === 'pendientes' ? pend : rev;
  const pages = Math.max(1, Math.ceil(lista.length / POR_PAG));
  const p = Math.min(page, pages);
  const fila = lista.slice((p - 1) * POR_PAG, p * POR_PAG);
  const espera = (f) => D.diffDays(D.HOY, f);

  return (
    <>
      <PageHeader crumbs={[['Inicio'], ['Bandeja de revisión']]} title="Bandeja de revisión" subtitle={tab === 'pendientes' ? `${pend.length} avances pendientes · ordenados por antigüedad de entrega` : `${rev.length} avances revisados`}
        actions={<div className="btn-group"><button className={`btn ${tab === 'pendientes' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setTab('pendientes'); setPage(1); }}>Pendientes ({pend.length})</button><button className={`btn ${tab === 'revisados' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => { setTab('revisados'); setPage(1); }}>Revisados ({rev.length})</button></div>} />
      <div className="card-tfc">
        {lista.length === 0 ? (
          <EmptyState tone="ok" icon="✓" title={tab === 'pendientes' ? 'Sin avances por revisar' : 'Aún no has revisado avances'} text={tab === 'pendientes' ? `Revisaste todo lo que tus asesorados entregaron.` : ''} action={<Link to="/asesor/asesorados" className="btn btn-outline-primary">Ver mis asesorados</Link>} />
        ) : (
          <div className="table-responsive"><table className="table table-tfc"><thead><tr><th>Trabajo</th><th>Entregable</th><th>Versión</th><th>{tab === 'pendientes' ? 'Entrega' : 'Revisión'}</th><th className="text-end">Acción</th></tr></thead>
            <tbody>{fila.map(({ a, e }) => {
              const t = D.byId(db.trabajos, e.trabajoId);
              const w = espera(a.fechaEntrega);
              return (
                <tr key={a.id}>
                  <td><div className="serif">{t.titulo}</div><div className="aux">{D.nombreCompleto(D.byId(db.usuarios, t.responsableId))}</div></td>
                  <td>{e.nombre}{a.retraso && <div className="aux text-warn2 fw-semibold">Entregado con retraso</div>}</td>
                  <td>v{a.version}</td>
                  <td>{tab === 'pendientes' ? <>{fmt(a.fechaEntrega)}<div className={`aux fw-semibold ${w > 7 ? 'text-danger2' : w >= 3 ? 'text-warn2' : 'text-ok'}`}>{w === 0 ? 'Hoy' : `${w} días en espera`}</div></> : <><Tag k={a.estado} /><div className="aux">{fmt(a.fechaRevision)}</div></>}</td>
                  <td className="text-end"><button className={`btn btn-sm ${tab === 'pendientes' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => nav(`/asesor/revision/${a.id}`)}>{tab === 'pendientes' ? 'Revisar' : 'Ver'}</button></td>
                </tr>);
            })}</tbody></table></div>
        )}
        <div className="card-foot d-flex justify-content-between align-items-center"><span>Mostrando {lista.length ? (p - 1) * POR_PAG + 1 : 0}–{Math.min(p * POR_PAG, lista.length)} de {lista.length} · los avances con más de 7 días en espera se reportan a la coordinación</span><Pager page={p} pages={pages} onChange={setPage} /></div>
      </div>
    </>
  );
}
