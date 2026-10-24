// Páginas informativas del visitante: El proceso, Cronograma y Preguntas frecuentes.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ETAPAS } from '../../data/seed.jsx';
import { etapaActual } from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { PageHeader, Tag } from '../../components/ui.jsx';

const PASOS = [
  ['Registro del trabajo y del equipo', 'El estudiante registra título, línea de investigación, resumen, objetivos y palabras clave, y forma un equipo de hasta 3 integrantes.'],
  ['Solicitud y asignación de asesor', 'Se solicita asesor entre quienes tienen cupo en la línea del trabajo. El asesor acepta o rechaza con motivo.'],
  ['Plan de entregables', 'El asesor define hitos con fecha límite y peso. El avance del trabajo se calcula con los entregables aprobados.'],
  ['Revisión de avances', 'El estudiante registra cada avance con un enlace; el asesor comenta, observa o aprueba.'],
  ['Sustentación y acta', 'La coordinación programa la sustentación, conforma el jurado y registra el acta de calificación.'],
];
const FAQ = [
  ['¿Puedo participar en más de un trabajo a la vez?', 'No. Cada estudiante puede tener un solo trabajo vigente (propuesta o en desarrollo).'],
  ['¿Cuántos integrantes puede tener el equipo?', 'Entre 1 y 3 integrantes. El responsable registra los avances y recibe las notificaciones.'],
  ['¿Cómo entrego un avance?', 'Mediante un enlace a tu documento (con permiso de lectura para tu asesor) y una descripción. No se cargan archivos.'],
  ['¿Qué pasa si entrego fuera de plazo?', 'El avance queda marcado como «entregado con retraso» y el asesor verá la diferencia de días.'],
  ['¿Cuándo se calcula mi porcentaje de avance?', 'Cada vez que el asesor aprueba un entregable, según los pesos del plan (suman 100).'],
];

export default function Info({ tipo }) {
  const [abierto, setAbierto] = useState(0);
  const etapa = etapaActual();
  if (tipo === 'proceso') return (
    <>
      <PageHeader crumbs={[['Inicio', '/'], ['El proceso']]} title="El proceso en 5 etapas" subtitle="Desde el registro de la propuesta hasta el acta de sustentación." />
      <div className="row g-3">{PASOS.map(([t, d], i) => <div className="col-md-6 col-xl-4" key={t}><div className="card-tfc pad h-100"><div className="eyebrow accent">Etapa {i + 1}</div><h3 className="my-2">{t}</h3><p className="text-muted2 mb-0">{d}</p></div></div>)}</div>
      <div className="mt-4"><Link to="/registro/estudiante" className="btn btn-primary">Crear cuenta de estudiante</Link></div>
    </>
  );
  if (tipo === 'cronograma') return (
    <>
      <PageHeader crumbs={[['Inicio', '/'], ['Cronograma']]} title="Cronograma 2026-2" />
      <div className="card-tfc"><table className="table table-tfc"><thead><tr><th>Etapa</th><th>Actividad</th><th>Desde</th><th>Hasta</th><th>Estado</th></tr></thead>
        <tbody>{ETAPAS.map((e) => <tr key={e.n}><td>{e.n}</td><td className="fw-semibold">{e.nombre}</td><td>{fmt(e.ini)}</td><td>{fmt(e.fin)}</td><td>{e.n < etapa.n ? <Tag k="aprobado" label="Cerrada" /> : e.n === etapa.n ? <Tag k="retraso" label="En curso" /> : <Tag k="pendiente" label="Próxima" />}</td></tr>)}</tbody></table></div>
    </>
  );
  return (
    <>
      <PageHeader crumbs={[['Inicio', '/'], ['Preguntas frecuentes']]} title="Preguntas frecuentes" />
      <div className="accordion" style={{ maxWidth: 900 }}>
        {FAQ.map(([q, a], i) => (
          <div className="accordion-item" key={q}>
            <h2 className="accordion-header"><button className={`accordion-button${abierto === i ? '' : ' collapsed'}`} onClick={() => setAbierto(abierto === i ? -1 : i)}>{q}</button></h2>
            {abierto === i && <div className="accordion-body">{a}</div>}
          </div>
        ))}
      </div>
    </>
  );
}
