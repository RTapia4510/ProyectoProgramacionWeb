// HU-2 · Ficha del trabajo. Tres variantes, tal como en los mockups:
//   · propuesta sin asesor  · en desarrollo con asesor  · concluido / desistido (modo lectura).
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { ETAPAS, SALA_LABEL, VENTANA_SUST } from '../../data/seed.jsx';
import * as D from '../../services/domain.jsx';
import { fmt } from '../../services/dates.jsx';
import { Avatar, ConfirmModal, EmptyState, Field, LineTags, Modal, Progress, Tag, inv } from '../../components/ui.jsx';

const corto = (s) => fmt(s).slice(0, 5);
const COLOR_ESTADO = { aprobado: 'var(--c-success)', vencido: 'var(--c-danger)', retraso: 'var(--c-warning)', observado: 'var(--c-accent)', entregado: 'var(--c-info)', pendiente: 'var(--c-border)' };
const avisoA = (a) => (!a ? 'Se notificó a la coordinación.' : `Se notificó ${a.titulo === 'Dra.' ? 'a la asesora' : 'al asesor'} y a la coordinación.`);
const plural = (n, uno, varios) => (n === 1 ? uno : varios);

export default function MyWork() {
  const { db, user, changeWorkState, withdrawRequest, notify } = useApp();
  const nav = useNavigate();
  const [modal, setModal] = useState(false);
  const [estado, setEstado] = useState('');
  const [motivo, setMotivo] = useState('');
  const [err, setErr] = useState('');
  const [retiro, setRetiro] = useState(null);
  const t = D.trabajoActivo(db, user.id);
  if (!t) return <div className="card-tfc"><EmptyState title="Aún no registras tu trabajo" text="Registra tu propuesta para formar tu equipo, solicitar asesor y recibir tu plan de entregables." action={<Link to="/mi-trabajo/nuevo" className="btn btn-primary">Registrar mi trabajo</Link>} /></div>;

  const vigente = D.esVigente(t);
  const resp = t.responsableId === user.id;
  const pct = D.avanceTrabajo(db, t.id);
  const es = D.entregablesDe(db, t.id);
  const aprobados = es.filter((e) => D.aprobadoE(db, e)).length;
  const prox = D.proximoVencimiento(db, t.id);
  const al = D.alertasTrabajo(db, t.id);
  const asesor = D.byId(db.usuarios, t.asesorId);
  const aceptada = db.solicitudes.find((s) => s.trabajoId === t.id && s.asesorId === t.asesorId && s.estado === 'aceptada');
  const sol = D.solicitudActiva(db, t.id);
  const sust = D.sustDe(db, t.id);
  const etapa = D.etapaActual();
  const cierreAsignacion = ETAPAS[1].fin;
  const diasAsignacion = D.diffDays(cierreAsignacion, D.HOY);
  const miembros = t.integrantes.map((i) => D.byId(db.usuarios, i)).filter(Boolean);
  const sugeridos = db.usuarios.filter((u) => u.rol === 'asesor' && u.estado === 'activo' && u.lineas.includes(t.linea)).map((a) => ({ a, c: D.cupoAsesor(db, a) })).filter((x) => x.c.disponible > 0).slice(0, 3);
  const opciones = t.estado === 'propuesta' ? ['desistido'] : ['concluido', 'desistido'];
  const minMotivo = estado === 'desistido' ? 40 : 10;
  const soloResp = resp ? undefined : 'Solo el responsable del equipo puede hacerlo';

  const abrirCambio = () => { setErr(''); setMotivo(''); setEstado(opciones.length === 1 ? opciones[0] : ''); setModal(true); };
  const confirmar = () => {
    if (!estado) return setErr('Selecciona el nuevo estado');
    if (motivo.trim().length < minMotivo) return setErr(`Motivo obligatorio: mínimo ${minMotivo} caracteres · ${motivo.trim().length} / 500`);
    const r = changeWorkState(t.id, estado, motivo.trim());
    if (!r.ok) { setModal(false); return notify('danger', 'No se pudo actualizar el estado', r.error); }
    setModal(false); setEstado(''); setMotivo('');
    notify('success', `Estado actualizado a ${D.TAGS[estado][0]}`, avisoA(asesor));
  };

  const textoAvance = !es.length
    ? (vigente ? 'El plan de entregables se habilita cuando un asesor acepte' : 'El trabajo se cerró sin plan de entregables')
    : !vigente
      ? `${aprobados} de ${es.length} entregables aprobados · la ficha y el plan quedan en modo lectura`
      : `${aprobados} de ${es.length} entregables aprobados${prox ? ` · próximo vencimiento ${fmt(prox)}` : ''}`;

  /* ---------- bloques reutilizados ---------- */
  const resumen = (
    <div className="card-tfc pad">
      <h2 className="mb-2">Resumen</h2>
      <p>{t.resumen}</p>
      {t.objetivos && <><div className="eyebrow mb-1">Objetivos</div><p className="small">{t.objetivos}</p></>}
      <LineTags items={t.palabras} />
      {!vigente && (
        <div className="border-top mt-3 pt-3">
          <div className="eyebrow mb-1">Equipo</div>
          <div>{miembros.map((u, i) => <span key={u.id}>{i > 0 && ' · '}{D.nombreCompleto(u)}{u.id === t.responsableId ? ' (responsable)' : ''}</span>)}</div>
          {t.motivoEstado && <><div className="eyebrow mt-3 mb-1">Motivo del cambio de estado</div><div className="small">{t.motivoEstado}</div></>}
        </div>
      )}
    </div>
  );

  const solicitudPendiente = sol && D.byId(db.usuarios, sol.asesorId);
  const sinAsesor = (
    <div className="card-tfc dashed pad text-center">
      <div className="empty ok py-3"><div className="icon">＋</div>
        <h2 className="mb-2">{sol ? 'Solicitud de asesoría pendiente' : 'Aún no tienes asesor'}</h2>
        {sol ? (
          <><p className="text-muted2">Enviaste una solicitud a {D.nombreAsesor(solicitudPendiente)} el {fmt(sol.fecha)}. Te avisaremos cuando responda.</p>
            <button className="btn btn-outline-danger" disabled={!resp} title={soloResp} onClick={() => setRetiro(sol)}>Retirar solicitud</button></>
        ) : (
          <><p className="text-muted2 mx-auto" style={{ maxWidth: 460 }}>Elige un asesor del directorio entre quienes tengan cupo en {t.linea}. Solo puedes mantener una solicitud activa por trabajo.</p>
            <Link to="/asesores" className="btn btn-primary">Buscar asesor con cupo</Link></>
        )}
      </div>
    </div>
  );

  const equipoLateral = (
    <div className="card-tfc pad">
      <div className="eyebrow mb-3">Equipo</div>
      {miembros.map((u) => (
        <div className="d-flex gap-2 align-items-center mb-3" key={u.id}>
          <Avatar name={D.nombreCompleto(u)} size={32} />
          <div><div className="fw-semibold small">{D.nombreCompleto(u)}</div><div className="aux">{u.id === t.responsableId ? 'Responsable' : 'Integrante'}</div></div>
        </div>
      ))}
      <div className="border-top pt-2"><Link to="/mi-trabajo/equipo" className="small fw-semibold">Gestionar equipo</Link></div>
    </div>
  );

  const equipoChips = (
    <div className="card-tfc pad flex-grow-1">
      <div className="d-flex justify-content-between mb-3"><h2 className="mb-0">Equipo</h2><Link to="/mi-trabajo/equipo" className="fw-semibold">Gestionar equipo</Link></div>
      <div className="d-flex flex-wrap gap-2">{miembros.map((u) => <div className="card-tfc p-2 px-3 d-flex gap-2 align-items-center" key={u.id}><Avatar name={D.nombreCompleto(u)} size={28} /><span className="small">{D.nombreCompleto(u)} · {u.codigo}</span>{t.responsableId === u.id && <span className="tag st-warn">Responsable</span>}</div>)}</div>
    </div>
  );

  const planLectura = es.length > 0 && (
    <div className="card-tfc pad"><h2 className="mb-3">Plan de entregables · modo lectura</h2>
      <div className="row row-cols-1 row-cols-md-3 row-cols-xl-5 g-3">
        {es.map((e) => { const i = D.infoEntregable(db, e, es); return (
          <div className="col" key={e.id}><div style={{ borderTop: `3px solid ${COLOR_ESTADO[i.estado]}` }} className="pt-2"><Tag k={i.estado} /><div className="small fw-semibold mt-1">{e.orden}. {e.nombre}</div><div className="aux">{e.peso} · {corto(e.fechaLimite)}</div></div></div>
        ); })}
      </div>
      <div className="aux mt-3">Ya no se admiten nuevos avances. El historial de versiones y los comentarios siguen disponibles.</div></div>
  );

  const panelSust = sust ? (
    <div className="card-tfc soft pad d-flex flex-column h-100">
      <div className="eyebrow mb-1">Sustentación {D.TAGS[sust.estado][0].toLowerCase()}</div>
      <div className="serif fs-3 mb-1">{fmt(sust.fecha)} · {sust.hora}</div>
      <div className="mb-3">Sala {sust.sala}{(SALA_LABEL[sust.sala] || '').split(' · ')[1] ? `, ${SALA_LABEL[sust.sala].split(' · ')[1]}` : ''} · modalidad {sust.modalidad.toLowerCase()}</div>
      <div className="card-tfc p-3 mb-3">
        <div className="eyebrow mb-2">Jurado</div>
        {sust.jurado.length === 0 && <div className="small text-muted2">La coordinación aún está conformando el jurado.</div>}
        {sust.jurado.map((id) => <div className="d-flex justify-content-between align-items-center mb-1" key={id}><span className="small">{D.nombreAsesor(D.byId(db.usuarios, id))}</span>{id === sust.presidenteId && <span className="tag st-warn">Presidente</span>}</div>)}
      </div>
      <div className="small mb-3">Presenta el informe final impreso en la oficina TFC al menos 5 días hábiles antes.</div>
      <Link to="/mi-sustentacion" className="btn btn-primary w-100 mt-auto">Ver detalle de mi sustentación</Link>
    </div>
  ) : t.estado === 'concluido' ? (
    <div className="card-tfc soft pad"><div className="eyebrow mb-1">Sustentación</div><div className="fw-semibold mb-1">Aún sin fecha</div><div className="small">La coordinación programa las sustentaciones entre el {fmt(VENTANA_SUST.ini)} y el {fmt(VENTANA_SUST.fin)}. Te avisaremos con la fecha, hora, sala y jurado.</div></div>
  ) : (
    <div className="card-tfc danger pad"><div className="eyebrow mb-1 text-danger2">Trabajo desistido</div><div className="small mb-3">Cerraste este trabajo el {fmt(t.cerradoEn)}. Puedes registrar uno nuevo cuando lo necesites.</div><Link to="/mi-trabajo/nuevo" className="btn btn-primary w-100">Registrar un nuevo trabajo</Link></div>
  );

  return (
    <>
      <div className="card-tfc pad mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div className="flex-grow-1" style={{ minWidth: 280 }}>
            <div className="d-flex align-items-center gap-2 mb-2"><Tag k={t.estado} /><span className="aux">{t.cerradoEn && !vigente ? `Cerrado el ${fmt(t.cerradoEn)}` : `Registrado el ${fmt(t.registrado)}`} · código {t.codigo}</span></div>
            <h1 className="mb-1">{t.titulo}</h1>
            <div className="text-muted2">{t.linea} · {t.carrera}{asesor && !vigente ? ` · asesor ${D.nombreAsesor(asesor)}` : ''}</div>
          </div>
          <div className="d-flex gap-2 align-items-start flex-wrap">
            <button className="btn btn-outline-primary" disabled={!vigente || !resp} title={vigente ? soloResp : 'El trabajo ya no está vigente'} onClick={() => nav('/mi-trabajo/editar')}>Editar ficha</button>
            {vigente && <button className="btn btn-outline-danger" disabled={!resp} title={soloResp} onClick={abrirCambio}>Cambiar estado</button>}
            {!vigente && sust && <Link to="/mi-sustentacion" className="btn btn-primary">Ver mi sustentación</Link>}
          </div>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-3 border-top mt-3 pt-3">
          <span className="eyebrow">Avance</span><Progress value={pct} className="flex-grow-1" tone={pct === 100 ? 'ok' : ''} /><span className="pct" style={pct === 100 ? { color: 'var(--c-success)' } : null}>{pct}%</span>
          <span className="aux">{textoAvance}</span>
        </div>
      </div>

      {!vigente ? (
        <div className="row g-3">
          <div className="col-lg-8 d-flex flex-column gap-3">{planLectura}{resumen}</div>
          <div className="col-lg-4">{panelSust}</div>
        </div>
      ) : asesor ? (
        <div className="row g-3">
          <div className="col-lg-8 d-flex flex-column gap-3">{resumen}{equipoChips}</div>
          <div className="col-lg-4 d-grid gap-3 align-content-start">
            <div className="card-tfc pad"><div className="eyebrow mb-2">{asesor.titulo === 'Dra.' ? 'Asesora asignada' : 'Asesor asignado'}</div>
              <div className="d-flex gap-3 align-items-center mb-2"><Avatar name={D.nombreAsesor(asesor)} size={44} /><div><div className="fw-semibold">{D.nombreAsesor(asesor)}</div><div className="aux">{asesor.departamento}</div></div></div>
              <div className="aux mb-3">{aceptada ? `Asesoría aceptada el ${fmt(aceptada.fechaResolucion)} · responde` : 'Responde'} en {asesor.tiempoRevision} días en promedio</div>
              <Link to="/asesores" className="btn btn-outline-primary w-100">Ver directorio de asesores</Link></div>
            {al.vencidos.length > 0 && (
              <div className="card-tfc warn pad"><div className="fw-bold text-warn2">{plural(al.vencidos.length, 'Entregable vencido', `${al.vencidos.length} entregables vencidos`)}</div><div className="small text-warn2 my-2">{al.vencidos[0].e.nombre} · venció el {fmt(al.vencidos[0].e.fechaLimite)}{al.vencidos.length > 1 ? ` (y ${al.vencidos.length - 1} más)` : ''}</div><Link to="/entregables" className="btn btn-warn w-100">Registrar avance ahora</Link></div>
            )}
            <div className="card-tfc pad"><div className="eyebrow mb-2">Accesos rápidos</div><div className="d-grid gap-2"><Link to="/entregables" className="btn btn-primary">Plan de entregables</Link><Link to="/retroalimentacion" className="btn btn-outline-primary">Retroalimentación</Link></div></div>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          <div className="col-lg-8 d-flex flex-column gap-3">{sinAsesor}{resumen}</div>
          <div className="col-lg-4 d-grid gap-3 align-content-start">
            {equipoLateral}
            {etapa.n <= 2
              ? <div className="card-tfc soft pad"><div className="fw-bold mb-1">Plazo de la etapa 2</div><div className="small">La asignación de asesores cierra el {fmt(cierreAsignacion)}. {diasAsignacion > 0 ? `${plural(diasAsignacion, 'Falta', 'Faltan')} ${diasAsignacion} ${plural(diasAsignacion, 'día', 'días')}.` : 'Cierra hoy.'}</div></div>
              : <div className="card-tfc warn pad"><div className="fw-bold text-warn2 mb-1">Asignación cerrada</div><div className="small text-warn2">La etapa de asignación cerró el {fmt(cierreAsignacion)}. Escribe a tfc@ulima.edu.pe para pedir asesor.</div></div>}
            {sugeridos.length > 0 && <div className="card-tfc pad"><div className="eyebrow mb-2">Asesores sugeridos</div>{sugeridos.map(({ a, c }) => <div className="small rowline" key={a.id}>{D.nombreAsesor(a)} · cupo {c.disponible} de {c.max}</div>)}</div>}
          </div>
        </div>
      )}

      <div className="d-flex flex-wrap gap-3 small fw-semibold mt-3">
        <Link to="/mis-trabajos">Ver todos mis trabajos</Link>
        <Link to="/mi-trabajo/consolidado">Vista consolidada del trabajo</Link>
      </div>

      {modal && (
        <Modal title="Cambiar estado del trabajo" onClose={() => setModal(false)} footer={<><button className="btn btn-link" onClick={() => setModal(false)}>Cancelar</button><button className={`btn ${estado === 'desistido' ? 'btn-danger' : 'btn-primary'}`} onClick={confirmar}>{estado === 'desistido' ? 'Desistir del trabajo' : estado === 'concluido' ? 'Marcar concluido' : 'Confirmar'}</button></>}>
          <div className="card-tfc flat p-2 mb-3 d-flex gap-2 align-items-center"><Tag k={t.estado} /> → {estado ? <Tag k={estado} /> : <span className="aux">elige un estado</span>}</div>
          {opciones.length > 1 && <div className="mb-3">{opciones.map((o) => <div className="form-check" key={o}><input className="form-check-input" type="radio" name="est" id={`o-${o}`} checked={estado === o} onChange={() => { setEstado(o); setErr(''); }} /><label className="form-check-label" htmlFor={`o-${o}`}>{D.TAGS[o][0]}</label></div>)}</div>}
          <Field label="Motivo (obligatorio)" error={err} hint={estado ? `Mínimo ${minMotivo} caracteres · ${motivo.trim().length} / 500` : ''}><textarea className={`form-control${inv(err)}`} rows={3} maxLength={500} value={motivo} onChange={(e) => { setMotivo(e.target.value); setErr(''); }} /></Field>
          {estado === 'desistido' && <div className="card-tfc danger p-2 small text-danger2 mt-3">Desistir cierra el plan de entregables, cancela los avances pendientes de revisión{asesor ? ` y libera el cupo de ${D.nombreAsesor(asesor)}` : ''}. No se puede revertir sin la coordinación.</div>}
          {estado === 'concluido' && <div className="card-tfc soft p-2 small mt-3">Al concluir, el trabajo queda habilitado para programar sustentación y el plan pasa a modo lectura.</div>}
        </Modal>
      )}
      {retiro && (
        <ConfirmModal title="Retirar solicitud" danger confirmLabel="Retirar solicitud" onClose={() => setRetiro(null)} onConfirm={() => { withdrawRequest(retiro.id); setRetiro(null); notify('success', 'Solicitud retirada', 'Ya puedes solicitar a otro asesor.'); }}>
          ¿Seguro que deseas retirar tu solicitud a <b>{solicitudPendiente ? D.nombreAsesor(solicitudPendiente) : 'el asesor'}</b>? Podrás enviar una nueva a otro asesor.
        </ConfirmModal>
      )}
    </>
  );
}
