// Consultas sobre el estado (evitan repetir filtros en las páginas).
import { ESTUDIANTE } from "../data/mock";

export const trabajoPorCodigo = (estado, codigo) => estado.trabajos.find((t) => t.codigo === codigo);

export const sustentacionDeTrabajo = (estado, codigo) => estado.sustentaciones.find((s) => s.trabajoCodigo === codigo);

/** Trabajos CONCLUIDOS que todavía no tienen sustentación. */
export const trabajosPorProgramar = (estado) =>
  estado.trabajos.filter((t) => t.estado === "CONCLUIDO" && !sustentacionDeTrabajo(estado, t.codigo));

export const sustentacionActual = (estado) =>
  estado.actual ? estado.sustentaciones.find((s) => s.id === estado.actual.sustentacionId) : null;

export const sustentacionDelEstudiante = (estado) => sustentacionDeTrabajo(estado, ESTUDIANTE.trabajoCodigo);

export { iniciales, nombreCompleto, nombreCorto } from "./personas";
