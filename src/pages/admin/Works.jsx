// HU-7 · Listado de trabajos del periodo con filtros (estado, línea, asesor, carrera) y exportación.
import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { CARRERAS, LINEAS } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { EmptyState, Field, Modal, PageHeader, Pager, Progress, Tag } from '../../components/ui.jsx';
import { Timeline } from '../../components/WorkViews.jsx';

const POR_PAG = 12;

export default function Works() {
  const { db, notify } = useApp();
  const [f, setF] = useState({ q: '', estado: '', linea: '', asesor: '', carrera: '' });
  const [page, setPage] = useState(1);
  const [ver, setVer] = useState(null);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };
  const asesores = db.usuarios.filter((u) => u.rol === 'asesor' && u.estado === 'activo');
  const nombresEq = (t) => t.integrantes.map((i) => D.byId(db.usuarios, i).apellidos.split(' ')[0]).join(', ');
  const lista = db.trabajos.filter((t) => {
    const q = f.q.trim().toLowerCase();
    return (!q || t.titulo.toLowerCase().includes(q) || t.codigo.toLowerCase().includes(q) || nombresEq(t).toLowerCase().includes(q) || t.integrantes.some((i) => D.nombreCompleto(D.byId(db.usuarios, i)).toLowerCase().includes(q)))
      && (!f.estado || t.estado === f.estado) && (!f.linea || t.linea === f.linea) && (!f.carrera || t.carrera === f.carrera)
      && (!f.asesor || (f.asesor === 'ninguno' ? !t.asesorId : t.asesorId === f.asesor));
  });
  const pages = Math.max(1, Math.ceil(lista.length / POR_PAG));
  const p = Math.min(page, pages);
  const fila = lista.slice((p - 1) * POR_PAG, p * POR_PAG);
  const exportar = () => {
    D.exportCsv('tfc-2026-2-trabajos.csv', [['Código', 'Título', 'Línea', 'Carrera', 'Equipo', 'Asesor', 'Avance %', 'Estado'], ...lista.map((t) => [t.codigo, t.titulo, t.linea, t.carrera, nombresEq(t), t.asesorId ? D.nombreAsesor(D.byId(db.usuarios, t.asesorId)) : 'Sin asesor', D.avanceTrabajo(db, t.id), D.TAGS[t.estado][0]])]);
    notify('success', 'Reporte exportado', `tfc-2026-2-trabajos.csv · ${lista.length} trabajos`);
  };

  return (
    <>
      <PageHeader crumbs={[['Inicio'], ['Trabajos']]} title="Trabajos del periodo" subtitle={`${db.trabajos.length} trabajos · ${db.trabajos.filter((t) => t.estado === 'en_desarrollo').length} en desarrollo · ${db.trabajos.filter((t) => D.esVigente(t) && !t.asesorId).length} sin asesor`} actions={<button className="btn btn-outline-primary" onClick={exportar}>Exportar a Excel</button>} />
      <div className="card-tfc pad mb-3"><div className="row g-3">
        <Field className="col-lg-4" label="Buscar"><input className="form-control" placeholder="Título, código o integrante…" value={f.q} onChange={set('q')} /></Field>
        <Field className="col-6 col-lg-2" label="Estado"><select className="form-select" value={f.estado} onChange={set('estado')}><option value="">Todos</option>{['propuesta', 'en_desarrollo', 'concluido', 'desistido'].map((s) => <option key={s} value={s}>{D.TAGS[s][0]}</option>)}</select></Field>
        <Field className="col-6 col-lg-2" label="Línea"><select className="form-select" value={f.linea} onChange={set('linea')}><option value="">Todas</option>{LINEAS.map((l) => <option key={l}>{l}</option>)}</select></Field>
        <Field className="col-6 col-lg-2" label="Asesor"><select className="form-select" value={f.asesor} onChange={set('asesor')}><option value="">Todos</option><option value="ninguno">Sin asesor</option>{asesores.map((a) => <option key={a.id} value={a.id}>{D.nombreAsesor(a)}</option>)}</select></Field>
        <Field className="col-6 col-lg-2" label="Carrera"><select className="form-select" value={f.carrera} onChange={set('carrera')}><option value="">Todas</option>{CARRERAS.map((l) => <option key={l}>{l}</option>)}</select></Field>
      </div></div>
      <div className="card-tfc">
        {lista.length === 0 ? <EmptyState title="Ningún trabajo coincide" text="Prueba quitando algún filtro." action={<button className="btn btn-outline-primary" onClick={() => setF({ q: '', estado: '', linea: '', asesor: '', carrera: '' })}>Quitar filtros</button>} /> : (
          <div className="table-responsive"><table className="table table-tfc table-hover"><thead><tr><th>Título</th><th>Línea</th><th>Equipo</th><th>Asesor</th><th>Avance</th><th>Estado</th></tr></thead>
            <tbody>{fila.map((t) => (
              <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setVer(t)}>
                <td><div className="serif">{t.titulo}</div><div className="aux">{t.codigo}</div></td><td>{t.linea}</td><td>{nombresEq(t)}</td>
                <td>{t.asesorId ? D.byId(db.usuarios, t.asesorId).apellidos : <span className="text-warn2">Sin asesor</span>}</td>
                <td style={{ minWidth: 120 }}><div className="d-flex gap-2 align-items-center"><Progress value={D.avanceTrabajo(db, t.id)} className="flex-grow-1" tone={D.avanceTrabajo(db, t.id) === 100 ? 'ok' : t.estado === 'desistido' ? 'danger' : ''} /><b className="small">{D.avanceTrabajo(db, t.id)}%</b></div></td>
                <td><Tag k={t.estado} /></td></tr>))}</tbody></table></div>
        )}
        <div className="card-foot d-flex justify-content-between align-items-center"><span>Mostrando {lista.length ? (p - 1) * POR_PAG + 1 : 0}–{Math.min(p * POR_PAG, lista.length)} de {lista.length}</span><Pager page={p} pages={pages} onChange={setPage} /></div>
      </div>
      {ver && (
        <Modal title={ver.titulo} size="lg" onClose={() => setVer(null)} footer={<button className="btn btn-primary" onClick={() => setVer(null)}>Cerrar</button>}>
          <div className="d-flex gap-2 align-items-center mb-2"><Tag k={ver.estado} /><span className="aux">{ver.codigo} · {ver.linea} · {ver.carrera} · registrado {fmt(ver.registrado)}</span></div>
          <p className="small">{ver.resumen}</p>
          <div className="small mb-3"><b>Equipo:</b> {ver.integrantes.map((i) => D.nombreCompleto(D.byId(db.usuarios, i))).join(', ')} · <b>Asesor:</b> {ver.asesorId ? D.nombreAsesor(D.byId(db.usuarios, ver.asesorId)) : 'sin asesor'}</div>
          {D.entregablesDe(db, ver.id).length ? <Timeline db={db} trabajo={ver} /> : <div className="text-muted2 small">Sin plan de entregables.</div>}
          {ver.motivoEstado && <div className="card-tfc flat p-2 small mt-2">Motivo del estado: {ver.motivoEstado}</div>}
        </Modal>
      )}
    </>
  );
}
