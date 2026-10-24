// HU-7 · Carga por asesor: cupo ocupado, avances por revisar, tiempo de revisión y redistribución.
import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import * as D from '../../services/domain.jsx';
import { ConfirmModal, Modal, PageHeader, Tag } from '../../components/ui.jsx';

export default function Load() {
  const { db, setCupoMax, notify } = useApp();
  const [det, setDet] = useState(null);
  const [amp, setAmp] = useState(null);
  const todos = db.usuarios.filter((u) => u.rol === 'asesor' && u.estado === 'activo');
  const filas = todos.map((a) => ({ a, c: D.cupoAsesor(db, a), n: D.pendientesRevision(db, a.id).length })).filter((x) => x.c.ocupados > 0).sort((x, y) => y.c.ocupados / (y.c.max || 1) - x.c.ocupados / (x.c.max || 1));
  const critico = filas.find((x) => x.c.disponible === 0 && x.n > 0);
  const libres = todos.map((a) => ({ a, c: D.cupoAsesor(db, a) })).filter((x) => x.c.disponible > 0 && critico && x.a.lineas.some((l) => critico.a.lineas.includes(l))).sort((x, y) => y.c.disponible - x.c.disponible).slice(0, 2);
  const totMax = todos.reduce((s, a) => s + a.cupoMax, 0);
  const totOcu = todos.reduce((s, a) => s + D.cupoAsesor(db, a).ocupados, 0);
  const prom = filas.length ? (filas.reduce((s, x) => s + x.a.tiempoRevision, 0) / filas.length).toFixed(1) : '0.0';
  const tone = (c) => { const r = c.ocupados / (c.max || 1); return r >= 1 ? 'var(--c-danger)' : r >= 0.75 ? 'var(--c-warning)' : 'var(--c-primary)'; };

  const exportar = () => {
    D.exportCsv('tfc-2026-2-carga-asesores.csv', [['Asesor', 'Departamento', 'Cupo ocupado', 'Cupo máximo', 'Disponible', 'Por revisar', 'Tiempo de revisión (días)'], ...filas.map(({ a, c, n }) => [D.nombreAsesor(a), a.departamento, c.ocupados, c.max, c.disponible, n, a.tiempoRevision])]);
    notify('success', 'Reporte exportado', `tfc-2026-2-carga-asesores.csv · ${filas.length} asesores`);
  };

  return (
    <>
      <PageHeader crumbs={[['Inicio'], ['Carga por asesor']]} title="Carga por asesor" subtitle={`${filas.length} asesores con trabajos a cargo · ordenados por cupo ocupado`} actions={<button className="btn btn-outline-primary" onClick={exportar}>Exportar a Excel</button>} />
      <div className="card-tfc mb-3"><div className="table-responsive"><table className="table table-tfc"><thead><tr><th>Asesor</th><th style={{ minWidth: 220 }}>Cupo ocupado</th><th>Disponible</th><th>Por revisar</th><th>Tiempo de revisión</th><th className="text-end">Acción</th></tr></thead>
        <tbody>{filas.map(({ a, c, n }) => (
          <tr key={a.id}><td><div className="fw-semibold">{D.nombreAsesor(a)}</div><div className="aux">{a.departamento}</div></td>
            <td><div className="d-flex align-items-center gap-2"><div className="progress-tfc flex-grow-1"><span style={{ width: `${Math.min(100, (c.ocupados * 100) / (c.max || 1))}%`, background: tone(c) }} /></div><b className="small">{c.ocupados} / {c.max}</b></div></td>
            <td className={`fw-bold ${c.disponible === 0 ? 'text-danger2' : c.disponible === 1 ? 'text-warn2' : 'text-ok'}`}>{c.disponible}</td><td>{n}</td><td className={a.tiempoRevision > 4 ? 'text-danger2 fw-semibold' : ''}>{a.tiempoRevision} días</td>
            <td className="text-end"><button className="btn btn-link btn-sm" onClick={() => setDet(a)}>Ver detalle</button></td></tr>))}</tbody></table></div></div>
      <div className="row g-3">
        <div className="col-lg-7">{critico ? (
          <div className="card-tfc warn pad h-100"><div className="fw-bold text-warn2 mb-1">Recomendación de redistribución</div>
            <div className="small text-warn2 mb-3">{D.nombreAsesor(critico.a)} está al 100% de su cupo y con {critico.n} avances en espera. Considera derivar las solicitudes de {critico.a.lineas[0]} {libres.length ? `a ${libres.map((x) => `${D.nombreAsesor(x.a)} (${x.c.disponible} cupos libres)`).join(' o a ')}` : 'a otros asesores con cupo'}.</div>
            <div className="d-flex gap-2"><button className="btn btn-warn" onClick={() => notify('success', 'Mensaje enviado', `Se notificó a ${D.nombreAsesor(critico.a)}.`)}>Escribir al asesor</button><button className="btn btn-outline-accent" onClick={() => setAmp(critico.a)}>Ampliar su cupo máximo</button></div></div>
        ) : <div className="card-tfc soft pad h-100">Sin recomendaciones de redistribución: ningún asesor con cupo completo tiene avances en espera.</div>}</div>
        <div className="col-lg-5"><div className="card-tfc pad h-100"><div className="eyebrow mb-2">Resumen de la facultad</div>
          <div className="row"><div className="col-4"><div className="eyebrow">Cupos ocupados</div><div className="serif fs-4">{totOcu} de {totMax}</div></div><div className="col-4"><div className="eyebrow">Asesores sin carga</div><div className="serif fs-4">{todos.length - filas.length}</div></div><div className="col-4"><div className="eyebrow">Revisión promedio</div><div className="serif fs-4">{prom} días</div></div></div>
          <div className="aux border-top mt-3 pt-2">El objetivo institucional es responder cada avance en un máximo de 4 días hábiles.</div></div></div>
      </div>
      {det && (
        <Modal title={D.nombreAsesor(det)} onClose={() => setDet(null)} footer={<button className="btn btn-primary" onClick={() => setDet(null)}>Cerrar</button>}>
          <div className="aux mb-2">{det.departamento} · {det.lineas.join(', ')}</div>
          {db.trabajos.filter((t) => t.asesorId === det.id).map((t) => <div className="rowline d-flex justify-content-between gap-2" key={t.id}><div><div className="serif">{t.titulo}</div><div className="aux">{t.codigo} · {D.avanceTrabajo(db, t.id)}%</div></div><Tag k={t.estado} /></div>)}
          {db.trabajos.every((t) => t.asesorId !== det.id) && <div className="text-muted2 small">Sin trabajos asignados en esta muestra.</div>}
        </Modal>
      )}
      {amp && <ConfirmModal title="Ampliar cupo máximo" confirmLabel="Ampliar en 1" onClose={() => setAmp(null)} onConfirm={() => { setCupoMax(amp.id, amp.cupoMax + 1); setAmp(null); notify('success', 'Cupo ampliado', `${D.nombreAsesor(amp)} ahora tiene un cupo máximo de ${amp.cupoMax + 1}.`); }}>El cupo máximo de <b>{D.nombreAsesor(amp)}</b> pasará de {amp.cupoMax} a {amp.cupoMax + 1}.</ConfirmModal>}
    </>
  );
}
