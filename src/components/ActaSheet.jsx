// Acta de sustentación en formato A4 para impresión.
import { CRITERIOS } from '../data/seed.jsx';
import { fmt } from '../services/dates.jsx';
import * as D from '../services/domain.jsx';

export default function ActaSheet({ db, sust }) {
  const t = D.byId(db.trabajos, sust.trabajoId);
  const acta = sust.acta || sust.actaBorrador;
  const jur = sust.jurado.map((j) => D.byId(db.usuarios, j));
  return (
    <div className="print-sheet">
      <div className="text-center mb-3">
        <div className="eyebrow">Universidad de Lima · Facultad de Ingeniería</div>
        <h2 className="mb-0">Acta de sustentación de trabajo de fin de carrera</h2>
        <div className="aux">Código {t.codigo} · Semestre 2026-2</div>
      </div>
      <hr />
      <div className="eyebrow">Título</div><div className="serif mb-2">{t.titulo}</div>
      <div className="row g-2 mb-3 small">
        <div className="col-6"><div className="eyebrow">Línea de investigación</div>{t.linea}</div>
        <div className="col-6"><div className="eyebrow">Fecha y hora</div>{fmt(sust.fecha)} · {sust.hora} · Sala {sust.sala}</div>
        <div className="col-6"><div className="eyebrow">Equipo</div>{t.integrantes.map((i) => D.nombreCompleto(D.byId(db.usuarios, i))).join(' · ')}</div>
        <div className="col-6"><div className="eyebrow">Asesor</div>{D.nombreAsesor(D.byId(db.usuarios, t.asesorId))}</div>
      </div>
      <table className="table table-sm table-tfc mb-3">
        <thead><tr><th>Criterio</th><th className="text-end">Peso</th><th className="text-end">Nota</th></tr></thead>
        <tbody>
          {CRITERIOS.map((c) => <tr key={c.id}><td>{c.nombre}</td><td className="text-end">{c.peso}%</td><td className="text-end">{acta ? acta.notas[c.id] : '—'}</td></tr>)}
          <tr className="fw-bold"><td>Nota final · Resultado: {acta ? acta.resultado : 'pendiente'}</td><td className="text-end">100%</td><td className="text-end">{acta ? acta.final : '—'}</td></tr>
        </tbody>
      </table>
      <div className="eyebrow">Observaciones del jurado</div>
      <p className="small">{acta?.observaciones || '—'}</p>
      <div className="row g-4 mt-4">
        {jur.map((j) => (
          <div className="col-4" key={j.id}><div className="sig fw-semibold">{D.nombreAsesor(j)}</div><div className="aux">{sust.presidenteId === j.id ? 'Presidente del jurado' : 'Miembro'}</div></div>
        ))}
      </div>
    </div>
  );
}
