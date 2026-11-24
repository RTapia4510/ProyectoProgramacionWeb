// HU-2 · Equipo de trabajo: búsqueda, incorporación, retiro y responsable.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import * as D from '../../services/domain.jsx';
import { Avatar, ConfirmModal, EmptyState, Modal, PageHeader } from '../../components/ui.jsx';

export default function Team() {
  const { db, user, addMember, removeMember, setResponsable, notify } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [conf, setConf] = useState(null); // {tipo, u}
  const [conflicto, setConflicto] = useState(null); // {u, trabajo}
  const t = D.trabajoActivo(db, user.id);
  if (!t) return <div className="card-tfc"><EmptyState title="Aún no tienes trabajo" text="Registra tu trabajo para formar tu equipo." action={<Link className="btn btn-primary" to="/mi-trabajo/nuevo">Registrar mi trabajo</Link>} /></div>;
  const editable = t.responsableId === user.id && D.esVigente(t);
  const norm = (s) => s.toLowerCase();
  const res = q.trim().length < 3 ? [] : db.usuarios.filter((u) => u.rol === 'estudiante' && u.estado === 'activo' && !t.integrantes.includes(u.id) && (norm(D.nombreCompleto(u)).includes(norm(q.trim())) || u.codigo.includes(q.trim())));
  const otro = (u) => db.trabajos.find((x) => x.id !== t.id && D.esVigente(x) && x.integrantes.includes(u.id));

  const agregar = (u) => {
    const r = addMember(t.id, u.id);
    if (r.ok) notify('success', 'Integrante agregado', `${D.nombreCompleto(u)} se unió al equipo.`);
    else if (r.conflicto) setConflicto({ u, trabajo: r.conflicto });
    else notify('danger', 'No se pudo agregar', r.error);
  };

  return (
    <>
      <PageHeader crumbs={[['Mi trabajo', '/mi-trabajo'], ['Equipo']]} title="Equipo de trabajo" subtitle="Máximo 3 integrantes. Ninguno puede participar en otro trabajo vigente."
        actions={<><Link to="/mi-trabajo" className="btn btn-link">Volver a la ficha</Link><button className="btn btn-primary" onClick={() => { notify('success', 'Equipo guardado', `${t.integrantes.length} integrante(s) en el trabajo ${t.codigo}.`); nav('/mi-trabajo'); }}>Guardar equipo</button></>} />
      {!editable && <div className="card-tfc warn p-2 small text-warn2 mb-3">{D.esVigente(t) ? 'Solo el responsable del equipo puede modificarlo mientras el trabajo está vigente.' : 'El trabajo ya no está vigente: el equipo queda en modo lectura.'}</div>}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card-tfc pad h-100 d-flex flex-column" style={{ minHeight: 560 }}>
            <h2 className="mb-3">Buscar estudiante</h2>
            <label className="form-label">Nombre, apellido o código</label>
            <input className="form-control mb-3" placeholder="Escribe al menos 3 caracteres…" value={q} onChange={(e) => setQ(e.target.value)} disabled={!editable} />
            {q.trim().length >= 3 && (
              <div className="card-tfc flat">
                <div className="p-2 px-3 eyebrow border-bottom">Resultados · {res.length} coincidencias</div>
                {res.length === 0 && <div className="p-3 small text-muted2">Ningún estudiante coincide con tu búsqueda.</div>}
                {res.slice(0, 8).map((u) => { const o = otro(u); return (
                  <div className="d-flex justify-content-between align-items-center p-2 px-3 border-bottom" key={u.id} style={o ? { background: '#fafaf6' } : null}>
                    <div><div className={o ? 'text-muted2' : 'fw-semibold'}>{D.nombreCompleto(u)}</div><div className="aux">{u.codigo} · {u.carrera} · {u.ciclo} ciclo</div>{o && <div className="aux text-warn2">Ya participa en otro trabajo vigente</div>}</div>
                    {o ? <button className="btn btn-sm btn-outline-secondary" onClick={() => setConflicto({ u, trabajo: o })}>No disponible</button> : <button className="btn btn-sm btn-outline-primary" disabled={!editable || t.integrantes.length >= 3} onClick={() => agregar(u)}>Agregar</button>}
                  </div>); })}
              </div>
            )}
            {t.integrantes.length >= 3 && <div className="card-tfc soft p-2 small mt-3">El equipo ya tiene 3 integrantes. Retira a alguien para agregar a otra persona.</div>}
            <div className="aux mt-auto pt-3">Solo aparecen estudiantes matriculados en 2026-2 de la Facultad de Ingeniería.</div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card-tfc h-100 d-flex flex-column" style={{ minHeight: 560 }}>
            <div className="card-head"><h2 className="mb-0">Integrantes</h2><span className="tag st-ok">{t.integrantes.length} de 3</span></div>
            <div className="px-4">
              {t.integrantes.map((i) => { const u = D.byId(db.usuarios, i); const esR = t.responsableId === i; return (
                <div className="rowline d-flex justify-content-between align-items-center" key={i}>
                  <div className="d-flex gap-3 align-items-center"><Avatar name={D.nombreCompleto(u)} size={40} /><div><div className="fw-semibold">{D.nombreCompleto(u)}</div><div className="aux">{u.codigo} · {u.carrera} · {u.ciclo} ciclo</div></div></div>
                  <div className="d-flex gap-3 align-items-center small">
                    {esR ? <><span className="tag st-warn">Responsable</span>{i === user.id && <span className="text-muted2">Tú</span>}</> : editable && <><button className="btn btn-link btn-sm p-0" onClick={() => setConf({ tipo: 'resp', u })}>Marcar responsable</button><button className="btn btn-link btn-sm p-0 text-danger2" onClick={() => setConf({ tipo: 'retirar', u })}>Retirar</button></>}
                  </div>
                </div>); })}
              {t.integrantes.length < 3 && <div className="rowline text-muted2 d-flex gap-3 align-items-center"><span className="avatar" style={{ width: 40, height: 40, border: '1px dashed var(--c-muted)', background: 'transparent' }}>+</span><div><div>Espacio disponible para un integrante más</div><div className="aux">Búscalo en el panel de la izquierda</div></div></div>}
            </div>
            <div className="card-foot mt-auto">El responsable registra los avances y recibe las notificaciones del asesor. Puede transferirse en cualquier momento antes de la sustentación.</div>
          </div>
        </div>
      </div>
      {conf?.tipo === 'retirar' && <ConfirmModal title="Retirar integrante" danger confirmLabel="Retirar" onClose={() => setConf(null)} onConfirm={() => { removeMember(t.id, conf.u.id); setConf(null); notify('success', 'Integrante retirado', D.nombreCompleto(conf.u)); }}>¿Seguro que deseas retirar a <b>{D.nombreCompleto(conf.u)}</b> del equipo?</ConfirmModal>}
      {conf?.tipo === 'resp' && <ConfirmModal title="Transferir responsabilidad" confirmLabel="Marcar responsable" onClose={() => setConf(null)} onConfirm={() => { setResponsable(t.id, conf.u.id); setConf(null); notify('success', 'Responsable actualizado', `${D.nombreCompleto(conf.u)} es ahora el responsable.`); }}>Al transferirla, <b>{D.nombreCompleto(conf.u)}</b> registrará los avances y recibirá las notificaciones. Tú dejarás de poder editar el equipo.</ConfirmModal>}
      {conflicto && (
        <Modal title="No se pudo agregar al integrante" onClose={() => setConflicto(null)} footer={<><button className="btn btn-link" onClick={() => setConflicto(null)}>Cerrar</button><button className="btn btn-primary" onClick={() => { setConflicto(null); setQ(''); }}>Buscar otro estudiante</button></>}>
          <div className="card-tfc warn p-2 small text-warn2 mb-3"><b>{D.nombreCompleto(conflicto.u)}</b> ya participa en el trabajo «{conflicto.trabajo.titulo}», {D.TAGS[conflicto.trabajo.estado][0].toLowerCase()} desde el {conflicto.trabajo.registrado.split('-').reverse().join('/')}.</div>
          <div className="card-tfc flat p-2 px-3 mb-3 d-flex justify-content-between align-items-center"><div><div className="text-muted2">{D.nombreCompleto(conflicto.u)}</div><div className="aux">{conflicto.u.codigo} · {conflicto.u.carrera}</div></div><span className="btn btn-sm btn-outline-secondary disabled">No disponible</span></div>
          <div className="small text-muted2">Si el estudiante desistió de su trabajo anterior, la coordinación debe liberarlo antes de agregarlo.</div>
        </Modal>
      )}
    </>
  );
}
