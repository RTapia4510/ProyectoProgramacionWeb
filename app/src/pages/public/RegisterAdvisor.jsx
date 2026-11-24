// HU-1 · Registro de asesor (queda pendiente de validación por la coordinación).
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { DEPARTAMENTOS, GRADOS } from '../../data/seed.jsx';
import { pwdChecks } from '../../services/domain.jsx';
import { Field, PageHeader, inv } from '../../components/ui.jsx';

export default function RegisterAdvisor() {
  const { registerAdvisor, notify } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ nombres: '', apellidos: '', email: '', password: '', conf: '', grado: '', departamento: '' });
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const enviar = (ev) => {
    ev.preventDefault();
    const e = {};
    if (!f.nombres.trim()) e.nombres = 'Campo obligatorio';
    if (!f.apellidos.trim()) e.apellidos = 'Campo obligatorio';
    if (!/^[^\s@]+@ulima\.edu\.pe$/i.test(f.email.trim())) e.email = 'Debe terminar en @ulima.edu.pe';
    if (pwdChecks(f.password).some((c) => !c.ok)) e.password = 'Mínimo 8 caracteres, una mayúscula y un número';
    if (f.conf !== f.password) e.conf = 'Las contraseñas no coinciden';
    if (!f.grado) e.grado = 'Selecciona el grado';
    if (!f.departamento) e.departamento = 'Selecciona el departamento';
    if (!Object.keys(e).length) {
      const { conf, ...rest } = f;
      const r = registerAdvisor({ ...rest, email: f.email.trim().toLowerCase(), nombres: f.nombres.trim(), apellidos: f.apellidos.trim() });
      if (r.ok) { notify('success', 'Solicitud enviada', 'Tu cuenta queda «Pendiente de validación». La coordinación te notificará por correo.'); return nav('/login'); }
      Object.assign(e, r.errors);
    }
    setErr(e);
  };

  return (
    <>
      <PageHeader crumbs={[['Inicio', '/'], ['Crear cuenta'], ['Asesor']]} title="Crear cuenta de asesor" subtitle="La coordinación validará tu registro antes de habilitar cupos y solicitudes de asesoría." />
      <div className="row g-3">
        <div className="col-lg-9">
          <form className="card-tfc pad" onSubmit={enviar} noValidate>
            <div className="eyebrow mb-3">Datos del docente</div>
            <div className="row g-3 mb-3">
              <Field className="col-md-6" label="Nombres" error={err.nombres}><input className={`form-control${inv(err.nombres)}`} value={f.nombres} onChange={set('nombres')} /></Field>
              <Field className="col-md-6" label="Apellidos" error={err.apellidos}><input className={`form-control${inv(err.apellidos)}`} value={f.apellidos} onChange={set('apellidos')} /></Field>
              <Field className="col-12" label="Correo institucional" error={err.email} hint="Debe terminar en @ulima.edu.pe"><input className={`form-control${inv(err.email)}`} type="email" value={f.email} onChange={set('email')} /></Field>
              <Field className="col-md-6" label="Contraseña" error={err.password}><input type="password" className={`form-control${inv(err.password)}`} value={f.password} onChange={set('password')} autoComplete="new-password" /></Field>
              <Field className="col-md-6" label="Confirmar contraseña" error={err.conf}><input type="password" className={`form-control${inv(err.conf)}`} value={f.conf} onChange={set('conf')} autoComplete="new-password" /></Field>
            </div>
            <hr />
            <div className="eyebrow mb-3">Datos académicos</div>
            <div className="row g-3 mb-3">
              <Field className="col-md-6" label="Grado académico" error={err.grado}><select className={`form-select${inv(err.grado)}`} value={f.grado} onChange={set('grado')}><option value="">Selecciona…</option>{GRADOS.map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field className="col-md-6" label="Departamento" error={err.departamento}><select className={`form-select${inv(err.departamento)}`} value={f.departamento} onChange={set('departamento')}><option value="">Selecciona…</option>{DEPARTAMENTOS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            </div>
            <div className="hint mb-3">Tus líneas de investigación y tu cupo máximo se definen luego en tu ficha, cuando la coordinación apruebe la cuenta.</div>
            <hr />
            <div className="d-flex justify-content-end gap-2"><Link to="/" className="btn btn-link">Cancelar</Link><button className="btn btn-primary">Enviar solicitud de cuenta</button></div>
          </form>
        </div>
        <div className="col-lg-3 d-grid gap-3 align-content-start">
          <div className="card-tfc warn pad"><div className="fw-semibold text-warn2 mb-1">Validación por coordinación</div><div className="small text-warn2">Tu cuenta queda en estado «Pendiente de validación». La coordinación responde en un plazo de 2 días hábiles y te notifica por correo.</div></div>
          <div className="card-tfc pad"><div className="eyebrow mb-2">Como asesor podrás</div><div className="small d-grid gap-2"><span>Definir tus líneas y tu cupo máximo</span><span>Aceptar o rechazar solicitudes de asesoría</span><span>Definir el plan de entregables de cada trabajo</span><span>Aprobar u observar los avances entregados</span></div></div>
        </div>
      </div>
    </>
  );
}
