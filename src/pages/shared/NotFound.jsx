import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui.jsx';

export default function NotFound() {
  return (
    <div className="card-tfc mx-auto" style={{ maxWidth: 560, marginTop: '4rem' }}>
      <EmptyState icon="404" title="No encontramos esta página" text="El enlace puede haber cambiado o el trabajo ya no está disponible. El mensaje es el mismo para estudiantes, asesores y administradores."
        action={<div className="d-flex gap-2 justify-content-center"><Link className="btn btn-primary" to="/">Ir al inicio</Link><Link className="btn btn-outline-primary" to="/asesores">Ver asesores</Link></div>} />
    </div>
  );
}
