// HU-1 · Recuperación de contraseña en 3 pasos (correo → envío del enlace → nueva contraseña).
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { pwdChecks } from '../../services/domain.jsx';
import { Field, PwdChecks, inv } from '../../components/ui.jsx';

export default function Recover() {
  const { resetPassword, notify } = useApp();
  const nav = useNavigate();
  const [paso, setPaso] = useState(1);
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [seg, setSeg] = useState(120);
  const [pw, setPw] = useState({ n: '', c: '' });
  const [e3, setE3] = useState({});

  useEffect(() => {
    if (paso !== 2 || seg <= 0) return undefined;
    const t = setTimeout(() => setSeg(seg - 1), 1000);
    return () => clearTimeout(t);
  }, [paso, seg]);

  const enviar = (ev) => {
    ev.preventDefault();
    if (!/^[^\s@]+@(aloe\.)?ulima\.edu\.pe$/i.test(email.trim())) return setErr('Ingresa tu correo institucional (@aloe.ulima.edu.pe o @ulima.edu.pe)');
    setErr(''); setSeg(120); setPaso(2);
  };
  const guardar = (ev) => {
    ev.preventDefault();
    const e = {};
    if (pwdChecks(pw.n).some((c) => !c.ok)) e.n = 'La contraseña no cumple los requisitos';
    if (pw.c !== pw.n) e.c = 'Las contraseñas no coinciden';
    setE3(e);
    if (Object.keys(e).length) return;
    resetPassword(email, pw.n);
    notify('success', 'Contraseña actualizada', 'Ya puedes iniciar sesión con tu nueva contraseña.');
    nav('/login');
  };
  const mm = `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;

  return (
    <div className="mx-auto" style={{ maxWidth: 760, paddingTop: '2rem' }}>
      <div className="card-tfc pad mb-3">
        <div className="d-flex gap-2">{['Correo', 'Envío del enlace', 'Nueva contraseña'].map((l, i) => (
          <div className="flex-fill" key={l}><div className="progress-tfc mb-1" style={{ height: 5 }}><span style={{ width: paso > i ? '100%' : 0 }} /></div><div className="eyebrow" style={paso === i + 1 ? { color: 'var(--c-primary)' } : null}>Paso {i + 1} · {l}</div></div>
        ))}</div>
      </div>
      <div className="row g-3 align-items-start">
        <div className="col-md-6">
          <h1 className="mb-2">Recuperar contraseña</h1>
          <p className="text-muted2">Te enviaremos un enlace para crear una nueva contraseña. El enlace vence en 60 minutos y solo puede usarse una vez.</p>
          <div className="card-tfc pad small"><div className="eyebrow mb-1">Si no recibes el correo</div>Revisa la carpeta de no deseados, confirma que el correo esté escrito completo o escribe a la mesa de ayuda (anexo 30100).</div>
        </div>
        <div className="col-md-6">
          {paso === 1 && (
            <form className="card-tfc pad" onSubmit={enviar} noValidate>
              <div className="eyebrow accent mb-2">Paso 1 de 3</div>
              <Field label="Correo institucional" error={err} className="mb-3"><input className={`form-control${inv(err)}`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@aloe.ulima.edu.pe" /></Field>
              <button className="btn btn-primary w-100 mb-2">Enviar enlace</button>
              <div className="text-center"><Link to="/login" className="small fw-semibold">Volver a iniciar sesión</Link></div>
            </form>
          )}
          {paso === 2 && (
            <div className="card-tfc pad">
              <div className="eyebrow accent mb-2">Paso 2 de 3 · Envío</div>
              <div className="card-tfc soft p-2 small mb-3">✔ Enlace enviado a {email.trim()}</div>
              <h2 className="mb-2">Revisa tu correo</h2>
              <p className="text-muted2 small">El enlace vence en 60 minutos. Si no lo encuentras, revisa la carpeta de no deseados.</p>
              <button className="btn btn-outline-primary w-100 mb-2" disabled={seg > 0} onClick={() => { setSeg(120); notify('info', 'Enlace reenviado', email.trim()); }}>{seg > 0 ? `Reenviar en ${mm}` : 'Reenviar enlace'}</button>
              <button className="btn btn-link w-100" onClick={() => setPaso(3)}>Abrir el enlace del correo (demostración)</button>
            </div>
          )}
          {paso === 3 && (
            <form className="card-tfc pad" onSubmit={guardar} noValidate>
              <div className="eyebrow accent mb-2">Paso 3 de 3 · Nueva contraseña</div>
              <h2 className="mb-3">Crea tu nueva contraseña</h2>
              <Field label="Nueva contraseña" error={e3.n} className="mb-3"><input type="password" className={`form-control${inv(e3.n)}`} value={pw.n} onChange={(e) => setPw({ ...pw, n: e.target.value })} autoComplete="new-password" /></Field>
              <Field label="Confirmar contraseña" error={e3.c} className="mb-3"><input type="password" className={`form-control${inv(e3.c)}`} value={pw.c} onChange={(e) => setPw({ ...pw, c: e.target.value })} autoComplete="new-password" /></Field>
              <div className="mb-3"><PwdChecks checks={pwdChecks(pw.n)} /></div>
              <button className="btn btn-primary w-100">Guardar contraseña</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
