// HU-1 · Registro de estudiante con validación en línea.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { CARRERAS, CICLOS } from '../../data/seed.jsx';
import { pwdChecks } from '../../services/domain.jsx';
import { Field, Modal, PageHeader, inv } from '../../components/ui.jsx';

export default function RegisterStudent() {
  const { registerStudent, notify } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ nombres: '', apellidos: '', email: '', password: '', conf: '', carrera: '', ciclo: '', codigo: '', acepta: false });
  const [err, setErr] = useState({});
  const [creada, setCreada] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const validar = () => {
    const e = {};
    if (!f.nombres.trim()) e.nombres = 'Campo obligatorio';
    if (!f.apellidos.trim()) e.apellidos = 'Campo obligatorio';
    if (!/^[^\s@]+@aloe\.ulima\.edu\.pe$/i.test(f.email.trim())) e.email = 'Debe terminar en @aloe.ulima.edu.pe';
    const faltan = pwdChecks(f.password).filter((c) => !c.ok);
    if (faltan.length) e.password = 'Muy débil: ' + faltan.map((c) => c.label.toLowerCase()).join(', ');
    if (f.conf !== f.password) e.conf = 'Las contraseñas no coinciden';
    if (!f.carrera) e.carrera = 'Selecciona tu carrera';
    if (!f.ciclo) e.ciclo = 'Selecciona tu ciclo';
    if (!/^\d{8}$/.test(f.codigo)) e.codigo = 'El código tiene 8 dígitos';
    if (!f.acepta) e.acepta = 'Debes aceptar el reglamento';
    return e;
  };
  const enviar = (ev) => {
    ev.preventDefault();
    const e = validar();
    if (!Object.keys(e).length) {
      const { conf, acepta, password, ...rest } = f;
      const r = registerStudent({ ...rest, email: f.email.trim().toLowerCase(), nombres: f.nombres.trim(), apellidos: f.apellidos.trim(), password });
      if (r.ok) return setCreada(true);
      Object.assign(e, r.errors);
    }
    setErr(e);
    notify('danger', `Revisa ${Object.keys(e).length} campos`, 'No pudimos crear la cuenta: corrige los campos marcados.');
  };

  return (
    <>
      <PageHeader crumbs={[['Inicio', '/'], ['Crear cuenta'], ['Estudiante']]} title="Crear cuenta de estudiante" subtitle="Solo con correo institucional @aloe.ulima.edu.pe. Recibirás un enlace de verificación válido por 24 horas." />
      <div className="row g-3">
        <div className="col-lg-9">
          <form className="card-tfc pad" onSubmit={enviar} noValidate>
            <div className="eyebrow mb-3">Datos personales</div>
            <div className="row g-3 mb-3">
              <Field className="col-md-6" label="Nombres" error={err.nombres}><input className={`form-control${inv(err.nombres)}`} value={f.nombres} onChange={set('nombres')} /></Field>
              <Field className="col-md-6" label="Apellidos" error={err.apellidos}><input className={`form-control${inv(err.apellidos)}`} value={f.apellidos} onChange={set('apellidos')} /></Field>
              <Field className="col-12" label="Correo institucional" error={err.email}><input className={`form-control${inv(err.email)}`} type="email" value={f.email} onChange={set('email')} placeholder="nombre@aloe.ulima.edu.pe" /></Field>
              <Field className="col-md-6" label="Contraseña" error={err.password} hint="Mínimo 8 caracteres, una mayúscula y un número"><input type="password" className={`form-control${inv(err.password)}`} value={f.password} onChange={set('password')} autoComplete="new-password" /></Field>
              <Field className="col-md-6" label="Confirmar contraseña" error={err.conf}><input type="password" className={`form-control${inv(err.conf)}`} value={f.conf} onChange={set('conf')} autoComplete="new-password" /></Field>
            </div>
            <hr />
            <div className="eyebrow mb-3">Datos académicos</div>
            <div className="row g-3 mb-3">
              <Field className="col-md-4" label="Carrera" error={err.carrera}><select className={`form-select${inv(err.carrera)}`} value={f.carrera} onChange={set('carrera')}><option value="">Selecciona…</option>{CARRERAS.map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field className="col-md-4" label="Ciclo" error={err.ciclo}><select className={`form-select${inv(err.ciclo)}`} value={f.ciclo} onChange={set('ciclo')}><option value="">Selecciona…</option>{CICLOS.map((c) => <option key={c}>{c}</option>)}</select></Field>
              <Field className="col-md-4" label="Código de alumno" error={err.codigo}><input className={`form-control${inv(err.codigo)}`} value={f.codigo} onChange={set('codigo')} maxLength={8} inputMode="numeric" /></Field>
            </div>
            <div className="form-check mb-3"><input className={`form-check-input${inv(err.acepta)}`} type="checkbox" id="acepta" checked={f.acepta} onChange={set('acepta')} /><label className="form-check-label" htmlFor="acepta">Acepto el reglamento de trabajos de fin de carrera y el tratamiento de mis datos</label>{err.acepta && <span className="field-error">{err.acepta}</span>}</div>
            <hr />
            <div className="d-flex justify-content-end gap-2"><Link to="/" className="btn btn-link">Cancelar</Link><button className="btn btn-primary">Crear cuenta</button></div>
          </form>
        </div>
        <div className="col-lg-3 d-grid gap-3 align-content-start">
          <div className="card-tfc soft pad"><div className="fw-semibold mb-1">Qué pasa después</div><div className="small">Verificas tu correo, ingresas y registras tu trabajo. Luego podrás agregar hasta dos compañeros y solicitar asesor entre quienes tengan cupo en tu línea de investigación.</div></div>
          <div className="card-tfc pad"><div className="eyebrow mb-2">Requisitos</div><div className="small d-grid gap-2"><span>Estar matriculado en el ciclo 2026-2</span><span>Haber aprobado el curso Seminario de Investigación</span><span>No tener otro trabajo de fin de carrera vigente</span></div></div>
          <div className="card-tfc pad"><div className="eyebrow mb-2">¿Eres docente?</div><div className="small text-muted2 mb-2">Crea tu cuenta de asesor; la coordinación validará tu registro antes de habilitar cupos.</div><Link to="/registro/asesor" className="btn btn-outline-primary w-100">Crear cuenta de asesor</Link></div>
        </div>
      </div>
      {creada && (
        <Modal title="Cuenta creada" footer={<button className="btn btn-primary" onClick={() => nav('/login')}>Ir a iniciar sesión</button>}>
          <div className="text-center"><div className="empty ok p-0"><div className="icon">✓</div></div><p className="text-muted2">Enviamos un enlace de verificación a {f.email.trim().toLowerCase()}. Tienes 24 horas para activarlo.</p><button className="btn btn-link" onClick={() => notify('info', 'Correo reenviado', 'Revisa tu bandeja de entrada.')}>Reenviar el correo</button></div>
        </Modal>
      )}
    </>
  );
}
