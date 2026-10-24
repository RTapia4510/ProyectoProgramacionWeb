// HU-6 · Sustentaciones del periodo: listado, reprogramación y acceso a jurado y acta.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { HORAS, SALAS, SALA_LABEL, VENTANA_SUST } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { EmptyState, Field, Modal, PageHeader, Tag } from '../../components/ui.jsx';

export default function Sustentaciones() {
  const { db, rescheduleSust, notify } = useApp();
  const [rep, setRep] = useState(null);
  const [f, setF] = useState({});
  const [err, setErr] = useState(null);
  const lista = [...db.sustentaciones].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  const porProgramar = db.trabajos.filter((t) => t.estado === 'concluido' && !D.sustDe(db, t.id));
  const abrir = (s) => { setRep(s); setF({ fecha: s.fecha, hora: s.hora, sala: s.sala, modalidad: s.modalidad }); setErr(null); };
  const guardar = () => {
    const r = rescheduleSust(rep.id, f);
    if (r.ok) { setRep(null); return notify('success', 'Sustentación reprogramada', 'Se notificó al equipo, al asesor y al jurado.'); }
    setErr(r.error === 'ocupada' ? `La sala ${f.sala} está ocupada el ${fmt(f.fecha)} a las ${f.hora}. Alternativas: ${r.alternativas.map((x) => `${x.sala} · ${x.hora}`).join(' · ')}` : r.error);
  };
  return (
    <>
      <PageHeader crumbs={[['Inicio'], ['Sustentaciones']]} title="Sustentaciones" subtitle={`Ventana de sustentaciones ${fmt(VENTANA_SUST.ini)} – ${fmt(VENTANA_SUST.fin)} · ${porProgramar.length} concluido(s) por programar`} actions={<Link to="/admin/sustentaciones/nueva" className="btn btn-primary">Programar sustentación</Link>} />
      <div className="card-tfc mb-3">
        {lista.length === 0 ? <EmptyState icon="▤" title="Aún no hay sustentaciones programadas" text="Programa las sustentaciones de los trabajos concluidos." /> : (
          <div className="table-responsive"><table className="table table-tfc"><thead><tr><th>Trabajo</th><th>Fecha y hora</th><th>Sala</th><th>Modalidad</th><th>Jurado</th><th>Estado</th><th className="text-end">Acciones</th></tr></thead>
            <tbody>{lista.map((s) => { const t = D.byId(db.trabajos, s.trabajoId); const hecho = !!s.acta; return (
              <tr key={s.id}><td><div className="serif">{t.titulo}</div><div className="aux">{t.codigo}</div></td><td>{fmt(s.fecha)} · {s.hora}</td><td>{s.sala}</td><td>{s.modalidad}</td><td>{s.jurado.length}/3</td><td><Tag k={s.estado} /></td>
                <td className="text-end text-nowrap"><Link className="btn btn-link btn-sm" to={`/admin/sustentaciones/${s.id}/jurado`}>Jurado</Link><Link className="btn btn-link btn-sm" to={`/admin/sustentaciones/${s.id}/acta`}>{hecho ? 'Ver acta' : 'Acta'}</Link>{!hecho && <button className="btn btn-link btn-sm" onClick={() => abrir(s)}>Reprogramar</button>}</td></tr>); })}</tbody></table></div>
        )}
      </div>
      {porProgramar.length > 0 && (
        <div className="card-tfc pad"><div className="eyebrow mb-2">Concluidos por programar</div>
          {porProgramar.map((t) => <div className="rowline d-flex justify-content-between align-items-center" key={t.id}><div><div className="serif">{t.titulo}</div><div className="aux">{t.codigo} · asesor {D.nombreAsesor(D.byId(db.usuarios, t.asesorId))}</div></div><Link to={`/admin/sustentaciones/nueva?trabajo=${t.id}`} className="btn btn-outline-primary btn-sm">Programar</Link></div>)}</div>
      )}
      {rep && (
        <Modal title="Reprogramar sustentación" onClose={() => setRep(null)} footer={<><button className="btn btn-link" onClick={() => setRep(null)}>Cancelar</button><button className="btn btn-primary" onClick={guardar}>Reprogramar</button></>}>
          <div className="aux mb-3">{D.byId(db.trabajos, rep.trabajoId).titulo}</div>
          {err && <div className="card-tfc danger p-2 small text-danger2 mb-3">{err}</div>}
          <div className="row g-3">
            <Field className="col-6" label="Fecha"><input type="date" className="form-control" min={VENTANA_SUST.ini} max={VENTANA_SUST.fin} value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Field>
            <Field className="col-6" label="Hora"><select className="form-select" value={f.hora} onChange={(e) => setF({ ...f, hora: e.target.value })}>{HORAS.map((h) => <option key={h}>{h}</option>)}</select></Field>
            <Field className="col-12" label="Sala"><select className="form-select" value={f.sala} onChange={(e) => setF({ ...f, sala: e.target.value })}>{SALAS.map((h) => <option key={h} value={h}>{SALA_LABEL[h]}</option>)}</select></Field>
          </div>
        </Modal>
      )}
    </>
  );
}
