// Reglas de negocio y cálculos derivados (sin acceso a React ni a almacenamiento).
import { HOY, diffDays, addDays } from './dates.jsx';
import { ETAPAS, PLANTILLA } from '../data/seed.jsx';

export const TAGS = {
  propuesta: ['Propuesta', 'st-propuesta'], en_desarrollo: ['En desarrollo', 'st-info'], concluido: ['Concluido', 'st-ok'], desistido: ['Desistido', 'st-danger'],
  pendiente: ['Pendiente', 'st-muted'], entregado: ['Entregado', 'st-info'], retraso: ['Con retraso', 'st-warn'], observado: ['Observado', 'st-accent'], aprobado: ['Aprobado', 'st-ok'], vencido: ['Vencido sin presentar', 'st-danger'],
  aceptada: ['Aceptada', 'st-ok'], rechazada: ['Rechazada', 'st-danger'], retirada: ['Retirada', 'st-muted'],
  activo: ['Activo', 'st-ok'], bloqueado: ['Bloqueado', 'st-danger'], por_validar: ['Por validar', 'st-warn'],
  programada: ['Programada', 'st-info'], realizada: ['Realizada', 'st-ok'], reprogramada: ['Reprogramada', 'st-warn'], desaprobada: ['Desaprobada', 'st-danger'],
};
export const ROLES = { estudiante: 'Estudiante · usuario normal', asesor: 'Asesor · docente', admin: 'Administrador · coordinación TFC', publico: 'Público · sin sesión' };
export const ROL_CORTO = { estudiante: 'Estudiante', asesor: 'Asesor', admin: 'Administrador', publico: 'Visitante' };

export const uid = (p) => p + Math.random().toString(36).slice(2, 9);
export const byId = (arr, id) => arr.find((x) => x.id === id);
export const nombreCompleto = (u) => (u ? `${u.nombres} ${u.apellidos}` : '—');
export const nombreAsesor = (u) => (u ? `${u.titulo} ${u.nombres} ${u.apellidos}` : '—');
export const carreraCorta = (c = '') => c.replace('Ingeniería', 'Ing.');
export const esVigente = (t) => t.estado === 'propuesta' || t.estado === 'en_desarrollo';
export const pwdChecks = (p = '') => [
  { ok: p.length >= 8, label: 'Al menos 8 caracteres' },
  { ok: /[A-Z]/.test(p), label: 'Incluye una mayúscula' },
  { ok: /\d/.test(p), label: 'Incluye un número' },
];
export const urlValida = (s) => /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(s.trim());

export const etapaActual = () => ETAPAS.find((e) => HOY >= e.ini && HOY <= e.fin) || ETAPAS.find((e) => HOY < e.ini) || ETAPAS[4];

export const trabajosDe = (db, uidE) => db.trabajos.filter((t) => t.integrantes.includes(uidE));
export const trabajoActivo = (db, uidE) => {
  const mios = trabajosDe(db, uidE);
  return mios.find(esVigente) || [...mios].sort((a, b) => b.registrado.localeCompare(a.registrado))[0] || null;
};
export const entregablesDe = (db, tid) => db.entregables.filter((e) => e.trabajoId === tid).sort((a, b) => a.orden - b.orden);
export const avancesDe = (db, eid) => db.avances.filter((a) => a.entregableId === eid).sort((a, b) => a.version - b.version);
export const aprobadoE = (db, e) => avancesDe(db, e.id).some((a) => a.estado === 'aprobado');
export const sumaPesos = (db, tid, excluir) => entregablesDe(db, tid).filter((e) => e.id !== excluir).reduce((s, e) => s + e.peso, 0);

