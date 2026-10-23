// ============================================================
// DATOS PROPIOS DE LA HISTORIA 6 (Sustentación).
// Entidades del UML: Sala, BloqueHorario (horas), CriterioEvaluacion,
// RequisitoSustentacion, Sustentacion, MiembroJurado, Acta.
// ============================================================

export const SALAS = [
  { codigo: "A-402", pabellon: "A", piso: 4, aforo: 30 },
  { codigo: "B-201", pabellon: "B", piso: 2, aforo: 40 },
];

// Bloques de 60 min que ofrece cada sala
export const HORAS = ["08:00", "09:00", "10:00", "11:00", "15:00"];
export const DURACION_MIN = 60;

export const CRITERIOS = [
  { id: "c1", nombre: "Rigor metodológico", peso: 30 },
  { id: "c2", nombre: "Resultados y análisis", peso: 30 },
  { id: "c3", nombre: "Calidad del informe", peso: 20 },
  { id: "c4", nombre: "Exposición y defensa", peso: 20 },
];

export const RESULTADOS = [
  { valor: "APROBADO", texto: "Aprobado" },
  { valor: "APROBADO_CON_OBSERVACIONES", texto: "Aprobado con observaciones" },
  { valor: "DESAPROBADO", texto: "Desaprobado" },
];

export const MODALIDADES = [
  { valor: "PRESENCIAL", texto: "Presencial" },
  { valor: "VIRTUAL", texto: "Virtual" },
  { valor: "HIBRIDA", texto: "Híbrida" },
];

export const REQUISITOS_TRABAJO_012 = [
  { tipo: "INFORME_FINAL_APROBADO", titulo: "Informe final aprobado", cumplido: true, fechaCumplimiento: "2026-11-24", aprobadoPor: "el asesor" },
  { tipo: "INFORME_IMPRESO", titulo: "Entrega del informe impreso", cumplido: false, fechaLimite: "2026-12-04", diasHabilesAntes: 5, lugarEntrega: "la oficina TFC" },
  { tipo: "CONSTANCIA_NO_ADEUDO", titulo: "Constancia de no adeudo", cumplido: false, lugarEntrega: "Tesorería", nota: "Se solicita en Tesorería y se adjunta al expediente" },
];

// ---------- Sustentaciones existentes ----------
const miembro = (docenteId, rol) => ({ docenteId, rol, agregadoConAdvertencia: false, motivoAdvertencia: "" });

export const SUSTENTACIONES_INICIALES = [
  {
    id: 1, trabajoCodigo: "TFC-2026-2-003", fecha: "2026-12-11", hora: "08:00", salaId: "A-402",
    modalidad: "PRESENCIAL", estado: "REALIZADA", fechaProgramacion: "2026-11-25T10:00",
    jurado: [miembro("d1", "PRESIDENTE"), miembro("d2", "MIEMBRO"), miembro("d3", "MIEMBRO")],
    juradoConfirmado: true, acta: null,
  },
  {
    id: 2, trabajoCodigo: "TFC-2026-2-008", fecha: "2026-12-11", hora: "11:00", salaId: "A-402",
    modalidad: "PRESENCIAL", estado: "PROGRAMADA", fechaProgramacion: "2026-11-26T09:30",
    jurado: [miembro("d5", "PRESIDENTE"), miembro("d2", "MIEMBRO"), miembro("d4", "MIEMBRO")],
    juradoConfirmado: true, acta: null,
  },
];

// Notas y observaciones del ejemplo "realizada"
export const ACTA_EJEMPLO = {
  estado: "REGISTRADA",
  notas: { c1: 17, c2: 16, c3: 18, c4: 17 },
  resultado: "APROBADO",
  porUnanimidad: true,
  observaciones: "Se recomienda publicar los resultados en el repositorio institucional y ampliar la validación a dos distritos adicionales.",
  fechaRegistro: "2026-12-11T12:20",
  registradaPor: "u-admin",
};
