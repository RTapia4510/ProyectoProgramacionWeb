// HU-3 · Directorio de asesores (lectura para visitantes; el estudiante puede solicitar asesoría).
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { DEPARTAMENTOS, LINEAS } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { Avatar, EmptyState, Field, LineTags, Modal, PageHeader, Pager, Tag } from '../../components/ui.jsx';

const POR_PAG = 6;

export default function Directory() {
  const { db, user, notify, requestAdvisor, withdrawRequest } = useApp();
  const trabajo = user && user.rol === 'estudiante' ? D.trabajoActivo(db, user.id) : null;
  const [q, setQ] = useState('');
  const [linea, setLinea] = useState(trabajo && D.esVigente(trabajo) ? trabajo.linea : '');
  const [depto, setDepto] = useState('');
  const [soloCupo, setSoloCupo] = useState(true);
  const [orden, setOrden] = useState('cupo');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // {tipo, asesor, solicitud}
  const [msg, setMsg] = useState('');
  const [msgErr, setMsgErr] = useState('');

  const todos = useMemo(() => db.usuarios.filter((u) => u.rol === 'asesor' && u.estado === 'activo').map((a) => ({ a, c: D.cupoAsesor(db, a) })), [db]);
  const lista = useMemo(() => {
    const r = todos.filter(({ a, c }) =>
      (!q || D.nombreCompleto(a).toLowerCase().includes(q.toLowerCase())) && (!linea || a.lineas.includes(linea)) && (!depto || a.departamento === depto) && (!soloCupo || c.disponible > 0));
    return r.sort((x, y) => (orden === 'nombre' ? x.a.apellidos.localeCompare(y.a.apellidos) : orden === 'experiencia' ? y.a.asesorados - x.a.asesorados : y.c.disponible - x.c.disponible));
  }, [todos, q, linea, depto, soloCupo, orden]);
  const pages = Math.max(1, Math.ceil(lista.length / POR_PAG));
  const pag = lista.slice((Math.min(page, pages) - 1) * POR_PAG, Math.min(page, pages) * POR_PAG);
  const filtros = [linea && ['linea', linea], depto && ['depto', depto], soloCupo && ['cupo', 'Solo con cupo']].filter(Boolean);
  const limpiar = () => { setQ(''); setLinea(''); setDepto(''); setSoloCupo(false); setPage(1); };
  const quitar = (k) => { if (k === 'linea') setLinea(''); if (k === 'depto') setDepto(''); if (k === 'cupo') setSoloCupo(false); setPage(1); };

  const solicitar = (a) => {
    if (!trabajo || !D.esVigente(trabajo)) return notify('warning', 'Primero registra tu trabajo', 'Necesitas un trabajo vigente para solicitar asesoría.');
    if (trabajo.responsableId !== user.id) return notify('warning', 'Solo el responsable puede solicitar', 'Pídele al responsable del equipo que envíe la solicitud.');
    if (trabajo.asesorId) return notify('warning', 'Tu trabajo ya tiene asesor', 'Si necesitas cambiarlo, el asesor actual debe terminar la asesoría.');
    const act = D.solicitudActiva(db, trabajo.id);
    if (act) return setModal({ tipo: 'activa', solicitud: act });
    if (D.cupoAsesor(db, a).disponible <= 0) return setModal({ tipo: 'sincupo', asesor: a });
    setMsg(''); setMsgErr(''); setModal({ tipo: 'solicitar', asesor: a });
  };
  const enviar = () => {
    const m = msg.trim();
    if (m.length < 20) return setMsgErr(`Explica tu elección en al menos 20 caracteres · ${m.length} / 600`);
    const r = requestAdvisor(trabajo.id, modal.asesor.id, m);
    if (r.ok) { setModal(null); notify('success', 'Solicitud enviada', `Se notificó a ${D.nombreAsesor(modal.asesor)}. Mientras esté pendiente no podrás solicitar a otro asesor.`); }
    else if (r.error === 'sincupo') setModal({ tipo: 'sincupo', asesor: modal.asesor });
    else if (r.error === 'activa') setModal({ tipo: 'activa', solicitud: r.solicitud });
    else notify('danger', 'No se pudo enviar la solicitud', r.error);
  };

  const alternativas = modal?.tipo === 'sincupo' && trabajo
    ? todos.filter(({ a, c }) => c.disponible > 0 && a.lineas.includes(trabajo.linea) && a.id !== modal.asesor.id).slice(0, 2) : [];
  const etapa = D.etapaActual();

  return (
    <>
      <PageHeader crumbs={[['Inicio', '/'], ['Directorio de asesores']]} title="Directorio de asesores"
        subtitle={`${todos.length} asesores · ${todos.filter((x) => x.c.disponible > 0).length} con cupo disponible · ${lista.length} coinciden con tus filtros`}
        actions={<Field label="Ordenar por"><select className="form-select" value={orden} onChange={(e) => setOrden(e.target.value)}><option value="cupo">Cupo disponible</option><option value="nombre">Apellido</option><option value="experiencia">Trabajos asesorados</option></select></Field>} />
      {user?.rol === 'estudiante' && <div className="aux mb-2">Asignación de asesores {etapa.n === 2 ? `cierra el ${fmt(etapa.fin)}` : 'según el cronograma 2026-2'}.</div>}
      <div className="card-tfc pad mb-2">
        <div className="row g-3 align-items-end">
          <Field className="col-lg-5" label="Buscar"><input className="form-control" placeholder="Nombre del asesor…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></Field>
          <Field className="col-md-6 col-lg-3" label="Línea de investigación"><select className="form-select" value={linea} onChange={(e) => { setLinea(e.target.value); setPage(1); }}><option value="">Todas</option>{LINEAS.map((l) => <option key={l}>{l}</option>)}</select></Field>
          <Field className="col-md-6 col-lg-2" label="Departamento"><select className="form-select" value={depto} onChange={(e) => { setDepto(e.target.value); setPage(1); }}><option value="">Todos</option>{DEPARTAMENTOS.map((l) => <option key={l}>{l}</option>)}</select></Field>
          <div className="col-lg-2"><div className="form-check mb-2"><input className="form-check-input" type="checkbox" id="solo" checked={soloCupo} onChange={(e) => { setSoloCupo(e.target.checked); setPage(1); }} /><label className="form-check-label" htmlFor="solo">Solo con cupo</label></div></div>
        </div>
      </div>
      {filtros.length > 0 && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3 small">
          <span className="eyebrow">Filtros activos</span>
          {filtros.map(([k, l]) => <span className="line-tag m-0" key={k}>{l} <button className="btn btn-sm p-0 ms-1" onClick={() => quitar(k)} aria-label={`Quitar ${l}`}>×</button></span>)}
          <button className="btn btn-link btn-sm p-0" onClick={limpiar}>Limpiar todo</button>
        </div>
      )}

      {lista.length === 0 ? (
        <div className="card-tfc"><EmptyState title="Ningún asesor coincide" text="No hay asesores con estos filtros. Prueba quitando algún filtro." action={<button className="btn btn-outline-primary" onClick={limpiar}>Quitar filtros</button>} /></div>
      ) : (
        <div className="row g-3">
          {pag.map(({ a, c }) => (
            <div className="col-md-6 col-xl-4" key={a.id}>
              <div className={`card-tfc pad h-100 d-flex flex-column ${c.disponible === 0 ? 'dim' : ''}`}>
                <div className="d-flex gap-3 align-items-center mb-2"><Avatar name={D.nombreAsesor(a)} size={44} /><div><div className="fw-semibold">{D.nombreAsesor(a)}</div><div className="aux">{a.departamento}</div></div></div>
                <LineTags items={a.lineas} />
                {c.disponible === 0
                  ? <div className="card-tfc warn p-2 small text-warn2 mb-2">Sin cupo disponible · {c.max} de {c.max} ocupados</div>
                  : <div className="small text-muted2 mb-2">{a.experiencia.split('.')[0]}. · {a.asesorados} trabajos asesorados</div>}
                <div className="mt-auto d-flex justify-content-between align-items-center border-top pt-3">
                  <span className="small">Cupo <b className={c.disponible ? 'text-ok' : ''}>{c.disponible} de {c.max}</b></span>
                  {!user ? <Link className="btn btn-outline-primary btn-sm" to="/login">Inicia sesión para solicitar</Link>
                    : user.rol === 'estudiante' ? <button className={`btn btn-sm ${c.disponible ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => solicitar(a)}>Solicitar asesoría</button> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <span className="aux">Mostrando {lista.length ? (Math.min(page, pages) - 1) * POR_PAG + 1 : 0}–{Math.min(Math.min(page, pages) * POR_PAG, lista.length)} de {lista.length}</span>
        <Pager page={Math.min(page, pages)} pages={pages} onChange={setPage} />
      </div>

      {modal?.tipo === 'solicitar' && (
        <Modal title="Solicitar asesoría" onClose={() => setModal(null)} footer={<><button className="btn btn-link" onClick={() => setModal(null)}>Cancelar</button><button className="btn btn-primary" onClick={enviar}>Enviar solicitud</button></>}>
          <div className="aux mb-2">{D.nombreAsesor(modal.asesor)} · cupo {D.cupoAsesor(db, modal.asesor).disponible} de {modal.asesor.cupoMax}</div>
          <div className="card-tfc flat p-3 mb-3"><div className="eyebrow">Tu trabajo</div><div className="serif">{trabajo.titulo}</div><div className="aux">{trabajo.linea} · {trabajo.carrera} · equipo de {trabajo.integrantes.length} integrantes</div></div>
          <Field label="Mensaje de sustento" error={msgErr} hint={`Explica por qué elegiste a este asesor · ${msg.trim().length} / 600`}>
            <textarea className={`form-control${msgErr ? ' is-invalid' : ''}`} rows={4} maxLength={600} value={msg} onChange={(e) => { setMsg(e.target.value); setMsgErr(''); }} />
          </Field>
          <div className="card-tfc soft p-2 small mt-3">Solo se admite una solicitud activa por trabajo. Mientras esté pendiente no podrás solicitar a otro asesor.</div>
        </Modal>
      )}
      {modal?.tipo === 'activa' && (
        <Modal title="Ya tienes una solicitud activa" onClose={() => setModal(null)} footer={<><button className="btn btn-link" onClick={() => setModal(null)}>Cerrar</button><button className="btn btn-outline-danger" onClick={() => { withdrawRequest(modal.solicitud.id); setModal(null); notify('success', 'Solicitud retirada', 'Ya puedes solicitar a otro asesor.'); }}>Retirar solicitud</button></>}>
          <div className="card-tfc warn p-2 small text-warn2 mb-3">Enviaste una solicitud a {D.nombreAsesor(D.byId(db.usuarios, modal.solicitud.asesorId))} el {fmt(modal.solicitud.fecha)} y aún está pendiente. Debes retirarla antes de solicitar a otro asesor.</div>
          <div className="card-tfc p-3 d-flex justify-content-between"><div><b>{D.nombreAsesor(D.byId(db.usuarios, modal.solicitud.asesorId))}</b><div className="aux">Enviada el {fmt(modal.solicitud.fecha)} · {D.diffDays(D.HOY, modal.solicitud.fecha)} días en espera</div></div><Tag k="pendiente" /></div>
        </Modal>
      )}
      {modal?.tipo === 'sincupo' && (
        <Modal title="Este asesor no tiene cupo" onClose={() => setModal(null)} footer={<button className="btn btn-link" onClick={() => setModal(null)}>Cerrar</button>}>
          <div className="card-tfc danger p-2 small text-danger2 mb-3">{D.nombreAsesor(modal.asesor)} ocupó sus {modal.asesor.cupoMax} cupos. No es posible enviar la solicitud.</div>
          {alternativas.length > 0 && <p className="text-muted2">Otros asesores de {trabajo.linea} con cupo disponible:</p>}
          {alternativas.map(({ a, c }) => (
            <div className="card-tfc p-3 d-flex justify-content-between align-items-center mb-2" key={a.id}><div><b>{D.nombreAsesor(a)}</b><div className="aux">Cupo {c.disponible} de {c.max}</div></div><button className="btn btn-outline-primary btn-sm" onClick={() => solicitar(a)}>Solicitar</button></div>
          ))}
        </Modal>
      )}
    </>
  );
}
