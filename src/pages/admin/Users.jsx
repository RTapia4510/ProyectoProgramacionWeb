// HU-7 · Gestión de usuarios: filtros, bloqueo con motivo, validación de asesores e invitación de coordinadores.
import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { ConfirmModal, EmptyState, Field, Modal, PageHeader, Pager, Tag, inv } from '../../components/ui.jsx';

const POR_PAG = 8;
const RTAG = { estudiante: ['Estudiante', 'st-ok'], asesor: ['Asesor', 'st-warn'], admin: ['Administrador', ''] };

export default function Users() {
  const { db, user, blockUser, unblockUser, validateAdvisor, rejectAdvisor, createCoordinator, notify } = useApp();
  const [f, setF] = useState({ q: '', rol: '', estado: '', cd: '' });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // {tipo, u}
  const [cupo, setCupo] = useState('6');
  const [nuevo, setNuevo] = useState({ nombres: '', apellidos: '', email: '' });
  const [err, setErr] = useState({});
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };
  const us = db.usuarios;
  const porValidar = us.filter((u) => u.estado === 'por_validar');
  const lista = us.filter((u) => {
    const q = f.q.trim().toLowerCase();
    return (!q || D.nombreCompleto(u).toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.codigo || '').includes(q)) && (!f.rol || u.rol === f.rol) && (!f.estado || u.estado === f.estado) && (!f.cd || (u.carrera || u.departamento) === f.cd);
  });
  const pages = Math.max(1, Math.ceil(lista.length / POR_PAG));
  const p = Math.min(page, pages);
  const fila = lista.slice((p - 1) * POR_PAG, p * POR_PAG);
  const carDep = [...new Set(us.map((u) => u.carrera || u.departamento))];

  const invitar = () => {
    const e = {};
    if (!nuevo.nombres.trim()) e.nombres = 'Campo obligatorio';
    if (!nuevo.apellidos.trim()) e.apellidos = 'Campo obligatorio';
    if (!/^[^\s@]+@ulima\.edu\.pe$/i.test(nuevo.email.trim())) e.email = 'Debe terminar en @ulima.edu.pe';
    setErr(e);
    if (Object.keys(e).length) return;
    const r = createCoordinator({ nombres: nuevo.nombres.trim(), apellidos: nuevo.apellidos.trim(), email: nuevo.email.trim().toLowerCase() });
    if (!r.ok) return setErr({ email: r.error });
    setModal(null); setNuevo({ nombres: '', apellidos: '', email: '' });
    notify('success', 'Invitación enviada', 'El coordinador recibirá un correo para activar su cuenta (contraseña inicial: Invitado1).');
  };

  return (
    <>
      <PageHeader crumbs={[['Inicio'], ['Usuarios']]} title="Gestión de usuarios" subtitle={`${us.length} usuarios · ${us.filter((u) => u.rol === 'estudiante').length} estudiantes · ${us.filter((u) => u.rol === 'asesor').length} asesores · ${us.filter((u) => u.rol === 'admin').length} administradores · ${us.filter((u) => u.estado === 'bloqueado').length} bloqueados`}
        actions={<><button className="btn btn-outline-primary" onClick={() => { setF({ ...f, estado: 'por_validar' }); setPage(1); }}>Validar cuentas de asesor ({porValidar.length})</button><button className="btn btn-primary" onClick={() => { setErr({}); setModal({ tipo: 'nuevo' }); }}>Registrar usuario</button></>} />
      <div className="card-tfc pad mb-3"><div className="row g-3">
        <Field className="col-lg-5" label="Buscar"><input className="form-control" placeholder="Nombre, correo o código…" value={f.q} onChange={set('q')} /></Field>
        <Field className="col-4 col-lg-2" label="Rol"><select className="form-select" value={f.rol} onChange={set('rol')}><option value="">Todos</option><option value="estudiante">Estudiante</option><option value="asesor">Asesor</option><option value="admin">Administrador</option></select></Field>
        <Field className="col-4 col-lg-2" label="Estado"><select className="form-select" value={f.estado} onChange={set('estado')}><option value="">Todos</option><option value="activo">Activo</option><option value="bloqueado">Bloqueado</option><option value="por_validar">Por validar</option></select></Field>
        <Field className="col-4 col-lg-3" label="Carrera / departamento"><select className="form-select" value={f.cd} onChange={set('cd')}><option value="">Todos</option>{carDep.map((c) => <option key={c}>{c}</option>)}</select></Field>
      </div></div>
      <div className="card-tfc">
        {lista.length === 0 ? <EmptyState title="Ningún usuario coincide" text="Prueba con otros filtros." action={<button className="btn btn-outline-primary" onClick={() => setF({ q: '', rol: '', estado: '', cd: '' })}>Quitar filtros</button>} /> : (
          <div className="table-responsive"><table className="table table-tfc"><thead><tr><th>Usuario</th><th>Rol</th><th>Carrera / departamento</th><th>Estado</th><th className="text-end">Acción</th></tr></thead>
            <tbody>{fila.map((u) => (
              <tr key={u.id} className={u.estado === 'bloqueado' ? 'row-muted' : ''}>
                <td><div className="fw-semibold">{D.nombreAsesor(u.titulo ? u : { ...u, titulo: '' }).trim()}</div><div className="aux">{u.email}{u.codigo ? ` · ${u.codigo}` : ''}</div></td>
                <td><span className={`tag ${RTAG[u.rol][1]}`} style={u.rol === 'admin' ? { background: 'var(--c-primary-dark)', color: '#fff' } : null}>{RTAG[u.rol][0]}</span></td>
                <td>{u.carrera || u.departamento}</td><td><Tag k={u.estado} /></td>
                <td className="text-end">
                  {u.id === user.id ? <span className="text-muted2">Tu cuenta</span>
                    : u.estado === 'por_validar' ? <button className="btn btn-link btn-sm" onClick={() => { setCupo('6'); setModal({ tipo: 'validar', u }); }}>Validar cuenta</button>
                    : u.estado === 'bloqueado' ? <button className="btn btn-link btn-sm" onClick={() => { unblockUser(u.id); notify('success', 'Usuario desbloqueado', D.nombreCompleto(u)); }}>Desbloquear</button>
                    : <button className="btn btn-link btn-sm text-danger2" onClick={() => setModal({ tipo: 'bloquear', u })}>Bloquear</button>}
                </td></tr>))}</tbody></table></div>
        )}
        <div className="card-foot d-flex justify-content-between align-items-center"><span>Mostrando {lista.length ? (p - 1) * POR_PAG + 1 : 0}–{Math.min(p * POR_PAG, lista.length)} de {lista.length} · única sección con gestión de roles</span><Pager page={p} pages={pages} onChange={setPage} /></div>
      </div>

      {modal?.tipo === 'bloquear' && (
        <ConfirmModal title="Bloquear usuario" danger confirmLabel="Bloquear usuario" motivo minMotivo={30} motivoLabel="Motivo del bloqueo (obligatorio)" onClose={() => setModal(null)}
          onConfirm={(m) => { blockUser(modal.u.id, m); setModal(null); notify('success', 'Usuario bloqueado', `${D.nombreCompleto(modal.u)} perdió el acceso.`); }}>
          <div className="card-tfc flat p-2 mb-1"><b>{D.nombreCompleto(modal.u)}</b><div className="aux">{RTAG[modal.u.rol][0]} · {modal.u.carrera || modal.u.departamento} · {modal.u.email}</div></div>
          <div className="card-tfc danger p-2 small text-danger2 mt-2">El usuario perderá el acceso inmediatamente. Sus trabajos seguirán visibles para el equipo y el asesor.</div>
        </ConfirmModal>
      )}
      {modal?.tipo === 'validar' && (
        <Modal title="Validar cuenta de asesor" onClose={() => setModal(null)} footer={<>
          <button className="btn btn-outline-danger" onClick={() => { rejectAdvisor(modal.u.id); setModal(null); notify('success', 'Solicitud rechazada', 'Se eliminó la solicitud de cuenta.'); }}>Rechazar</button>
          <button className="btn btn-primary" onClick={() => { const n = Number(cupo); if (!Number.isInteger(n) || n < 1 || n > 10) return setErr({ cupo: 'Entre 1 y 10' }); validateAdvisor(modal.u.id, n); setModal(null); setErr({}); notify('success', 'Cuenta validada', `${D.nombreAsesor(modal.u)} ya puede ingresar y aparece en el directorio.`); }}>Validar cuenta</button></>}>
          <div className="card-tfc flat p-3 mb-3"><b>{D.nombreAsesor(modal.u)}</b><div className="aux">{modal.u.email} · Departamento de {modal.u.departamento} · {modal.u.grado.toLowerCase()}</div><div className="aux">Solicitud recibida el {fmt(modal.u.solicitadoEl)}</div></div>
          <div className="row g-3"><Field className="col-6" label="Cupo máximo inicial" error={err.cupo}><input className={`form-control${inv(err.cupo)}`} inputMode="numeric" value={cupo} onChange={(e) => setCupo(e.target.value)} /></Field><Field className="col-6" label="Rol asignado"><select className="form-select" disabled><option>Asesor</option></select></Field></div>
          <div className="card-tfc soft p-2 small mt-3">Al validar, el asesor podrá declarar hasta 3 líneas de investigación y empezará a aparecer en el directorio público.</div>
        </Modal>
      )}
      {modal?.tipo === 'nuevo' && (
        <Modal title="Registrar usuario" onClose={() => setModal(null)} footer={<><button className="btn btn-link" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-primary" onClick={invitar}>Enviar invitación</button></>}>
          <p className="text-muted2 small">Los coordinadores se registran por invitación. Los estudiantes y asesores crean su propia cuenta.</p>
          <div className="row g-3"><Field className="col-6" label="Nombres" error={err.nombres}><input className={`form-control${inv(err.nombres)}`} value={nuevo.nombres} onChange={(e) => setNuevo({ ...nuevo, nombres: e.target.value })} /></Field><Field className="col-6" label="Apellidos" error={err.apellidos}><input className={`form-control${inv(err.apellidos)}`} value={nuevo.apellidos} onChange={(e) => setNuevo({ ...nuevo, apellidos: e.target.value })} /></Field>
            <Field className="col-12" label="Correo institucional" error={err.email}><input className={`form-control${inv(err.email)}`} value={nuevo.email} onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })} placeholder="nombre@ulima.edu.pe" /></Field></div>
        </Modal>
      )}
    </>
  );
}
