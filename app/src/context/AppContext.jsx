// Estado global (Context + hooks). Toda la data vive en el front y se persiste en localStorage.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createSeed, FECHAS_PLANTILLA, HORAS, SALAS, SEMESTRE, TITULOS, VENTANA_SUST, CRITERIOS } from '../data/seed.jsx';
import { HOY } from '../services/dates.jsx';
import * as D from '../services/domain.jsx';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const DB_KEY = 'tfc-db-v1';
const SES_KEY = 'tfc-session-v1';
const loadDb = () => {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : createSeed();
  } catch {
    return createSeed();
  }
};
const fail = (error, extra = {}) => ({ ok: false, error, ...extra });
const ok = (extra = {}) => ({ ok: true, ...extra });

export function AppProvider({ children }) {
  const [db, setDb] = useState(loadDb);
  const [sesionId, setSesionId] = useState(() => localStorage.getItem(SES_KEY));
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* sin almacenamiento */ }
  }, [db]);

  const user = useMemo(() => db.usuarios.find((u) => u.id === sesionId && u.estado === 'activo') || null, [db, sesionId]);

  const notify = useCallback((type, title, text) => {
    const id = D.uid('n');
    setToasts((t) => [...t, { id, type, title, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5500);
  }, []);
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const patch = (k, id, p) => setDb((d) => ({ ...d, [k]: d[k].map((x) => (x.id === id ? { ...x, ...(typeof p === 'function' ? p(x) : p) } : x)) }));
  const push = (k, item) => setDb((d) => ({ ...d, [k]: [...d[k], item] }));
  const drop = (k, id) => setDb((d) => ({ ...d, [k]: d[k].filter((x) => x.id !== id) }));

  /* ---------- HU-1 Cuenta y acceso ---------- */
  const login = (email, password) => {
    const u = db.usuarios.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.password !== password) return fail('credenciales');
    if (u.estado === 'por_validar') return fail('Tu cuenta está pendiente de validación por la coordinación.');
    if (u.estado === 'bloqueado') return fail('Tu cuenta está bloqueada. Motivo: ' + (u.motivoBloqueo || 'no indicado') + '.');
    localStorage.setItem(SES_KEY, u.id);
    setSesionId(u.id);
    return ok({ user: u });
  };
  const logout = () => { localStorage.removeItem(SES_KEY); setSesionId(null); };
  const registerStudent = (f) => {
    const errors = {};
    if (db.usuarios.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) errors.email = 'Este correo ya está registrado.';
    if (db.usuarios.some((u) => u.codigo === f.codigo)) errors.codigo = 'Este código de alumno ya está registrado.';
    if (Object.keys(errors).length) return fail('Datos duplicados', { errors });
    push('usuarios', { id: D.uid('e'), rol: 'estudiante', estado: 'activo', telefono: '', ...f });
    return ok();
  };
  const registerAdvisor = (f) => {
    if (db.usuarios.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) return fail('Datos duplicados', { errors: { email: 'Este correo ya está registrado.' } });
    push('usuarios', { id: D.uid('a'), rol: 'asesor', estado: 'por_validar', titulo: TITULOS[f.grado], lineas: [], cupoMax: 0, ocupadosBase: 0, experiencia: '', asesorados: 0, concluidos: 0, jurados: 0, juradosBase: 0, tiempoRevision: 0, conflictos: {}, telefono: '', solicitadoEl: HOY, ...f });
    return ok();
  };
  const updateUser = (id, p) => patch('usuarios', id, p);
  const changePassword = (id, actual, nueva) => {
    const u = D.byId(db.usuarios, id);
    if (u.password !== actual) return fail('La contraseña actual es incorrecta.');
    patch('usuarios', id, { password: nueva });
    return ok();
  };
  const resetPassword = (email, nueva) => {
    const u = db.usuarios.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (u) patch('usuarios', u.id, { password: nueva });
    return ok();
  };

  /* ---------- HU-2 Registro del trabajo ---------- */
  const createWork = (f, estId) => {
    const vig = D.trabajosDe(db, estId).find(D.esVigente);
    if (vig) return fail('Ya tienes un trabajo vigente.', { vigente: vig });
    const n = String(Math.max(0, ...db.trabajos.map((t) => parseInt(t.codigo.split('-').pop(), 10))) + 1).padStart(3, '0');
    const est = D.byId(db.usuarios, estId);
    const trabajo = { id: `t${n}`, codigo: `TFC-2026-2-${n}`, carrera: est.carrera, estado: 'propuesta', responsableId: estId, integrantes: [estId], asesorId: null, registrado: HOY, motivoEstado: '', cerradoEn: null, ...f };
    setDb((d) => { const b = { ...d.borradores }; delete b[estId]; return { ...d, trabajos: [...d.trabajos, trabajo], borradores: b }; });
    return ok({ trabajo });
  };
  const saveDraft = (estId, f) => setDb((d) => ({ ...d, borradores: { ...d.borradores, [estId]: f } }));
  const updateWork = (id, p) => patch('trabajos', id, p);
  const changeWorkState = (id, nuevo, motivo) => {
    if (nuevo === 'concluido') {
      const es = D.entregablesDe(db, id).filter((e) => e.obligatorio);
      const pend = es.filter((e) => !D.aprobadoE(db, e)).length;
      if (!es.length) return fail('El trabajo aún no tiene plan de entregables.');
      if (pend) return fail(pend === 1 ? 'Queda 1 entregable sin aprobar.' : `Quedan ${pend} entregables sin aprobar.`);
    }
    setDb((d) => ({
      ...d,
      trabajos: d.trabajos.map((t) => (t.id === id ? { ...t, estado: nuevo, motivoEstado: motivo, cerradoEn: HOY } : t)),
      solicitudes: nuevo === 'desistido' ? d.solicitudes.map((s) => (s.trabajoId === id && s.estado === 'pendiente' ? { ...s, estado: 'retirada', fechaResolucion: HOY } : s)) : d.solicitudes,
    }));
    return ok();
  };
  const addMember = (tid, sid) => {
    const t = D.byId(db.trabajos, tid);
    if (t.integrantes.length >= 3) return fail('El equipo ya tiene 3 integrantes.');
    const otro = db.trabajos.find((x) => x.id !== tid && D.esVigente(x) && x.integrantes.includes(sid));
    if (otro) return fail('conflicto', { conflicto: otro });
    patch('trabajos', tid, { integrantes: [...t.integrantes, sid] });
    return ok();
  };
  const removeMember = (tid, sid) => patch('trabajos', tid, (t) => ({ integrantes: t.integrantes.filter((x) => x !== sid) }));
  const setResponsable = (tid, sid) => patch('trabajos', tid, { responsableId: sid });

  /* ---------- HU-3 Asesores y asignación ---------- */
  const requestAdvisor = (tid, aid, mensaje) => {
    const t = D.byId(db.trabajos, tid);
    const a = D.byId(db.usuarios, aid);
    if (t.asesorId) return fail('Tu trabajo ya tiene asesor asignado.');
    const act = D.solicitudActiva(db, tid);
    if (act) return fail('activa', { solicitud: act });
    if (D.cupoAsesor(db, a).disponible <= 0) return fail('sincupo');
    if (!a.lineas.includes(t.linea)) return fail(`${D.nombreAsesor(a)} solo recibe solicitudes de sus líneas declaradas.`);
    push('solicitudes', { id: D.uid('s'), trabajoId: tid, asesorId: aid, mensaje, estado: 'pendiente', fecha: HOY, fechaResolucion: null, motivo: '' });
    return ok();
  };
  const withdrawRequest = (id) => patch('solicitudes', id, { estado: 'retirada', fechaResolucion: HOY });
  const resolveRequest = (id, aceptar, motivo = '') => {
    const s = D.byId(db.solicitudes, id);
    if (!aceptar) { patch('solicitudes', id, { estado: 'rechazada', fechaResolucion: HOY, motivo }); return ok(); }
    const a = D.byId(db.usuarios, s.asesorId);
    if (D.cupoAsesor(db, a).disponible <= 0) return fail('Ya no tienes cupo disponible. Termina una asesoría vigente o pide ampliar tu cupo máximo.');
    setDb((d) => ({
      ...d,
      solicitudes: d.solicitudes.map((x) => (x.id === id ? { ...x, estado: 'aceptada', fechaResolucion: HOY } : x.trabajoId === s.trabajoId && x.estado === 'pendiente' ? { ...x, estado: 'retirada', fechaResolucion: HOY } : x)),
      trabajos: d.trabajos.map((t) => (t.id === s.trabajoId ? { ...t, asesorId: s.asesorId, estado: 'en_desarrollo' } : t)),
    }));
    return ok({ trabajoId: s.trabajoId });
  };
  const endAdvisory = (tid, motivo) => patch('trabajos', tid, (t) => ({ asesorId: null, historialAsesoria: [...(t.historialAsesoria || []), { asesorId: t.asesorId, motivo, fecha: HOY }] }));
  const updateAdvisorProfile = (id, p) => patch('usuarios', id, p);

  /* ---------- HU-4 Plan de entregables ---------- */
  const checkItem = (tid, f, excluirId) => {
    const suma = D.sumaPesos(db, tid, excluirId) + f.peso;
    if (suma > 100) return fail(`Con este peso el plan suma ${suma}`, { suma });
    if (f.fechaLimite < SEMESTRE.ini || f.fechaLimite > SEMESTRE.fin) return fail('La fecha límite debe caer dentro del semestre 2026-2.');
    return null;
  };
  const addEntregable = (tid, f) => {
    const err = checkItem(tid, f);
    if (err) return err;
    const orden = Math.max(0, ...D.entregablesDe(db, tid).map((e) => e.orden)) + 1;
    push('entregables', { id: D.uid('en'), trabajoId: tid, orden, ...f });
    return ok();
  };
  const updateEntregable = (id, f) => {
    const e = D.byId(db.entregables, id);
    const err = checkItem(e.trabajoId, f, id);
    if (err) return err;
    patch('entregables', id, f);
    return ok();
  };
  const deleteEntregable = (id) => {
    if (D.avancesDe(db, id).length) return fail('No se puede eliminar un entregable con avances registrados.');
    drop('entregables', id);
    return ok();
  };
  const applyTemplate = (tid) => {
    if (D.entregablesDe(db, tid).length) return fail('La plantilla solo se carga cuando el plan está vacío.');
    setDb((d) => ({ ...d, entregables: [...d.entregables, ...D.planPlantilla(tid, FECHAS_PLANTILLA)] }));
    return ok();
  };
  const addAvance = (eid, f) => {
    const e = D.byId(db.entregables, eid);
    const info = D.infoEntregable(db, e, D.entregablesDe(db, e.trabajoId));
    if (!info.puedeRegistrar) return fail('Este entregable no admite nuevos avances en este momento.');
    push('avances', { id: D.uid('v'), entregableId: eid, version: info.versiones + 1, enlace: f.enlace, descripcion: f.descripcion, fechaEntrega: HOY, estado: 'entregado', retraso: HOY > e.fechaLimite, fechaRevision: null, comentarios: [] });
    return ok();
  };

  /* ---------- HU-5 Revisión y retroalimentación ---------- */
  const reviewAvance = (avId, decision, comentario, autorId) => {
    if (decision === 'observado' && comentario.trim().length < 30) return fail('Para observar un avance debes indicar qué corregir (mínimo 30 caracteres).');
    patch('avances', avId, (a) => ({
      estado: decision, fechaRevision: HOY,
      comentarios: comentario.trim() ? [...a.comentarios, { id: D.uid('c'), autorId, rol: 'asesor', texto: comentario.trim(), fecha: HOY }] : a.comentarios,
    }));
    return ok();
  };
  const addComment = (avId, texto, u) => patch('avances', avId, (a) => ({ comentarios: [...a.comentarios, { id: D.uid('c'), autorId: u.id, rol: u.rol, texto: texto.trim(), fecha: HOY }] }));

  /* ---------- HU-6 Sustentación ---------- */
  const alternativas = (fecha, sala, excluir) => {
    const libres = [];
    [sala, ...SALAS.filter((s) => s !== sala)].forEach((s) => HORAS.forEach((h) => { if (!D.slotOcupado(db, fecha, h, s, excluir) && libres.length < 2) libres.push({ sala: s, hora: h, fecha }); }));
    return libres;
  };
  const checkSlot = (f, excluir) => {
    if (f.fecha < VENTANA_SUST.ini || f.fecha > VENTANA_SUST.fin) return fail('La fecha debe estar dentro de la ventana de sustentaciones (07/12/2026 – 19/12/2026).');
    const c = D.slotOcupado(db, f.fecha, f.hora, f.sala, excluir);
    if (c) return fail('ocupada', { conflicto: c, alternativas: alternativas(f.fecha, f.sala, excluir) });
    return null;
  };
  const programSust = (f) => {
    const t = D.byId(db.trabajos, f.trabajoId);
    if (!t || t.estado !== 'concluido') return fail('Solo los trabajos en estado Concluido pueden programarse.');
    if (D.sustDe(db, t.id)) return fail('Este trabajo ya tiene una sustentación.');
    const err = checkSlot(f);
    if (err) return err;
    const s = { id: D.uid('su'), ...f, jurado: [], presidenteId: null, estado: 'programada', programadaEl: HOY, acta: null };
    push('sustentaciones', s);
    return ok({ sust: s });
  };
  const rescheduleSust = (id, f) => {
    const err = checkSlot(f, id);
    if (err) return err;
    patch('sustentaciones', id, { ...f, estado: 'reprogramada' });
    return ok();
  };
  const setJury = (id, jurado, presidenteId) => {
    const s = D.byId(db.sustentaciones, id);
    const t = D.byId(db.trabajos, s.trabajoId);
    const ms = jurado.map((j) => D.byId(db.usuarios, j));
    if (jurado.length !== 3) return fail('El jurado se compone de 3 miembros.');
    if (jurado.includes(t.asesorId)) return fail('El asesor del trabajo no puede integrar el jurado.');
    if (!presidenteId || !jurado.includes(presidenteId)) return fail('Designa al presidente del jurado.');
    if (!ms.some((m) => m.grado === 'Doctor')) return fail('Al menos un miembro debe tener grado de doctor.');
    if (!ms.some((m) => m.departamento === t.carrera)) return fail('Al menos un miembro debe pertenecer al departamento del trabajo.');
    patch('sustentaciones', id, { jurado, presidenteId });
    return ok();
  };
  const registerActa = (id, { notas, resultado, observaciones }, borrador) => {
    const s = D.byId(db.sustentaciones, id);
    const acta = { notas, final: D.notaFinal(notas, CRITERIOS), resultado, observaciones, fecha: HOY, borrador: !!borrador };
    if (borrador) { patch('sustentaciones', id, { actaBorrador: acta }); return ok(); }
    if (s.jurado.length !== 3) return fail('Conforma el jurado antes de registrar el acta.');
    if (CRITERIOS.some((c) => notas[c.id] === '' || notas[c.id] === undefined || Number(notas[c.id]) < 0 || Number(notas[c.id]) > 20)) return fail('Ingresa una nota de 0 a 20 en cada criterio.');
    patch('sustentaciones', id, { acta, actaBorrador: null, estado: resultado === 'Desaprobado' ? 'desaprobada' : 'realizada' });
    return ok();
  };

  /* ---------- HU-7 Supervisión y cuentas ---------- */
  const blockUser = (id, motivo) => patch('usuarios', id, { estado: 'bloqueado', motivoBloqueo: motivo });
  const unblockUser = (id) => patch('usuarios', id, { estado: 'activo', motivoBloqueo: '' });
  const validateAdvisor = (id, cupoMax) => patch('usuarios', id, { estado: 'activo', cupoMax });
  const rejectAdvisor = (id) => drop('usuarios', id);
  const setCupoMax = (id, n) => patch('usuarios', id, { cupoMax: n });
  const createCoordinator = (f) => {
    if (db.usuarios.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) return fail('Este correo ya está registrado.');
    push('usuarios', { id: D.uid('ad'), rol: 'admin', estado: 'activo', password: 'Invitado1', departamento: 'Coordinación TFC', telefono: '', ...f });
    return ok();
  };
  const resetDemo = () => { setDb(createSeed()); logout(); };

  const value = {
    db, user, toasts, notify, dismiss,
    login, logout, registerStudent, registerAdvisor, updateUser, changePassword, resetPassword,
    createWork, saveDraft, updateWork, changeWorkState, addMember, removeMember, setResponsable,
    requestAdvisor, withdrawRequest, resolveRequest, endAdvisory, updateAdvisorProfile,
    addEntregable, updateEntregable, deleteEntregable, applyTemplate, addAvance,
    reviewAvance, addComment, programSust, rescheduleSust, setJury, registerActa, alternativas,
    blockUser, unblockUser, validateAdvisor, rejectAdvisor, setCupoMax, createCoordinator, resetDemo,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
