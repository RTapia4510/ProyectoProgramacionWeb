// ============================================================
// Reglas de negocio de la Historia 6 (funciones puras, fáciles de probar).
// ============================================================
import { CRITERIOS, DICTADOS_CLASE, DOCENTES, DURACION_MIN, HORAS, PERIODO, SALAS } from "../data/mock";
import { sumarMinutos } from "./fechas";

export const docentePorId = (id) => DOCENTES.find((d) => d.id === id);
export const nombreDocente = (d) => `${d.titulo} ${d.nombres} ${d.apellidos}`;

// ---------- Sala y horario (6.1) ----------

/** Devuelve la sustentación que ya ocupa esa sala en ese bloque (o undefined). */
export const buscarChoqueSala = (sustentaciones, salaId, fecha, hora, ignorarId = null) =>
  sustentaciones.find(
    (s) => s.id !== ignorarId && s.salaId === salaId && s.fecha === fecha && s.hora === hora,
  );

/** BloqueHorario (clase derivada del UML): estado de cada bloque de la sala. */
export const bloquesDeSala = (sustentaciones, salaId, fecha, horaSeleccionada) =>
  HORAS.map((hora) => {
    let estado = "LIBRE";
    if (buscarChoqueSala(sustentaciones, salaId, fecha, hora)) estado = "OCUPADA";
    else if (hora === horaSeleccionada) estado = "SELECCIONADA";
    return { horaInicio: hora, horaFin: sumarMinutos(hora, DURACION_MIN), estado };
  });

/** Alternativas cuando la sala está ocupada: misma sala más tarde y otras salas a la misma hora. */
export const sugerirAlternativas = (sustentaciones, salaId, fecha, hora, max = 2) => {
  const libres = [];
  HORAS.filter((h) => h > hora).forEach((h) => {
    if (!buscarChoqueSala(sustentaciones, salaId, fecha, h)) libres.push({ salaId, fecha, hora: h });
  });
  SALAS.filter((s) => s.codigo !== salaId).forEach((s) => {
    if (!buscarChoqueSala(sustentaciones, s.codigo, fecha, hora)) libres.push({ salaId: s.codigo, fecha, hora });
  });
  // Primero una de la misma sala y luego otra sala
  const mismaSala = libres.filter((a) => a.salaId === salaId).slice(0, 1);
  const otras = libres.filter((a) => a.salaId !== salaId);
  return [...mismaSala, ...otras].slice(0, max);
};

// ---------- Jurado (6.2) ----------

/** Estado de un docente en la lista de candidatos. */
export const estadoCandidato = (docente, { trabajo, sustentacion, sustentaciones }) => {
  if (docente.id === trabajo.asesorId) {
    return { estado: "NO_ELEGIBLE", motivo: "Asesor del trabajo · no elegible por reglamento" };
  }
  if (sustentacion.jurado.some((m) => m.docenteId === docente.id)) return { estado: "AGREGADO", motivo: "" };

  const cruce = sustentaciones.find(
    (s) =>
      s.id !== sustentacion.id &&
      s.fecha === sustentacion.fecha &&
      s.hora === sustentacion.hora &&
      s.jurado.some((m) => m.docenteId === docente.id),
  );
  if (cruce) return { estado: "NO_ELEGIBLE", motivo: "Ya integra otro jurado en ese bloque" };

  const dictado = conflictoDocencia(docente, trabajo);
  if (dictado) {
    return { estado: "ADVERTENCIA", motivo: `Posible conflicto: dictó clases al equipo en ${dictado.periodo}` };
  }
  return { estado: "DISPONIBLE", motivo: "" };
};

/** Regla blanda: ¿el docente dictó clases a algún integrante del equipo? */
export const conflictoDocencia = (docente, trabajo) =>
  DICTADOS_CLASE.find(
    (c) => c.docenteId === docente.id && c.periodo !== PERIODO.codigo && trabajo.equipo.some((e) => e.id === c.estudianteId),
  );

/** Requisitos del jurado: 3 miembros, ≥1 doctor, ≥1 del departamento del trabajo, 1 presidente. */
export const validarJurado = (jurado, trabajo) => {
  const docentes = jurado.map((m) => docentePorId(m.docenteId));
  const items = [
    { ok: jurado.length === 3, texto: `${jurado.length} de 3 miembros` },
    { ok: docentes.some((d) => d.grado === "DOCTOR"), texto: "Al menos 1 doctor" },
    { ok: docentes.some((d) => d.departamento === trabajo.departamento), texto: `Al menos 1 del departamento de ${trabajo.departamento}` },
    { ok: jurado.filter((m) => m.rol === "PRESIDENTE").length === 1, texto: "Un presidente designado" },
  ];
  return { items, cumple: items.every((i) => i.ok) };
};

// ---------- Acta (6.3) ----------

/** Nota final = Σ(nota × peso) redondeada. Devuelve null si falta alguna nota. */
export const calcularNotaFinal = (notas) => {
  if (CRITERIOS.some((c) => !esNotaValida(notas[c.id]))) return null;
  const suma = CRITERIOS.reduce((acc, c) => acc + (notas[c.id] * c.peso) / 100, 0);
  return Math.round(suma);
};

export const esNotaValida = (n) => Number.isInteger(n) && n >= 0 && n <= 20;

export const textoResultado = (valor) =>
  ({ APROBADO: "Aprobado", APROBADO_CON_OBSERVACIONES: "Aprobado con observaciones", DESAPROBADO: "Desaprobado" })[valor] ?? "";