export function infoEntregable(db, e, todos) {
  const avs = avancesDe(db, e.id);
  const ultimo = avs[avs.length - 1];
  let estado = 'pendiente';
  if (ultimo) estado = ultimo.estado === 'aprobado' ? 'aprobado' : ultimo.estado === 'observado' ? 'observado' : ultimo.retraso ? 'retraso' : 'entregado';
  else if (e.fechaLimite < HOY) estado = 'vencido';
  const esUltimo = e.orden === Math.max(...todos.map((x) => x.orden));
  const bloqueado = esUltimo && todos.length > 1 && !ultimo && todos.some((x) => x.id !== e.id && x.obligatorio && !aprobadoE(db, x));
  return {
    estado, ultimo, versiones: avs.length, bloqueado,
    diasRetraso: estado === 'vencido' ? diffDays(HOY, e.fechaLimite) : 0,
    puedeRegistrar: !bloqueado && (!ultimo || ultimo.estado === 'observado'),
  };
}
export function avanceTrabajo(db, tid) {
  const es = entregablesDe(db, tid).filter((e) => e.obligatorio);
  const tot = es.reduce((s, e) => s + e.peso, 0);
  if (!tot) return 0;
  return Math.round((es.filter((e) => aprobadoE(db, e)).reduce((s, e) => s + e.peso, 0) * 100) / tot);
}
export function alertasTrabajo(db, tid) {
  const es = entregablesDe(db, tid);
  const inf = es.map((e) => ({ e, i: infoEntregable(db, e, es) }));
  return {
    vencidos: inf.filter((x) => x.i.estado === 'vencido'),
    proximos: inf.filter((x) => ['pendiente', 'observado'].includes(x.i.estado) && x.e.fechaLimite >= HOY && diffDays(x.e.fechaLimite, HOY) <= 14),
    aprobados: inf.filter((x) => x.i.estado === 'aprobado').length,
    pendientes: inf.filter((x) => ['pendiente', 'observado'].includes(x.i.estado)).length,
  };
}
export function proximoVencimiento(db, tid) {
  const f = entregablesDe(db, tid).filter((e) => !aprobadoE(db, e) && e.fechaLimite >= HOY).map((e) => e.fechaLimite).sort();
  return f[0] || null;
}
export function ultimaRetro(db, tid) {
  const out = [];
  entregablesDe(db, tid).forEach((e) => avancesDe(db, e.id).forEach((a) => a.comentarios.filter((c) => c.rol === 'asesor').forEach((c) => out.push({ e, a, c }))));
  return out.sort((x, y) => y.c.fecha.localeCompare(x.c.fecha) || y.a.version - x.a.version)[0] || null;
}
export const cupoAsesor = (db, a) => {
  const cargo = db.trabajos.filter((t) => t.asesorId === a.id && t.estado !== 'desistido').length;
  const ocupados = (a.ocupadosBase || 0) + cargo;
  return { max: a.cupoMax, cargo, ocupados, disponible: Math.max(0, a.cupoMax - ocupados) };
};
export const pendientesRevision = (db, asesorId) => {
  const mis = db.trabajos.filter((t) => t.asesorId === asesorId && esVigente(t)).map((t) => t.id);
  return db.avances
    .filter((a) => a.estado === 'entregado')
    .map((a) => ({ a, e: byId(db.entregables, a.entregableId) }))
    .filter((x) => x.e && mis.includes(x.e.trabajoId))
    .sort((x, y) => x.a.fechaEntrega.localeCompare(y.a.fechaEntrega));
};
export const solicitudActiva = (db, tid) => db.solicitudes.find((s) => s.trabajoId === tid && s.estado === 'pendiente');
export const juradosCiclo = (db, a) => (a.juradosBase || 0) + db.sustentaciones.filter((s) => s.jurado.includes(a.id)).length;
export const sustDe = (db, tid) => db.sustentaciones.find((s) => s.trabajoId === tid);
export function slotOcupado(db, fecha, hora, sala, excluirId) {
  return db.sustentaciones.find((s) => s.id !== excluirId && s.fecha === fecha && s.hora === hora && s.sala === sala);
}
export const notaFinal = (notas, criterios) => Math.round(criterios.reduce((s, c) => s + (Number(notas[c.id]) || 0) * c.peso, 0) / 100);
export const planPlantilla = (tid, fechas) =>
  PLANTILLA.map((p, i) => ({ id: uid('en'), trabajoId: tid, orden: i + 1, nombre: p.nombre, descripcion: p.descripcion, fechaLimite: fechas[i], peso: p.peso, obligatorio: true }));
export const exportCsv = (nombre, filas) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const blob = new Blob(['\ufeff' + filas.map((f) => f.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
};
export { HOY, addDays, diffDays };
export const homeDe = (rol) => (rol === 'estudiante' ? '/mi-trabajo' : rol === 'asesor' ? '/asesor/asesorados' : '/admin/tablero');
