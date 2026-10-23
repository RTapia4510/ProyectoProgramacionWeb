// ============================================================
// Lógica de estado de la Historia 6 (estado inicial + reductor). Sin React.
// Sustituye al backend en la Entrega 1.
// ============================================================
import { ACTA_EJEMPLO, ESTUDIANTE, SUSTENTACIONES_INICIALES, TRABAJOS_INICIALES } from "../data/mock";
import { ahoraLocalISO } from "../utils/fechas";

export const estadoInicial = () => ({
  trabajos: TRABAJOS_INICIALES.map((t) => ({ ...t })),
  sustentaciones: SUSTENTACIONES_INICIALES.map((s) => ({ ...s, jurado: s.jurado.map((m) => ({ ...m })) })),
  notificaciones: [], // Notificacion (UML): tipo, destinatario, fechaEnvio
  actual: null, // sustentación en la que trabaja el administrador
});

const notificar = (estado, tipo, destinatarios) => ({
  ...estado,
  notificaciones: [
    ...estado.notificaciones,
    ...destinatarios.map((destinatario) => ({ tipo, destinatario, canal: "correo", fechaEnvio: ahoraLocalISO() })),
  ],
});

const actualizarSust = (estado, id, cambios) => ({
  ...estado,
  sustentaciones: estado.sustentaciones.map((s) => (s.id === id ? { ...s, ...cambios } : s)),
});

/** Prepara el ejemplo del estudiante en estado "programada" o "realizada". */
const crearPreset = (tipo) => {
  let estado = estadoInicial();
  const jurado = [
    { docenteId: "d1", rol: "PRESIDENTE", agregadoConAdvertencia: false, motivoAdvertencia: "" },
    { docenteId: "d2", rol: "MIEMBRO", agregadoConAdvertencia: false, motivoAdvertencia: "" },
    { docenteId: "d3", rol: "MIEMBRO", agregadoConAdvertencia: false, motivoAdvertencia: "" },
  ];
  const nueva = {
    id: 100, trabajoCodigo: ESTUDIANTE.trabajoCodigo, fecha: "2026-12-11", hora: "10:00", salaId: "A-402",
    modalidad: "PRESENCIAL", estado: "PROGRAMADA", fechaProgramacion: "2026-11-30T09:00",
    jurado, juradoConfirmado: true, acta: null,
  };
  if (tipo === "realizada") {
    nueva.estado = "REALIZADA";
    nueva.acta = { ...ACTA_EJEMPLO, notas: { ...ACTA_EJEMPLO.notas } };
    estado.trabajos = estado.trabajos.map((t) => (t.codigo === ESTUDIANTE.trabajoCodigo ? { ...t, estado: "SUSTENTADO" } : t));
  }
  estado.sustentaciones = [...estado.sustentaciones, nueva];
  estado.actual = { sustentacionId: 100 };
  return estado;
};

export function reductor(estado, accion) {
  switch (accion.tipo) {
    case "REINICIAR":
      return estadoInicial();

    case "PRESET":
      return accion.preset === "sin" ? estadoInicial() : crearPreset(accion.preset);

    case "PROGRAMAR": {
      const id = Math.max(...estado.sustentaciones.map((s) => s.id)) + 1;
      const nueva = {
        id, trabajoCodigo: accion.trabajoCodigo, fecha: accion.fecha, hora: accion.hora,
        salaId: accion.salaId, modalidad: accion.modalidad, estado: "PROGRAMADA",
        fechaProgramacion: ahoraLocalISO(), jurado: [], juradoConfirmado: false, acta: null,
      };
      return { ...estado, sustentaciones: [...estado.sustentaciones, nueva], actual: { sustentacionId: id } };
    }

    case "AGREGAR_JURADO": {
      const s = estado.sustentaciones.find((x) => x.id === accion.sustentacionId);
      if (s.jurado.length >= 3 || s.jurado.some((m) => m.docenteId === accion.docenteId)) return estado;
      const nuevo = {
        docenteId: accion.docenteId,
        rol: s.jurado.length === 0 ? "PRESIDENTE" : "MIEMBRO",
        agregadoConAdvertencia: !!accion.motivo,
        motivoAdvertencia: accion.motivo ?? "",
      };
      return actualizarSust(estado, s.id, { jurado: [...s.jurado, nuevo] });
    }

    case "QUITAR_JURADO": {
      const s = estado.sustentaciones.find((x) => x.id === accion.sustentacionId);
      let jurado = s.jurado.filter((m) => m.docenteId !== accion.docenteId);
      if (jurado.length > 0 && !jurado.some((m) => m.rol === "PRESIDENTE")) {
        jurado = jurado.map((m, i) => (i === 0 ? { ...m, rol: "PRESIDENTE" } : m));
      }
      return actualizarSust(estado, s.id, { jurado });
    }

    case "DESIGNAR_PRESIDENTE": {
      const s = estado.sustentaciones.find((x) => x.id === accion.sustentacionId);
      const jurado = s.jurado.map((m) => ({ ...m, rol: m.docenteId === accion.docenteId ? "PRESIDENTE" : "MIEMBRO" }));
      return actualizarSust(estado, s.id, { jurado });
    }

    case "CONFIRMAR_JURADO":
      return notificar(actualizarSust(estado, accion.sustentacionId, { juradoConfirmado: true }), "JURADO_CONFORMADO", ["EQUIPO", "ASESOR", "JURADO"]);

    case "GUARDAR_ACTA":
      return actualizarSust(estado, accion.sustentacionId, {
        acta: { ...accion.acta, estado: "BORRADOR" },
      });

    case "REGISTRAR_ACTA": {
      const s = estado.sustentaciones.find((x) => x.id === accion.sustentacionId);
      const acta = { ...accion.acta, estado: "REGISTRADA", fechaRegistro: ahoraLocalISO(), registradaPor: "u-admin", porUnanimidad: true };
      let siguiente = actualizarSust(estado, s.id, { acta, estado: "REALIZADA" });
      siguiente = {
        ...siguiente,
        trabajos: siguiente.trabajos.map((t) => (t.codigo === s.trabajoCodigo ? { ...t, estado: "SUSTENTADO" } : t)),
      };
      return notificar(siguiente, "ACTA_REGISTRADA", ["EQUIPO", "ASESOR", "SECRETARIA_ACADEMICA"]);
    }

    default:
      return estado;
  }
}
