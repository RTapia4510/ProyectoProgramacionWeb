
import { useEffect, useState } from "react";

import { ModalSalaOcupada } from "../components/ModalesHU6";

import {
  trabajos,
  salas,
  horarios,
  sustentacionesIniciales,
} from "../data/sustentaciones";

const FECHA_MINIMA = "2026-12-07";
const FECHA_MAXIMA = "2026-12-19";
const FECHA_INICIAL = "2026-12-11";

function formatoFecha(fecha) {
  if (!fecha) return "";

  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

function siguienteHora(hora) {
  const [h, m] = hora.split(":").map(Number);

  return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function ProgramarSustentacion({ onIrJurado }) {

  // ESTADOS DEL FORMULARIO
  const [trabajoId, setTrabajoId] = useState("1");
  const [fecha, setFecha] = useState(FECHA_INICIAL);
  const [hora, setHora] = useState("10:00");
  const [sala, setSala] = useState("A-402");
  const [modalidad, setModalidad] = useState("Presencial");

  // DATOS SIMULADOS
 const [sustentaciones, setSustentaciones] = useState(() => {
  try {
    const guardadas = localStorage.getItem(
      "hu6-sustentaciones"
    );

    return guardadas
      ? JSON.parse(guardadas)
      : sustentacionesIniciales;
  } catch {
    return sustentacionesIniciales;
  }
});

useEffect(() => {
  localStorage.setItem(
    "hu6-sustentaciones",
    JSON.stringify(sustentaciones)
  );
}, [sustentaciones]);

  // MODALES Y MENSAJES
  const [mostrarSalaOcupada, setMostrarSalaOcupada] =
    useState(false);

  const [mensaje, setMensaje] = useState(null);
  const [mostrarCalendario, setMostrarCalendario] =
    useState(false);
  const [confirmacion, setConfirmacion] = useState(null);

  // TRABAJO SELECCIONADO
  const trabajoSeleccionado = trabajos.find(
    (t) => t.id === Number(trabajoId)
  );

  // VERIFICAR OCUPACIÓN DE SALA
  const estaOcupada = (horario, salaConsulta = sala, fechaConsulta = fecha) => {
    return sustentaciones.some(
      (s) =>
        s.fecha === fechaConsulta &&
        s.hora === horario &&
        s.sala === salaConsulta
    );
  };

  const ocupada = estaOcupada(hora);

  // TRABAJOS PENDIENTES
  const pendientes = trabajos.filter(
    (t) =>
      !sustentaciones.some(
        (s) => s.trabajoId === t.id
      )
  ).length;

  // OBTENER TRABAJO QUE OCUPA LA SALA
  const sustentacionEnConflicto = sustentaciones.find(
    (s) =>
      s.fecha === fecha &&
      s.hora === hora &&
      s.sala === sala
  );

  const trabajoEnConflicto = trabajos.find(
    (t) => t.id === sustentacionEnConflicto?.trabajoId
  );

  const nombreConflicto =
  trabajoEnConflicto?.titulo ||
  sustentacionEnConflicto?.tituloTrabajo ||
  "Otra sustentación programada";

  // ALTERNATIVAS DISPONIBLES
  const alternativas = [
    {
      sala: sala,
      fecha: fecha,
      hora: "15:00",
    },
    {
      sala: "B-201",
      fecha: fecha,
      hora: "11:00",
    },
  ].filter(
    (opcion) =>
      !estaOcupada(
        opcion.hora,
        opcion.sala,
        opcion.fecha
      )
  );

  // PROGRAMAR SUSTENTACIÓN
  function programarSustentacion(e) {
    e.preventDefault();

    setMensaje(null);

    // VALIDAR TRABAJO
    if (!trabajoSeleccionado) {
      setMensaje({
        tipo: "error",
        texto: "Debes seleccionar un trabajo válido.",
      });
      return;
    }

    if (trabajoSeleccionado.estado !== "Concluido") {
      setMensaje({
        tipo: "error",
        texto:
          "Solo se pueden programar trabajos concluidos.",
      });
      return;
    }

    // VALIDAR FECHA
    if (
      !fecha ||
      fecha < FECHA_MINIMA ||
      fecha > FECHA_MAXIMA
    ) {
      setMensaje({
        tipo: "error",
        texto:
          "La fecha debe estar entre el 07/12/2026 y el 19/12/2026.",
      });
      return;
    }

    // VALIDAR SALA OCUPADA
    if (ocupada) {
      setMostrarSalaOcupada(true);
      return;
    }

    // VALIDAR TRABAJO YA PROGRAMADO
    if (
      sustentaciones.some(
        (s) => s.trabajoId === Number(trabajoId)
      )
    ) {
      setMensaje({
        tipo: "error",
        texto:
          "Este trabajo ya tiene una sustentación registrada.",
      });
      return;
    }

    // CREAR SUSTENTACIÓN
    const nuevaSustentacion = {
      id: Date.now(),
      trabajoId: Number(trabajoId),
      fecha,
      hora,
      sala,
      modalidad,
      estado: "Programada",
    };

    // GUARDAR EN MEMORIA
    setSustentaciones((anteriores) => [
      ...anteriores,
      nuevaSustentacion,
    ]);

    // ABRIR CONFIRMACIÓN
    setConfirmacion(nuevaSustentacion);

    setMensaje({
      tipo: "exito",
      texto:
        "Sustentación programada correctamente. Puedes continuar con la conformación del jurado.",
    });
  }

  // RESTABLECER FORMULARIO
  function cancelar() {
    setTrabajoId("1");
    setFecha(FECHA_INICIAL);
    setHora("10:00");
    setSala("A-402");
    setModalidad("Presencial");

    setMensaje(null);
    setMostrarSalaOcupada(false);
  }

  // ELEGIR ALTERNATIVA DEL MODAL
  function elegirAlternativa(opcion) {
    setSala(opcion.sala);

    setFecha(
      opcion.fecha.split("/").reverse().join("-")
    );

    setHora(opcion.hora);
    setMostrarSalaOcupada(false);
    setMensaje(null);
  }

  return (
    <div className="lienzo">
      <div className="marco-proyecto">

        {/* RÓTULO ORIGINAL DEL MOCKUP */}
        <div className="rotulo-mockup">
          <div className="rotulo-izquierda">
            <span>6.1 PROGRAMAR SUSTENTACIÓN</span>

            <span className="rotulo-rol">
              Rol: Administrador · coordinación TFC
            </span>

            <span>
              1920 × 1080 · página completa
            </span>
          </div>

          <span className="rotulo-historia">
            HISTORIA 6 · SUSTENTACIÓN
          </span>
        </div>

        <div className="aplicacion">

          {/* HEADER */}
          <header className="header">
            <div className="marca">
              <div className="marca-icono">
                TF
              </div>

              <div className="marca-textos">
                <h2>
                  Trabajos de Fin de Carrera · Administración
                </h2>

                <p>
                  Universidad de Lima · Facultad de Ingeniería
                </p>
              </div>
            </div>

            <div className="header-derecha">
              <div className="periodo">
                <span>Periodo</span>
                <strong>2026-2</strong>
              </div>

              <span className="rol-admin">
                Administrador
              </span>

              <div className="usuario-avatar">
                CV
              </div>

              <div className="usuario-textos">
                <strong>
                  Carmen Velásquez Ayala
                </strong>

                <small>
                  Coordinación TFC
                </small>
              </div>
            </div>
          </header>

          {/* NAVEGACIÓN */}
          <nav className="navbar">
            <div className="nav-links">
              <a href="#tablero">
                Tablero
              </a>

              <a href="#trabajos">
                Trabajos
              </a>

              <a href="#carga">
                Carga por asesor
              </a>

              <a
                href="#sustentaciones"
                className="nav-activo"
              >
                Sustentaciones
              </a>

              <a href="#usuarios">
                Usuarios
              </a>

              <a href="#cuenta">
                Mi cuenta
              </a>
            </div>

            <div className="nav-final">
              <span>
                Ventana de sustentaciones 07/12 – 19/12
              </span>

              <a href="#salir">
                Cerrar sesión
              </a>
            </div>
          </nav>

          {/* CONTENIDO */}
          <main className="main-content">

            <div className="encabezado-pagina">
              <div className="breadcrumb">
                Sustentaciones · Programar
              </div>

              <h1>
                Programar sustentación
              </h1>

              <p>
                Solo los trabajos en estado Concluido
                pueden programarse. La sala no puede
                tener dos sustentaciones a la misma hora.
              </p>
            </div>

            <div className="contenido-grid">

              {/* FORMULARIO */}
              <form
                className="formulario-card"
                onSubmit={programarSustentacion}
              >

                {/* TRABAJO */}
                <div className="campo">
                  <label htmlFor="trabajo">
                    TRABAJO CONCLUIDO
                  </label>

                  <select
                    id="trabajo"
                    value={trabajoId}
                    onChange={(e) => {
                      setTrabajoId(e.target.value);
                      setMensaje(null);
                    }}
                  >
                    {trabajos.map((trabajo) => (
                      <option
                        key={trabajo.id}
                        value={trabajo.id}
                      >
                        {trabajo.titulo}
                      </option>
                    ))}
                  </select>

                  <div className="texto-ayuda">
                    {trabajos.length} trabajos concluidos
                    disponibles · asesor{" "}
                    {trabajoSeleccionado?.asesor} · equipo de{" "}
                    {trabajoSeleccionado?.integrantes} integrantes
                  </div>
                </div>

                {/* FECHA Y HORA */}
                <div className="fila-formulario">

                  <div className="campo">
                    <label htmlFor="fecha">
                      FECHA
                    </label>

                    <input
                      id="fecha"
                      type="date"
                      value={fecha}
                      min={FECHA_MINIMA}
                      max={FECHA_MAXIMA}
                      onChange={(e) => {
                        setFecha(e.target.value);
                        setMensaje(null);
                      }}
                      required
                    />

                    <div className="texto-ayuda">
                      Dentro de la ventana
                      07/12/2026 – 19/12/2026
                    </div>
                  </div>

                  <div className="campo">
                    <label htmlFor="hora">
                      HORA
                    </label>

                    <select
                      id="hora"
                      value={hora}
                      onChange={(e) => {
                        setHora(e.target.value);
                        setMensaje(null);
                      }}
                    >
                      {horarios.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>

                    <div className="texto-ayuda">
                      Bloques de 60 minutos
                    </div>
                  </div>
                </div>

                {/* SALA Y MODALIDAD */}
                <div className="fila-formulario">

                  <div className="campo">
                    <label htmlFor="sala">
                      SALA
                    </label>

                    <select
                      id="sala"
                      value={sala}
                      onChange={(e) => {
                        setSala(e.target.value);
                        setMensaje(null);
                      }}
                    >
                      {salas.map((s) => (
                        <option
                          key={s.id}
                          value={s.id}
                        >
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <fieldset className="campo modalidad-campo">
                    <legend>
                      MODALIDAD
                    </legend>

                    <div className="modalidad-opciones">
                      {[
                        "Presencial",
                        "Virtual",
                        "Híbrida",
                      ].map((opcion) => (
                        <button
                          type="button"
                          key={opcion}
                          className={
                            modalidad === opcion
                              ? "modalidad-boton modalidad-activa"
                              : "modalidad-boton"
                          }
                          onClick={() =>
                            setModalidad(opcion)
                          }
                        >
                          {opcion}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>

                {/* DISPONIBILIDAD */}
                <div
                  className={
                    ocupada
                      ? "disponibilidad disponibilidad-error"
                      : "disponibilidad disponibilidad-libre"
                  }
                >
                  <span className="disponibilidad-icono">
                    {ocupada ? "!" : "✓"}
                  </span>

                  <span>
                    {ocupada
                      ? `La sala ${sala} está ocupada el ${formatoFecha(fecha)} de ${hora} a ${siguienteHora(hora)}. Selecciona otro horario.`
                      : `La sala ${sala} está libre el ${formatoFecha(fecha)} de ${hora} a ${siguienteHora(hora)}. Ningún miembro del jurado tiene otra sustentación en ese bloque (dato simulado).`}
                  </span>
                </div>

                {/* NOTIFICACIONES */}
                <div className="notificaciones">
                  <h3>
                    NOTIFICACIONES AL GUARDAR
                  </h3>

                  <p>
                    Se notificará al equipo, al asesor
                    y a los tres miembros del jurado
                    con la fecha, hora, sala y modalidad.
                  </p>
                </div>

                {/* MENSAJES */}
                {mensaje && (
                  <div
                    role="alert"
                    className={
                      mensaje.tipo === "exito"
                        ? "mensaje-form mensaje-exito"
                        : "mensaje-form mensaje-error"
                    }
                  >
                    {mensaje.texto}
                  </div>
                )}

                {/* BOTONES */}
                <div className="formulario-acciones">

                  <button
                    type="button"
                    className="boton-cancelar"
                    onClick={cancelar}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="boton-guardar"
                  >
                    Programar y conformar jurado
                  </button>
                </div>
              </form>

              {/* PANEL DERECHO */}
              <aside className="sidebar">

                <div className="sidebar-card">
                  <h3>
                    SALA {sala} · {formatoFecha(fecha)}
                  </h3>

                  <div className="lista-horarios">
                    {horarios.map((h) => {
                      const bloqueOcupado =
                        estaOcupada(h);

                      const seleccionado =
                        hora === h;

                      return (
                        <button
                          type="button"
                          key={h}
                          className={[
                            "horario-item",
                            seleccionado
                              ? "horario-seleccionado"
                              : "",
                            bloqueOcupado
                              ? "horario-ocupado"
                              : "horario-libre",
                          ].join(" ")}
                          onClick={() => {
                            setHora(h);
                            setMensaje(null);
                          }}
                        >
                          <span>
                            {h} – {siguienteHora(h)}
                          </span>

                          <span className="horario-estado">
                            {seleccionado
                              ? "Seleccionada"
                              : bloqueOcupado
                                ? "Ocupada"
                                : "Libre"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sidebar-card resumen-card">
                  <h3>
                    SUSTENTACIONES DEL PERIODO
                  </h3>

                  <div className="resumen-fila">
                    <span>Programadas</span>

                    <strong>
                      {sustentaciones.filter(
                        (s) =>
                          s.estado === "Programada"
                      ).length}
                    </strong>
                  </div>

                  <div className="resumen-fila">
                    <span>Realizadas</span>

                    <strong>
                      {sustentaciones.filter(
                        (s) =>
                          s.estado === "Realizada"
                      ).length}
                    </strong>
                  </div>

                  <div className="resumen-fila">
                    <span>
                      Concluidos por programar
                    </span>

                    <strong>
                      {pendientes}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="ver-calendario"
                    onClick={() =>
                      setMostrarCalendario(true)
                    }
                  >
                    Ver calendario completo
                  </button>
                </div>
              </aside>
            </div>
          </main>

          {/* FOOTER */}
          <footer className="footer">
            <span>
              Sesión iniciada como Carmen Rosa Velásquez
              Ayala · rol Administrador · coordinación
              TFC 2026-2
            </span>

            <div className="footer-links">
              <a href="mailto:tfc@ulima.edu.pe">
                Reglamento TFC
              </a>

              <a href="mailto:tfc@ulima.edu.pe">
                tfc@ulima.edu.pe
              </a>

              <span>
                © 2026 Universidad de Lima
              </span>
            </div>
          </footer>
        </div>
      </div>

      {/* MODAL DEL CALENDARIO */}
      {mostrarCalendario && (
        <div
          className="modal-fondo"
          onClick={() =>
            setMostrarCalendario(false)
          }
        >
          <div
            className="modal-caja"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <h2>
              Calendario de sustentaciones
            </h2>

            <p>
              Sustentaciones registradas del periodo:
            </p>

            {sustentaciones.map((s) => (
              <div
                className="calendario-item"
                key={s.id}
              >
                <strong>
                  {formatoFecha(s.fecha)} · {s.hora}
                </strong>

                <span>
                  Sala {s.sala} · {s.modalidad}
                </span>
              </div>
            ))}

            <button
              type="button"
              className="boton-guardar"
              onClick={() =>
                setMostrarCalendario(false)
              }
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN DE PROGRAMACIÓN */}
      {confirmacion && (
        <div className="modal-fondo">
          <div className="modal-caja">
            <div className="confirmacion-check">
              ✓
            </div>

            <h2>
              Sustentación programada
            </h2>

            <p>
              Fecha: {formatoFecha(confirmacion.fecha)}
            </p>

            <p>
              Hora: {confirmacion.hora} ·
              Sala: {confirmacion.sala}
            </p>

            <p>
              El siguiente paso es conformar el jurado.
            </p>

            <button
              type="button"
              className="boton-guardar"
              onClick={() => {
                const datos = confirmacion;

                setConfirmacion(null);

                onIrJurado(datos);
              }}
            >
              Continuar a conformación del jurado
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6.1 - SALA OCUPADA */}
      {mostrarSalaOcupada && (
        <ModalSalaOcupada
          fecha={formatoFecha(fecha)}
          hora={hora}
          sala={sala}
          conflicto={nombreConflicto}
          alternativas={alternativas.map((opcion) => ({
            ...opcion,
            fecha: formatoFecha(opcion.fecha),
          }))}
          onCerrar={() =>
            setMostrarSalaOcupada(false)
          }
          onElegir={elegirAlternativa}
        />
      )}
    </div>
  );
}
