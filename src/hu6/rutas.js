// ============================================================
// Puntos de integración de la Historia 6 (Sustentación).
// El App del grupo solo necesita:
//   1) envolver sus rutas con <ProveedorSustentacion>
//   2) registrar RUTAS_SUSTENTACION  (cada una trae el rol que puede verla)
// ============================================================
import {
  PaginaActa,
  PaginaActaAdmin,
  PaginaJurado,
  PaginaMiActa,
  PaginaMiSustentacion,
  PaginaProgramar,
} from "./paginas";

export const RUTAS_SUSTENTACION = [
  { path: "/sustentaciones/programar", rol: "ADMINISTRADOR", pantalla: "6.1", Componente: PaginaProgramar },
  { path: "/sustentaciones/jurado", rol: "ADMINISTRADOR", pantalla: "6.2", Componente: PaginaJurado },
  { path: "/sustentaciones/acta", rol: "ADMINISTRADOR", pantalla: "6.3", Componente: PaginaActa },
  { path: "/sustentaciones/acta/imprimir", rol: "ADMINISTRADOR", pantalla: "Acta A4", Componente: PaginaActaAdmin },
  { path: "/mi-sustentacion", rol: "ESTUDIANTE", pantalla: "6.4", Componente: PaginaMiSustentacion },
  { path: "/mi-sustentacion/acta", rol: "ESTUDIANTE", pantalla: "Acta A4", Componente: PaginaMiActa },
];

// Ruta a la que conviene redirigir mientras la app del grupo no tenga inicio propio.
export const RUTA_INICIAL_SUSTENTACION = "/sustentaciones/programar";
