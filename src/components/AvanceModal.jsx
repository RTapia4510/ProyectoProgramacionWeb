// HU-4 · Registro de avance (a tiempo o con retraso) y solicitud de ampliación de plazo.
import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import * as D from '../services/domain.jsx';
import { fmt } from '../services/dates.jsx';
import { Field, Modal, inv } from './ui.jsx';

export function AvanceModal({ e, onClose }) {
  const { db, addAvance, notify } = useApp();
  const info = D.infoEntregable(db, e, D.entregablesDe(db, e.trabajoId));
  const tarde = D.HOY > e.fechaLimite;
  const dias = Math.abs(D.diffDays(e.fechaLimite, D.HOY));
  const [enlace, setEnlace] = useState('');
  const [desc, setDesc] = useState('');
  const [err, setErr] = useState({});
  const enviar = () => {
    const er = {};
    if (!D.urlValida(enlace)) er.enlace = 'Ingresa un enlace válido que empiece con https://';
    if (desc.trim().length < 20) er.desc = `Describe lo entregado en al menos 20 caracteres · ${desc.trim().length} / 600`;
    setErr(er);
    if (Object.keys(er).length) return;
    const r = addAvance(e.id, { enlace: enlace.trim(), descripcion: desc.trim() });
    if (!r.ok) return notify('danger', 'No se pudo registrar el avance', r.error);
    notify(tarde ? 'warning' : 'success', tarde ? 'Avance registrado con retraso' : 'Avance registrado', `${e.nombre} · versión ${info.versiones + 1}. Se notificó a tu asesor.`);
    onClose();
  };
  return (
    <Modal title="Registrar avance" onClose={onClose} footer={<><button className="btn btn-link" onClick={onClose}>Cancelar</button><button className={`btn ${tarde ? 'btn-warn' : 'btn-primary'}`} onClick={enviar}>{tarde ? 'Registrar con retraso' : 'Registrar avance'}</button></>}>
      <div className="aux mb-2">{e.orden}. {e.nombre} · versión {info.versiones + 1}</div>
      <div className={`card-tfc ${tarde ? 'warn text-warn2' : 'soft'} p-2 small mb-3`}>
        {tarde ? `Entrega con retraso: la fecha límite fue el ${fmt(e.fechaLimite)}, hace ${dias} días. El entregable quedará marcado como «Entregado con retraso» y tu asesor verá la diferencia de días.` : `Entrega a tiempo · la fecha límite es el ${fmt(e.fechaLimite)} y faltan ${dias} días.`}
      </div>
      <Field label="Enlace al documento" error={err.enlace} hint="Debe tener permiso de lectura para tu asesor" className="mb-3"><input className={`form-control${inv(err.enlace)}`} value={enlace} onChange={(x) => setEnlace(x.target.value)} placeholder="https://drive.google.com/…" /></Field>
      <Field label="Descripción de lo entregado" error={err.desc} hint={`Indica qué cambió respecto de la versión anterior · ${desc.trim().length} / 600`} className="mb-3"><textarea className={`form-control${inv(err.desc)}`} rows={4} maxLength={600} value={desc} onChange={(x) => setDesc(x.target.value)} /></Field>
      <div className="card-tfc flat p-2 px-3 d-flex justify-content-between small"><span><span className="eyebrow d-block">Versión</span><b className="fs-5">{info.versiones + 1}</b></span><span className="text-muted2 text-end">Calculada automáticamente{info.versiones === 0 ? <><br />Primer avance de este entregable</> : null}</span></div>
    </Modal>
  );
}

export function AmpliacionModal({ e, onClose }) {
  const { notify } = useApp();
  const [txt, setTxt] = useState('');
  const [err, setErr] = useState('');
  return (
    <Modal title="Solicitar ampliación" onClose={onClose} footer={<><button className="btn btn-link" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={() => { if (txt.trim().length < 30) return setErr(`Explica el motivo en al menos 30 caracteres · ${txt.trim().length} / 500`); notify('success', 'Solicitud enviada', `Tu asesor revisará la ampliación de «${e.nombre}».`); onClose(); }}>Enviar solicitud</button></>}>
      <p className="text-muted2">{e.orden}. {e.nombre} · fecha límite {fmt(e.fechaLimite)}</p>
      <Field label="Motivo (obligatorio)" error={err}><textarea className={`form-control${inv(err)}`} rows={4} maxLength={500} value={txt} onChange={(x) => { setTxt(x.target.value); setErr(''); }} /></Field>
    </Modal>
  );
}
