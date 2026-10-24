// HU-1 · Mi cuenta: datos personales, académicos, cambio de contraseña y notificaciones.
import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { CARRERAS, CICLOS, DEPARTAMENTOS, GRADOS, TITULOS } from '../../data/seed.jsx';
import { trabajoActivo, pwdChecks, ROLES } from '../../services/domain.jsx';
import { Field, PageHeader, PwdChecks, inv } from '../../components/ui.jsx';

export default function Account() {
  const { user, db, updateUser, changePassword, notify } = useApp();
  const inicial = { nombres: user.nombres, apellidos: user.apellidos, telefono: user.telefono || '', carrera: user.carrera, ciclo: user.ciclo, grado: user.grado, departamento: user.departamento };
  const [f, setF] = useState(inicial);
  const [pw, setPw] = useState({ actual: '', nueva: '', conf: '' });
  const [notif, setNotif] = useState(user.notif || { avances: true, solicitudes: true, vencimientos: true });
  const [err, setErr] = useState({});
  const [sec, setSec] = useState('personales');
  const t = user.rol === 'estudiante' ? trabajoActivo(db, user.id) : null;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ir = (id) => { setSec(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const guardar = () => {
    const e = {};
    if (!f.nombres.trim()) e.nombres = 'Campo obligatorio';
    if (!f.apellidos.trim()) e.apellidos = 'Campo obligatorio';
    if (f.telefono && !/^[\d\s+]{7,15}$/.test(f.telefono)) e.telefono = 'Teléfono no válido';
    const usaPw = pw.actual || pw.nueva || pw.conf;
    if (usaPw) {
      if (!pw.actual) e.actual = 'Ingresa tu contraseña actual';
      if (!pwdChecks(pw.nueva).every((c) => c.ok)) e.nueva = 'No cumple los requisitos';
      if (pw.conf !== pw.nueva) e.conf = 'Las contraseñas no coinciden';
    }
    setErr(e);
    if (Object.keys(e).length) return notify('danger', 'No se pudo guardar', `Revisa ${Object.keys(e).length} campo(s) marcado(s).`);
    if (usaPw) {
      const r = changePassword(user.id, pw.actual, pw.nueva);
      if (!r.ok) { setErr({ actual: r.error }); return notify('danger', 'No se pudo guardar', r.error); }
      setPw({ actual: '', nueva: '', conf: '' });
    }
    const p = { nombres: f.nombres.trim(), apellidos: f.apellidos.trim(), telefono: f.telefono, notif };
    if (user.rol === 'estudiante') Object.assign(p, { carrera: f.carrera, ciclo: f.ciclo });
    if (user.rol === 'asesor') Object.assign(p, { grado: f.grado, departamento: f.departamento, ...(f.grado !== user.grado ? { titulo: TITULOS[f.grado] } : {}) });
    updateUser(user.id, p);
    notify('success', 'Cambios guardados', usaPw ? 'Tus datos y tu contraseña se actualizaron.' : 'Tus datos se actualizaron.');
  };
  const sidebar = [['personales', 'Datos personales'], ...(user.rol !== 'admin' ? [['academicos', 'Datos académicos']] : []), ['password', 'Cambiar contraseña'], ['notif', 'Notificaciones']];

  return (
    <>
      <PageHeader crumbs={[['Inicio'], ['Mi cuenta']]} title="Mi cuenta" actions={<>
        <button className="btn btn-link" onClick={() => { setF(inicial); setPw({ actual: '', nueva: '', conf: '' }); setErr({}); }}>Descartar cambios</button>
        <button className="btn btn-primary" onClick={guardar}>Guardar cambios</button></>} />
      <div className="row g-3">
        <div className="col-lg-3 col-xl-2">
          <div className="card-tfc side-nav overflow-hidden">
            {sidebar.map(([id, l]) => <button key={id} className={sec === id ? 'active' : ''} onClick={() => ir(id)}>{l}</button>)}
            <div className="p-3"><div className="eyebrow mb-1">Rol de la sesión</div><div>{ROLES[user.rol]}</div><div className="aux mt-1">El rol {user.rol === 'estudiante' ? 'y el código de alumno solo los cambia' : 'solo lo cambia'} la coordinación.</div></div>
          </div>
        </div>
        <div className="col-lg-9 col-xl-10 d-grid gap-3">
          <section id="personales" className="card-tfc pad">
            <h2 className="mb-3">Datos personales</h2>
            <div className="row g-3">
              <Field className="col-md-6 col-xl-3" label="Nombres" error={err.nombres}><input className={`form-control${inv(err.nombres)}`} value={f.nombres} onChange={set('nombres')} /></Field>
              <Field className="col-md-6 col-xl-3" label="Apellidos" error={err.apellidos}><input className={`form-control${inv(err.apellidos)}`} value={f.apellidos} onChange={set('apellidos')} /></Field>
              <Field className="col-md-6 col-xl-3" label="Correo institucional" hint="No editable"><input className="form-control" value={user.email} readOnly /></Field>
              <Field className="col-md-6 col-xl-3" label="Teléfono" error={err.telefono}><input className={`form-control${inv(err.telefono)}`} value={f.telefono} onChange={set('telefono')} /></Field>
            </div>
          </section>
          {user.rol === 'estudiante' && (
            <section id="academicos" className="card-tfc pad">
              <h2 className="mb-3">Datos académicos</h2>
              <div className="row g-3">
                <Field className="col-md-6 col-xl-3" label="Carrera"><select className="form-select" value={f.carrera} onChange={set('carrera')}>{CARRERAS.map((c) => <option key={c}>{c}</option>)}</select></Field>
                <Field className="col-md-6 col-xl-3" label="Ciclo"><select className="form-select" value={f.ciclo} onChange={set('ciclo')}>{CICLOS.map((c) => <option key={c}>{c}</option>)}</select></Field>
                <Field className="col-md-6 col-xl-3" label="Código de alumno"><input className="form-control" value={user.codigo} readOnly /></Field>
                <Field className="col-md-6 col-xl-3" label="Trabajo vigente"><input className="form-control" value={t ? t.codigo : 'Sin trabajo'} readOnly /></Field>
              </div>
            </section>
          )}
          {user.rol === 'asesor' && (
            <section id="academicos" className="card-tfc pad">
              <h2 className="mb-3">Datos académicos</h2>
              <div className="row g-3">
                <Field className="col-md-6" label="Grado académico"><select className="form-select" value={f.grado} onChange={set('grado')}>{GRADOS.map((c) => <option key={c}>{c}</option>)}</select></Field>
                <Field className="col-md-6" label="Departamento"><select className="form-select" value={f.departamento} onChange={set('departamento')}>{DEPARTAMENTOS.map((c) => <option key={c}>{c}</option>)}</select></Field>
              </div>
            </section>
          )}
          <section id="password" className="card-tfc pad">
            <h2 className="mb-3">Cambiar contraseña</h2>
            <div className="row g-3">
              <Field className="col-md-6 col-xl-3" label="Contraseña actual" error={err.actual}><input type="password" className={`form-control${inv(err.actual)}`} value={pw.actual} onChange={(e) => setPw({ ...pw, actual: e.target.value })} autoComplete="current-password" /></Field>
              <Field className="col-md-6 col-xl-3" label="Nueva contraseña" error={err.nueva} hint="Mínimo 8 caracteres"><input type="password" className={`form-control${inv(err.nueva)}`} value={pw.nueva} onChange={(e) => setPw({ ...pw, nueva: e.target.value })} autoComplete="new-password" /></Field>
              <Field className="col-md-6 col-xl-3" label="Confirmar" error={err.conf}><input type="password" className={`form-control${inv(err.conf)}`} value={pw.conf} onChange={(e) => setPw({ ...pw, conf: e.target.value })} autoComplete="new-password" /></Field>
              <div className="col-md-6 col-xl-3 d-flex align-items-end"><div className="w-100"><PwdChecks checks={pwdChecks(pw.nueva)} /></div></div>
            </div>
          </section>
          <section id="notif" className="card-tfc pad">
            <h2 className="mb-3">Notificaciones</h2>
            {[['avances', 'Avisos de avances y retroalimentación'], ['solicitudes', 'Avisos de solicitudes de asesoría'], ['vencimientos', 'Alertas de vencimiento de entregables']].map(([k, l]) => (
              <div className="form-check form-switch mb-2" key={k}><input className="form-check-input" type="checkbox" id={`n-${k}`} checked={!!notif[k]} onChange={(e) => setNotif({ ...notif, [k]: e.target.checked })} /><label className="form-check-label" htmlFor={`n-${k}`}>{l}</label></div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
