// HU-6 · Programar sustentación: valida ventana de fechas y que la sala no tenga dos sustentaciones a la misma hora.
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { HORAS, MODALIDADES, SALAS, SALA_LABEL, VENTANA_SUST } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { EmptyState, Field, Modal, PageHeader, inv } from '../../components/ui.jsx';

export default function Program() {
  const { db, programSust, notify } = useApp();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const disponibles = db.trabajos.filter((t) => t.estado === 'concluido' && !D.sustDe(db, t.id));
  const [f, setF] = useState({ trabajoId: sp.get('trabajo') || disponibles[0]?.id || '', fecha: '2026-12-11', hora: '10:00', sala: 'A-402', modalidad: 'Presencial' });
  const [err, setErr] = useState({});
  const [conf, setConf] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const t = D.byId(db.trabajos, f.trabajoId);
  const ocupada = D.slotOcupado(db, f.fecha, f.hora, f.sala);
  const enVentana = f.fecha >= VENTANA_SUST.ini && f.fecha <= VENTANA_SUST.fin;

  if (disponibles.length === 0) return <div className="card-tfc"><EmptyState icon="▤" title="No hay trabajos concluidos por programar" text="Solo los trabajos en estado Concluido pueden programarse." action={<Link to="/admin/sustentaciones" className="btn btn-primary">Volver a sustentaciones</Link>} /></div>;

  const guardar = () => {
    const e = {};
    if (!f.trabajoId) e.trabajoId = 'Selecciona un trabajo concluido';
    if (!enVentana) e.fecha = `Dentro de la ventana ${fmt(VENTANA_SUST.ini)} – ${fmt(VENTANA_SUST.fin)}`;
    setErr(e);
    if (Object.keys(e).length) return;
    const r = programSust(f);
    if (r.ok) { notify('success', 'Sustentación programada', 'Ahora conforma el jurado. Se notificó al equipo y al asesor.'); return nav(`/admin/sustentaciones/${r.sust.id}/jurado`); }
    if (r.error === 'ocupada') return setConf(r);
    notify('danger', 'No se pudo programar', r.error);
  };

  return (
    <>
      <PageHeader crumbs={[['Sustentaciones', '/admin/sustentaciones'], ['Programar']]} title="Programar sustentación" subtitle="Solo los trabajos en estado Concluido pueden programarse. La sala no puede tener dos sustentaciones a la misma hora." />
      <div className="row g-3">
        <div className="col-lg-8"><div className="card-tfc pad">
          <Field label="Trabajo concluido" error={err.trabajoId} hint={`${disponibles.length} trabajos concluidos disponibles${t ? ` · asesor ${D.nombreAsesor(D.byId(db.usuarios, t.asesorId))} · equipo de ${t.integrantes.length} integrantes` : ''}`} className="mb-3">
            <select className={`form-select serif${inv(err.trabajoId)}`} value={f.trabajoId} onChange={set('trabajoId')}>{disponibles.map((x) => <option key={x.id} value={x.id}>{x.titulo}</option>)}</select></Field>
          <div className="row g-3 mb-3">
            <Field className="col-md-6" label="Fecha" error={err.fecha} hint={`Dentro de la ventana ${fmt(VENTANA_SUST.ini)} – ${fmt(VENTANA_SUST.fin)}`}><input type="date" className={`form-control${inv(err.fecha)}`} value={f.fecha} onChange={set('fecha')} /></Field>
            <Field className="col-md-6" label="Hora" hint="Bloques de 60 minutos"><select className="form-select" value={f.hora} onChange={set('hora')}>{HORAS.map((h) => <option key={h}>{h}</option>)}</select></Field>
            <Field className="col-md-6" label="Sala"><select className="form-select" value={f.sala} onChange={set('sala')}>{SALAS.map((s) => <option key={s} value={s}>{SALA_LABEL[s]}</option>)}</select></Field>
            <Field className="col-md-6" label="Modalidad"><div className="btn-group w-100">{MODALIDADES.map((m) => <button key={m} type="button" className={`btn ${f.modalidad === m ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setF({ ...f, modalidad: m })}>{m}</button>)}</div></Field>
          </div>
          {enVentana && (ocupada
            ? <div className="card-tfc danger p-2 small text-danger2 mb-3">❗ La sala {f.sala} está ocupada el {fmt(f.fecha)} a las {f.hora} por «{D.byId(db.trabajos, ocupada.trabajoId).titulo}».</div>
            : <div className="card-tfc soft p-2 small mb-3">✔ La sala {f.sala} está libre el {fmt(f.fecha)} a las {f.hora}. Se validará que ningún miembro del jurado tenga otra sustentación en ese bloque.</div>)}
          <div className="card-tfc flat p-3 small mb-3"><div className="eyebrow mb-1">Notificaciones al guardar</div>Se notificará al equipo, al asesor y a los miembros del jurado con la fecha, hora, sala y modalidad.</div>
          <hr /><div className="d-flex justify-content-end gap-2"><Link to="/admin/sustentaciones" className="btn btn-link">Cancelar</Link><button className="btn btn-primary" onClick={guardar}>Programar y conformar jurado</button></div>
        </div></div>
        <div className="col-lg-4 d-grid gap-3 align-content-start">
          <div className="card-tfc pad"><div className="eyebrow mb-2">Sala {f.sala} · {fmt(f.fecha)}</div>
            {HORAS.map((h) => { const o = D.slotOcupado(db, f.fecha, h, f.sala); const sel = h === f.hora; return <div key={h} className={`slot ${sel ? 'sel' : o ? 'busy' : ''}`}><span>{h} – {String(Number(h.slice(0, 2)) + 1).padStart(2, '0')}:00</span><span className={sel ? '' : o ? 'text-danger2' : 'text-ok'}>{sel ? 'Seleccionada' : o ? 'Ocupada' : 'Libre'}</span></div>; })}</div>
          <div className="card-tfc pad"><div className="eyebrow mb-2">Sustentaciones del periodo</div>
            {[['Programadas', db.sustentaciones.filter((s) => !s.acta).length], ['Realizadas', db.sustentaciones.filter((s) => s.acta).length], ['Concluidos por programar', disponibles.length]].map(([l, v]) => <div className="d-flex justify-content-between py-1" key={l}><span>{l}</span><b>{v}</b></div>)}
            <Link to="/admin/sustentaciones" className="fw-semibold small">Ver calendario completo</Link></div>
        </div>
      </div>
      {conf && (
        <Modal title="La sala ya está ocupada" onClose={() => setConf(null)} footer={<button className="btn btn-link" onClick={() => setConf(null)}>Cambiar datos</button>}>
          <div className="card-tfc danger p-2 small text-danger2 mb-3">La sala {f.sala} está ocupada el {fmt(f.fecha)} a las {f.hora} por «{D.byId(db.trabajos, conf.conflicto.trabajoId).titulo}».</div>
          <div className="card-tfc flat p-3"><div className="eyebrow mb-2">Alternativas disponibles</div>
            {conf.alternativas.map((a) => <div className="card-tfc p-2 px-3 d-flex justify-content-between mb-2" key={a.sala + a.hora}><span>{a.sala} · {fmt(a.fecha)} · {a.hora}</span><button className="btn btn-link btn-sm p-0" onClick={() => { setF({ ...f, sala: a.sala, hora: a.hora }); setConf(null); }}>Usar</button></div>)}</div>
        </Modal>
      )}
    </>
  );
}
