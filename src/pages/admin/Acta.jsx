// HU-6 · Acta de sustentación: notas por criterio, nota final ponderada, resultado y vista de impresión.
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { CRITERIOS } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { ConfirmModal, EmptyState, Modal, PageHeader } from '../../components/ui.jsx';
import ActaSheet from '../../components/ActaSheet.jsx';

const RESULTADOS = ['Aprobado', 'Aprobado con observaciones', 'Desaprobado'];

export default function Acta() {
  const { db, registerActa, notify } = useApp();
  const { id } = useParams();
  const nav = useNavigate();
  const s = D.byId(db.sustentaciones, id);
  const previo = s && (s.acta || s.actaBorrador);
  const [notas, setNotas] = useState(previo ? previo.notas : { rigor: '', resultados: '', informe: '', exposicion: '' });
  const [resultado, setResultado] = useState(previo ? previo.resultado : 'Aprobado');
  const [obs, setObs] = useState(previo ? previo.observaciones : '');
  const [conf, setConf] = useState(false);
  const [imp, setImp] = useState(false);
  const [err, setErr] = useState('');
  if (!s) return <div className="card-tfc"><EmptyState title="Sustentación no encontrada" action={<Link className="btn btn-primary" to="/admin/sustentaciones">Volver</Link>} /></div>;
  const t = D.byId(db.trabajos, s.trabajoId);
  const definitiva = !!s.acta;
  const final = D.notaFinal(notas, CRITERIOS);
  const jur = s.jurado.map((j) => D.byId(db.usuarios, j));
  const validas = CRITERIOS.every((c) => notas[c.id] !== '' && Number(notas[c.id]) >= 0 && Number(notas[c.id]) <= 20);
  const datos = { notas, resultado, observaciones: obs };
  const tempSust = { ...s, acta: { ...datos, final, fecha: D.HOY } };

  const guardarBorrador = () => { registerActa(s.id, datos, true); notify('info', 'Borrador guardado', 'Podrás retomar el acta más tarde.'); };
  const pedir = () => { if (!validas) return setErr('Ingresa una nota de 0 a 20 en cada criterio.'); setErr(''); setConf(true); };
  const registrar = () => {
    const r = registerActa(s.id, datos, false);
    setConf(false);
    if (!r.ok) return notify('danger', 'No se pudo registrar el acta', r.error);
    notify('success', 'Acta registrada', 'Se notificó al equipo, al asesor y a la Secretaría Académica.');
    nav('/admin/sustentaciones');
  };

  return (
    <>
      <PageHeader crumbs={[['Sustentaciones', '/admin/sustentaciones'], ['Acta']]} title="Acta de sustentación" subtitle={`${fmt(s.fecha)} · ${s.hora} · Sala ${s.sala} · ${s.modalidad.toLowerCase()} · ${t.titulo}`} actions={<button className="btn btn-outline-primary" onClick={() => setImp(true)}>Ver vista de impresión</button>} />
      {s.jurado.length !== 3 && <div className="card-tfc warn p-2 small text-warn2 mb-3">El jurado aún no está conformado. <Link to={`/admin/sustentaciones/${s.id}/jurado`}>Conformar jurado</Link> antes de registrar el acta.</div>}
      <div className="row g-3">
        <div className="col-lg-8"><div className="card-tfc pad">
          <h2 className="mb-3">Calificación por criterios</h2>
          <div className="row eyebrow mb-2"><div className="col-6">Criterio</div><div className="col-3">Peso</div><div className="col-3">Nota (0–20)</div></div>
          {CRITERIOS.map((c) => (
            <div className="row align-items-center mb-2" key={c.id}><div className="col-6">{c.nombre}</div><div className="col-3 text-muted2">{c.peso}%</div>
              <div className="col-3"><input className="form-control text-center fw-bold" type="number" min={0} max={20} disabled={definitiva} value={notas[c.id]} onChange={(e) => setNotas({ ...notas, [c.id]: e.target.value })} aria-label={`Nota de ${c.nombre}`} /></div></div>))}
          <div className="card-tfc soft p-3 d-flex justify-content-between align-items-center my-3"><b>Nota final ponderada</b><span className="stat-big" style={{ fontSize: '1.9rem' }}>{validas ? final : '—'}</span></div>
          <div className="eyebrow mb-1">Resultado</div>
          <div className="btn-group w-100 mb-3">{RESULTADOS.map((r) => <button key={r} className={`btn ${resultado === r ? 'btn-primary' : 'btn-outline-primary'}`} disabled={definitiva} onClick={() => setResultado(r)}>{r}</button>)}</div>
          <div className="eyebrow mb-1">Observaciones del jurado</div>
          <textarea className="form-control mb-3" rows={3} disabled={definitiva} value={obs} onChange={(e) => setObs(e.target.value)} />
          {err && <div className="field-error mb-2">{err}</div>}
          <hr />
          {definitiva ? <div className="text-muted2 small">Acta registrada el {fmt(s.acta.fecha)}. Solo la Secretaría Académica puede rectificarla.</div> : <div className="d-flex justify-content-end gap-2"><button className="btn btn-link" onClick={guardarBorrador}>Guardar borrador</button><button className="btn btn-primary" onClick={pedir}>Registrar acta</button></div>}
        </div></div>
        <div className="col-lg-4 d-grid gap-3 align-content-start">
          <div className="card-tfc pad"><div className="eyebrow mb-2">Jurado que firma</div>{jur.length ? jur.map((j) => <div className="d-flex justify-content-between small py-1" key={j.id}><span>{D.nombreAsesor(j)}</span>{s.presidenteId === j.id && <span className="tag st-warn">Presidente</span>}</div>) : <div className="small text-muted2">Sin jurado conformado.</div>}</div>
          <div className="card-tfc pad small"><div className="eyebrow mb-2">Datos del trabajo</div>
            <div><b>Equipo</b> {t.integrantes.map((i) => D.nombreCompleto(D.byId(db.usuarios, i))).join(' · ')}</div><div><b>Asesor</b> {D.nombreAsesor(D.byId(db.usuarios, t.asesorId))}</div><div><b>Línea</b> {t.linea}</div><div><b>Avance del plan</b> {D.avanceTrabajo(db, t.id)}% · {D.entregablesDe(db, t.id).filter((e) => D.aprobadoE(db, e)).length} de {D.entregablesDe(db, t.id).length} aprobados</div></div>
          <div className="card-tfc warn pad"><div className="fw-bold text-warn2 mb-1">El acta es definitiva</div><div className="small text-warn2">Una vez registrada, solo la Secretaría Académica puede rectificarla. El estudiante verá el resultado y podrá descargar el acta firmada.</div></div>
        </div>
      </div>
      {conf && (
        <ConfirmModal title="Registrar el acta" confirmLabel="Registrar acta" onClose={() => setConf(false)} onConfirm={registrar}>
          <div className="card-tfc flat p-3 d-flex justify-content-between mb-3"><div><div className="eyebrow">Resultado</div><div className="serif fs-5">{resultado}</div></div><div className="text-end"><div className="eyebrow">Nota final</div><div className="stat-big text-ok">{final}</div></div></div>
          <div className="card-tfc warn p-2 small text-warn2">El acta queda definitiva: se notifica al equipo, al asesor y a la Secretaría Académica. Solo Secretaría puede rectificarla después.</div>
        </ConfirmModal>
      )}
      {imp && <Modal title="Vista de impresión" size="lg" onClose={() => setImp(false)} footer={<><button className="btn btn-link" onClick={() => setImp(false)}>Cerrar</button><button className="btn btn-primary" onClick={() => window.print()}>Imprimir / guardar como PDF</button></>}><ActaSheet db={db} sust={tempSust} /></Modal>}
    </>
  );
}
