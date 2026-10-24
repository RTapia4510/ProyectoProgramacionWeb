// HU-2 · Listado de los trabajos del estudiante, con filtro por estado.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { EmptyState, PageHeader, Progress, Tag } from '../../components/ui.jsx';

export default function MyWorks() {
  const { db, user } = useApp();
  const [estado, setEstado] = useState('');
  const todos = D.trabajosDe(db, user.id).sort((a, b) => b.registrado.localeCompare(a.registrado));
  const lista = todos.filter((t) => !estado || t.estado === estado);
  return (
    <>
      <PageHeader crumbs={[['Mi trabajo', '/mi-trabajo'], ['Mis trabajos']]} title="Mis trabajos" subtitle={`${todos.length} trabajo(s) en los que participas`}
        actions={<select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado"><option value="">Todos los estados</option>{['propuesta', 'en_desarrollo', 'concluido', 'desistido'].map((s) => <option key={s} value={s}>{D.TAGS[s][0]}</option>)}</select>} />
      <div className="card-tfc">
        {lista.length === 0 ? <EmptyState title="Sin trabajos" text="No hay trabajos con este estado." /> : (
          <div className="table-responsive"><table className="table table-tfc"><thead><tr><th>Título</th><th>Línea</th><th>Asesor</th><th>Avance</th><th>Registrado</th><th>Estado</th></tr></thead>
            <tbody>{lista.map((t) => <tr key={t.id}><td><div className="serif">{t.titulo}</div><div className="aux">{t.codigo}</div></td><td>{t.linea}</td><td>{t.asesorId ? D.nombreAsesor(D.byId(db.usuarios, t.asesorId)) : <span className="text-warn2">Sin asesor</span>}</td><td style={{ minWidth: 130 }}><div className="d-flex align-items-center gap-2"><Progress value={D.avanceTrabajo(db, t.id)} className="flex-grow-1" /><b className="small">{D.avanceTrabajo(db, t.id)}%</b></div></td><td>{fmt(t.registrado)}</td><td><Tag k={t.estado} /></td></tr>)}</tbody></table></div>
        )}
      </div>
      <div className="mt-3"><Link to="/mi-trabajo" className="btn btn-outline-primary">Volver a mi trabajo</Link></div>
    </>
  );
}
