// ============================================================
// DATOS DE OTRAS HISTORIAS (solo de ejemplo).
// La Historia 6 los LEE pero no los define: cuando el grupo tenga
// backend o estado global, se reemplazan por la fuente real.
// Ver README, sección "Qué espera esta historia de las demás".
// ============================================================
import { REQUISITOS_TRABAJO_012 } from "./sustentacion";

export const PERIODO = { codigo: "2026-2", anterior: "2026-1" };

// EtapaCronograma (la etapa 5 define la ventana de sustentaciones)
export const ETAPAS = [
  { numero: 1, nombre: "Registro de propuestas", fechaInicio: "2026-08-10", fechaFin: "2026-08-28", estado: "CERRADA" },
  { numero: 2, nombre: "Asignación de asesores", fechaInicio: "2026-08-31", fechaFin: "2026-09-11", estado: "CERRADA" },
  { numero: 3, nombre: "Desarrollo y entregables", fechaInicio: "2026-09-14", fechaFin: "2026-11-20", estado: "EN_CURSO" },
  { numero: 4, nombre: "Informe final", fechaInicio: "2026-11-23", fechaFin: "2026-12-04", estado: "PENDIENTE" },
  { numero: 5, nombre: "Sustentaciones", fechaInicio: "2026-12-07", fechaFin: "2026-12-19", estado: "PENDIENTE" },
];
export const VENTANA = ETAPAS[4];

export const DEPARTAMENTOS = ["Ingeniería Civil", "Ingeniería Industrial", "Ingeniería de Sistemas"];

export const GRADOS = { DOCTOR: "doctor", MAGISTER: "magíster", INGENIERO: "ingeniero" };

export const DOCENTES = [
  { id: "d1", titulo: "Dr.", nombres: "Ricardo", apellidos: "Cárdenas Loayza", genero: "M", grado: "DOCTOR", departamento: "Ingeniería Civil", cargaJurados: 2 },
  { id: "d2", titulo: "Mg.", nombres: "Sandra", apellidos: "Bustamante Ríos", genero: "F", grado: "MAGISTER", departamento: "Ingeniería Industrial", cargaJurados: 3 },
  { id: "d3", titulo: "Ing.", nombres: "Luis Fernando", apellidos: "Ocampo Salas", genero: "M", grado: "INGENIERO", departamento: "Ingeniería Civil", cargaJurados: 4 },
  { id: "d4", titulo: "Dra.", nombres: "Gabriela", apellidos: "Torres Anchante", genero: "F", grado: "DOCTOR", departamento: "Ingeniería Industrial", cargaJurados: 2 },
  { id: "d5", titulo: "Dr.", nombres: "Pedro", apellidos: "Salazar Huamán", genero: "M", grado: "DOCTOR", departamento: "Ingeniería de Sistemas", cargaJurados: 1 },
  { id: "d6", titulo: "Mg.", nombres: "Julio", apellidos: "Vargas Aliaga", genero: "M", grado: "MAGISTER", departamento: "Ingeniería Industrial", cargaJurados: 0 },
];

// DictadoClase: docente que dictó clases a un estudiante en un periodo
export const DICTADOS_CLASE = [
  { docenteId: "d4", estudianteId: "e1", periodo: "2026-1", curso: "Investigación de Operaciones" },
  { docenteId: "d4", estudianteId: "e2", periodo: "2026-1", curso: "Investigación de Operaciones" },
];

// ---------- Trabajos ----------
const equipo = (id1, n1, a1, id2, n2, a2) => [
  { id: id1, nombres: n1, apellidos: a1, rol: "RESPONSABLE" },
  { id: id2, nombres: n2, apellidos: a2, rol: "INTEGRANTE" },
];

const base = (codigo, titulo, departamento, linea, asesorId, eq, estado = "CONCLUIDO") => ({
  codigo, titulo, estado, departamento, linea, asesorId,
  equipo: eq,
  avance: { aprobados: 5, total: 5 }, // 5 de 5 entregables aprobados = 100 %
  requisitos: [],
});

export const TRABAJOS_INICIALES = [
  {
    ...base("TFC-2026-2-012", "Optimización de rutas de reparto para comercios de Lima Metropolitana", "Ingeniería Industrial", "Gestión de operaciones", "d6",
      equipo("e1", "Diana Carolina", "Rojas Ttito", "e2", "Jorge Luis", "Tapia Bendezú")),
    requisitos: REQUISITOS_TRABAJO_012,
  },
  base("TFC-2026-2-004", "Modelo predictivo de demanda de energía eléctrica en hogares limeños", "Ingeniería de Sistemas", "Ciencia de datos aplicada", "d5",
    equipo("e3", "Camila", "Paredes Ugarte", "e4", "Andrés", "Villanueva Cruz")),
  base("TFC-2026-2-005", "Evaluación de la huella de carbono en obras de edificación multifamiliar", "Ingeniería Civil", "Sostenibilidad urbana", "d1",
    equipo("e5", "Mateo", "Quiroz Lazo", "e6", "Valeria", "Mendoza Rivas")),
  base("TFC-2026-2-006", "Planificación de la producción en una pyme textil con programación lineal", "Ingeniería Industrial", "Gestión de operaciones", "d6",
    equipo("e7", "Lucía", "Flores Cárdenas", "e8", "Sebastián", "Ramos Díaz")),
  base("TFC-2026-2-007", "Sistema de recomendación de rutas de transporte público en tiempo real", "Ingeniería de Sistemas", "Ciencia de datos aplicada", "d5",
    equipo("e9", "Renzo", "Huamán Soto", "e10", "Daniela", "Castillo Vega")),
  base("TFC-2026-2-009", "Diseño de pavimentos permeables para drenaje urbano en zonas de lluvia intensa", "Ingeniería Civil", "Sostenibilidad urbana", "d1",
    equipo("e11", "Fabiola", "Núñez Ortiz", "e12", "Gonzalo", "Alarcón Peña")),
  base("TFC-2026-2-010", "Mejora del nivel de servicio en almacenes de distribución mediante simulación", "Ingeniería Industrial", "Gestión de operaciones", "d6",
    equipo("e13", "Ximena", "Salinas Rojas", "e14", "Joaquín", "Bravo León")),
  // Concluido, ya tiene sustentación programada
  base("TFC-2026-2-008", "Clasificación automática de reclamos ciudadanos en municipalidades distritales", "Ingeniería de Sistemas", "Ciencia de datos aplicada", "d5",
    equipo("e15", "Alonso", "Gamarra Tello", "e16", "Marisol", "Chávez Pinto")),
  // Ya sustentado
  base("TFC-2026-2-003", "Análisis de estabilidad de taludes en laderas urbanas del sur de Lima", "Ingeniería Civil", "Sostenibilidad urbana", "d1",
    equipo("e17", "Brenda", "Aguilar Neyra", "e18", "Héctor", "Palomino Reyes"), "SUSTENTADO"),
];
