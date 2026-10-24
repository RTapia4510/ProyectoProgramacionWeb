// HU-1 · Inicio de sesión con redirección por rol y manejo de intentos fallidos.
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { homeDe } from '../../services/domain.jsx';
import { Field, inv } from '../../components/ui.jsx';

const DEMO = [
  ['Estudiante', 'rquispe@aloe.ulima.edu.pe'], ['Estudiante (sin asesor)', 'jtapia@aloe.ulima.edu.pe'], ['Estudiante (concluido)', 'drojas@aloe.ulima.edu.pe'],
  ['Asesor', 'mquispe@ulima.edu.pe'], ['Administrador', 'cvelasquez@ulima.edu.pe'],
];

export default function Login() {
  const { login, resetDemo, notify } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [ver, setVer] = useState(false);
  const [rec, setRec] = useState(false);
  const [err, setErr] = useState({});
  const [intentos, setIntentos] = useState(5);
  const [aviso, setAviso] = useState('');

  const enviar = (e) => {
    e.preventDefault();
    const er = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) er.email = 'Ingresa un correo institucional válido';
    if (!pw) er.pw = 'Ingresa tu contraseña';
    setErr(er);
    if (Object.keys(er).length) return;
    if (intentos <= 0) return setAviso('Cuenta bloqueada temporalmente por 15 minutos. Intenta más tarde.');
    const r = login(email, pw);
    if (r.ok) { notify('success', 'Bienvenido', `Sesión iniciada como ${r.user.nombres}.`); nav(loc.state?.from || homeDe(r.user.rol), { replace: true }); return; }
    if (r.error === 'credenciales') {
      const left = intentos - 1;
      setIntentos(left);
      setErr({ pw: 'Contraseña incorrecta' });
      setAviso(left > 0 ? `El correo o la contraseña no coinciden. Te quedan ${left} intentos antes del bloqueo temporal de 15 minutos.` : 'Cuenta bloqueada temporalmente por 15 minutos.');
    } else setAviso(r.error);
  };

  return (
    <div className="row g-4 justify-content-center align-items-center" style={{ minHeight: 480 }}>
      <div className="col-lg-5 col-xl-4 offset-xl-1">
        <div className="eyebrow accent mb-2">Acceso con cuenta institucional</div>
        <h1 className="mb-3" style={{ fontSize: '2.1rem', lineHeight: 1.25 }}>Ingresa para ver tu trabajo, tus entregables y la retroalimentación de tu asesor</h1>
        <p className="text-muted2">Los estudiantes acceden con su correo @aloe.ulima.edu.pe; los asesores y la coordinación, con su correo @ulima.edu.pe. Cada rol ve un menú distinto al ingresar.</p>
        {[['Estudiante', 'estudiante', 'Mi trabajo · Entregables · Asesores · Mi sustentación'], ['Asesor', 'asesor', 'Mis asesorados · Solicitudes · Bandeja de revisión · Mi ficha'], ['Administrador', 'admin', 'Tablero · Trabajos · Sustentaciones · Usuarios']].map(([l, k, d]) => (
          <div className="card-tfc p-2 px-3 mb-2 small" key={k}><span className={`role-pill ${k} me-2`}>{l}</span><span className="text-muted2">{d}</span></div>
        ))}
        <div className="card-tfc flat p-3 mt-3 small">
          <div className="eyebrow mb-2">Cuentas de demostración · contraseña Demo1234</div>
          <div className="d-flex flex-wrap gap-2">{DEMO.map(([l, m]) => <button key={m} type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setEmail(m); setPw('Demo1234'); setErr({}); setAviso(''); }}>{l}</button>)}</div>
          <button type="button" className="btn btn-link btn-sm px-0 mt-2" onClick={() => { resetDemo(); notify('info', 'Datos restablecidos', 'Se cargaron de nuevo los datos semilla.'); }}>Restablecer datos de demostración</button>
        </div>
      </div>
      <div className="col-lg-5 col-xl-4">
        <form className="card-tfc pad" onSubmit={enviar} noValidate>
          <h2 className="mb-3">Iniciar sesión</h2>
          {aviso && <div className="card-tfc danger p-2 small text-danger2 mb-3" role="alert">❗ {aviso}</div>}
          <Field label="Correo institucional" error={err.email} className="mb-3"><input className={`form-control${inv(err.email)}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="nombre@aloe.ulima.edu.pe" /></Field>
          <Field label="Contraseña" error={err.pw} className="mb-3">
            <div className="input-group"><input className={`form-control${inv(err.pw)}`} type={ver ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /><button type="button" className="btn btn-outline-secondary" onClick={() => setVer(!ver)}>{ver ? 'Ocultar' : 'Mostrar'}</button></div>
          </Field>
          <div className="d-flex justify-content-between mb-3"><label className="form-check"><input className="form-check-input" type="checkbox" checked={rec} onChange={(e) => setRec(e.target.checked)} /> <span className="form-check-label">Recordarme</span></label><Link to="/recuperar" className="small fw-semibold">¿Olvidaste tu contraseña?</Link></div>
          <button className="btn btn-primary w-100 py-2" disabled={intentos <= 0}>{aviso && intentos > 0 && intentos < 5 ? 'Intentar de nuevo' : 'Ingresar'}</button>
          <hr />
          <div className="text-center small text-muted2">¿No tienes cuenta? <Link to="/registro/estudiante" className="fw-semibold">Regístrate como estudiante</Link> o <Link to="/registro/asesor" className="fw-semibold">como asesor</Link></div>
        </form>
      </div>
    </div>
  );
}
