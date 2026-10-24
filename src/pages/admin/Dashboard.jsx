// HU-7 · Tablero de métricas del periodo (por estado, avance, vencidos, líneas, carreras, alertas).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { CARRERAS, LINEAS } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { EmptyState, Field, PageHeader, Progress } from '../../components/ui.jsx';

export default function Dashboard() {
  const { db, notify } = useApp();
  const [periodo, setPeriodo] = useState('2026-2');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  if (periodo !== '2026-2') return (
    <>
      <PageHeader crumbs={[['Inicio'], ['Tablero']]} title="Tablero del periodo" subtitle={`Semestre ${periodo}`} actions={<select className="form-select" value={periodo} onChange={(e) => setPeriodo(e.target.value)}><option>2026-2</option><option>2027-1</option></select>} />
      <div className="card-tfc mx-auto" style={{ maxWidth: 520 }}><EmptyState icon="▤" title={`Sin datos para ${periodo}`} text="El periodo seleccionado aún no tiene trabajos registrados. Las métricas se activan con el primer registro de propuesta." action={<button className="btn btn-outline-primary" onClick={() => setPeriodo('2026-2')}>Volver a 2026-2</button>} /></div>
    </>
  );

  const ts = db.trabajos.filter((t) => (!desde || t.registrado >= desde) && (!hasta || t.registrado <= hasta));
  const cuenta = (e) => ts.filter((t) => t.estado === e).length;
  const activos = ts.filter((t) => t.estado === 'en_desarrollo');
  const avProm = activos.length ? Math.round(activos.reduce((s, t) => s + D.avanceTrabajo(db, t.id), 0) / activos.length) : 0;
  const vencs = ts.filter(D.esVigente).flatMap((t) => D.alertasTrabajo(db, t.id).vencidos.map((v) => ({ t, ...v })));
  const trabVenc = new Set(vencs.map((v) => v.t.id)).size;
  const masViejo = Math.max(0, ...vencs.map((v) => v.i.diasRetraso));
  const susts = db.sustentaciones;
  const realizadas = susts.filter((s) => s.acta && !s.acta.borrador);
  const notaProm = realizadas.length ? Math.round(realizadas.reduce((s, x) => s + x.acta.final, 0) / realizadas.length) : '—';
  const sinAsesor = ts.filter((t) => D.esVigente(t) && !t.asesorId).length;
  const asesores = db.usuarios.filter((u) => u.rol === 'asesor' && u.estado === 'activo');
  const cupoLleno = asesores.filter((a) => D.cupoAsesor(db, a).disponible === 0 && D.pendientesRevision(db, a.id).length > 0);
  const sinSust = ts.filter((t) => t.estado === 'concluido' && !D.sustDe(db, t.id)).length;
  const bloqueados = db.usuarios.filter((u) => u.estado === 'bloqueado').length;
  const porLinea = LINEAS.map((l) => [l, ts.filter((t) => t.linea === l).length]).sort((a, b) => b[1] - a[1]);
  const maxL = Math.max(1, ...porLinea.map((x) => x[1]));
  const porCarrera = CARRERAS.map((c) => { const x = ts.filter((t) => t.carrera === c); return [c, x.length, x.length ? Math.round(x.reduce((s, t) => s + D.avanceTrabajo(db, t.id), 0) / x.length) : 0]; }).sort((a, b) => b[1] - a[1]);

  const exportar = () => {
    D.exportCsv('tfc-2026-2-metricas.csv', [['Métrica', 'Valor'], ['Trabajos propuesta', cuenta('propuesta')], ['Trabajos en desarrollo', cuenta('en_desarrollo')], ['Trabajos concluidos', cuenta('concluido')], ['Trabajos desistidos', cuenta('desistido')], ['Avance promedio (%)', avProm], ['Entregables vencidos', vencs.length], ...porLinea.map(([l, n]) => [`Línea: ${l}`, n]), ...porCarrera.map(([c, n, a]) => [`Carrera: ${c} (avance ${a}%)`, n])]);
    notify('success', 'Reporte exportado', `tfc-2026-2-metricas.csv · ${ts.length} trabajos y ${asesores.length} asesores`);
  };

  return (
    <>
      <PageHeader crumbs={[['Inicio'], ['Tablero']]} title="Tablero del periodo" subtitle={`Semestre ${periodo} · datos al ${fmt(D.HOY)}`}
        actions={<><Field label="Desde"><input type="date" className="form-control" value={desde} onChange={(e) => setDesde(e.target.value)} /></Field><Field label="Hasta"><input type="date" className="form-control" value={hasta} onChange={(e) => setHasta(e.target.value)} /></Field><Field label="Periodo"><select className="form-select" value={periodo} onChange={(e) => setPeriodo(e.target.value)}><option>2026-2</option><option>2027-1</option></select></Field><button className="btn btn-outline-primary align-self-end" onClick={exportar}>Exportar reporte</button></>} />
      <div className="row g-3 mb-3">
        <div className="col-md-6 col-xl-3"><div className="card-tfc pad h-100"><div className="eyebrow">Trabajos por estado</div><div className="stat-big my-1">{ts.length}</div>{[['propuesta', ''], ['en_desarrollo', 'text-primary'], ['concluido', 'text-ok'], ['desistido', 'text-danger2']].map(([e, c]) => <div className="d-flex justify-content-between small" key={e}><span className={c}>{D.TAGS[e][0]}</span><b>{cuenta(e)}</b></div>)}</div></div>
        <div className="col-md-6 col-xl-3"><div className="card-tfc pad h-100"><div className="eyebrow">Avance promedio</div><div className="stat-big my-1">{avProm}%</div><Progress value={avProm} className="my-2" /><div className="aux">De los {activos.length} trabajos activos</div></div></div>
        <div className="col-md-6 col-xl-3"><div className="card-tfc pad h-100" style={{ borderColor: 'var(--c-danger)' }}><div className="eyebrow">Entregables vencidos</div><div className="stat-big my-1 text-danger2">{vencs.length}</div><div className="aux mb-2">En {trabVenc} trabajos{masViejo ? ` · el más antiguo con ${masViejo} días de retraso` : ''}</div><Link to="/admin/trabajos" className="fw-semibold small">Ver detalle</Link></div></div>
        <div className="col-md-6 col-xl-3"><div className="card-tfc pad h-100"><div className="eyebrow">Sustentaciones</div><div className="stat-big my-1">{susts.length}</div><div className="aux mb-2">{susts.filter((s) => s.estado === 'programada' || s.estado === 'reprogramada').length} programada(s) · {realizadas.length} realizada(s) · nota promedio {notaProm}</div><Link to="/admin/sustentaciones" className="fw-semibold small">Ver calendario</Link></div></div>
      </div>
      <div className="row g-3">
        <div className="col-lg-4"><div className="card-tfc pad h-100"><h2 className="mb-3">Trabajos por línea de investigación</h2>
          {porLinea.map(([l, n]) => <div className="mb-2" key={l}><div className={`d-flex justify-content-between small ${n ? '' : 'text-muted2'}`}><span>{l}</span><b>{n}</b></div><Progress value={(n * 100) / maxL} /></div>)}</div></div>
        <div className="col-lg-4"><div className="card-tfc pad h-100"><h2 className="mb-3">Trabajos por carrera</h2>
          {porCarrera.map(([c, n, a]) => <div className="mb-3" key={c}><div className="d-flex justify-content-between"><span>{c}</span><b>{n}</b></div><Progress value={ts.length ? (n * 100) / ts.length : 0} tone="accent" /><div className="aux">Avance promedio {a}%</div></div>)}</div></div>
        <div className="col-lg-4"><div className="card-tfc pad h-100"><h2 className="mb-3">Requiere atención</h2><div className="d-grid gap-2">
          {sinAsesor > 0 && <div className="card-tfc danger p-2"><b className="text-danger2">{sinAsesor} trabajos sin asesor</b><div className="small text-danger2">La etapa de asignación cierra el 11/09/2026</div></div>}
          {cupoLleno.map((a) => <div className="card-tfc warn p-2" key={a.id}><b className="text-warn2">1 asesor con cupo completo</b><div className="small text-warn2">{D.nombreAsesor(a)} · {D.pendientesRevision(db, a.id).length} avances en espera</div></div>)}
          {sinSust > 0 && <div className="card-tfc warn p-2"><b className="text-warn2">{sinSust} trabajos concluidos sin sustentación</b><div className="small text-warn2">Programar antes del 19/12/2026</div></div>}
          <div className="card-tfc flat p-2"><b>{bloqueados} cuentas bloqueadas</b><div className="small text-muted2">Por retiro del semestre o solicitud de la Secretaría</div></div>
          {sinAsesor + sinSust + cupoLleno.length === 0 && <div className="text-muted2 small">Sin alertas pendientes.</div>}
        </div></div></div>
      </div>
    </>
  );
}
