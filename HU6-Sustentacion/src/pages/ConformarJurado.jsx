
import { useState } from "react";
import { docentes } from "../data/docentes";
import { trabajos } from "../data/sustentaciones";
import "../Jurado.css";

// NORMALIZAR NOMBRES PARA COMPARAR ASESORES
function normalizarNombre(nombre = "") {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(dr\.|dra\.|mg\.|ing\.)\s*/i, "")
    .trim()
    .toLowerCase();
}

export default function ConformarJurado({
  sustentacion,
  onVolver,
  onIrActa,
}) {
  // TRABAJO SELECCIONADO EN 6.1
  const trabajoActual =
    trabajos.find(
      (t) => t.id === sustentacion?.trabajoId
    ) || trabajos[0];

  const trabajoEjemplo = {
    ...trabajoActual,
    departamento: "Ingeniería de Sistemas",
  };

  // IDENTIFICAR EL ASESOR DEL TRABAJO
  function esAsesorDelTrabajo(docente) {
    return (
      normalizarNombre(docente.nombre) ===
      normalizarNombre(trabajoActual.asesor)
    );
  }

  // DOCENTES ELEGIBLES PARA LA SELECCIÓN INICIAL
  const docentesElegibles = docentes.filter(
    (docente) =>
      !esAsesorDelTrabajo(docente) &&
      !docente.conflicto
  );

  // TRES JURADOS INICIALES
  const [seleccionados, setSeleccionados] = useState(() =>
    docentesElegibles
      .slice(0, 3)
      .map((docente) => docente.id)
  );

  // PRESIDENTE INICIAL: DEBE SER DOCTOR
  const [presidenteId, setPresidenteId] = useState(() => {
    const doctorInicial = docentesElegibles.find(
      (docente) => docente.grado === "doctor"
    );

    return doctorInicial?.id ?? null;
  });

  const [mensaje, setMensaje] = useState(null);
  const [docenteConflicto, setDocenteConflicto] =
    useState(null);
  const [confirmado, setConfirmado] = useState(false);

  // DATOS DE LA SUSTENTACIÓN
  const fecha = sustentacion?.fecha || "2026-12-11";
  const hora = sustentacion?.hora || "10:00";
  const sala = sustentacion?.sala || "A-402";

  const fechaVisible = fecha
    .split("-")
    .reverse()
    .join("/");

  // MIEMBROS ACTUALMENTE SELECCIONADOS
  const miembros = seleccionados
    .map((id) => docentes.find((d) => d.id === id))
    .filter(Boolean);

  // VALIDACIONES
  const cantidadDoctores = miembros.filter(
    (d) => d.grado === "doctor"
  ).length;

  const tieneExterno = miembros.some(
    (d) =>
      d.departamento !== trabajoEjemplo.departamento
  );

  const presidenteValido = miembros.some(
    (d) =>
      d.id === presidenteId &&
      d.grado === "doctor"
  );

  const tieneAsesor = miembros.some(
    (d) => esAsesorDelTrabajo(d)
  );

  const requisitosCumplidos =
    miembros.length === 3 &&
    cantidadDoctores >= 1 &&
    tieneExterno &&
    presidenteValido &&
    !tieneAsesor;

  // AGREGAR DOCENTE
  function agregarDocente(
    docente,
    aceptoConflicto = false
  ) {
    if (esAsesorDelTrabajo(docente)) {
      setMensaje({
        tipo: "error",
        texto:
          "El asesor del trabajo no puede integrar el jurado.",
      });
      return;
    }

    if (seleccionados.includes(docente.id)) {
      return;
    }

    if (seleccionados.length >= 3) {
      setMensaje({
        tipo: "error",
        texto:
          "El jurado ya tiene 3 miembros. Retira uno antes de agregar otro.",
      });
      return;
    }

    if (docente.conflicto && !aceptoConflicto) {
      setDocenteConflicto(docente);
      return;
    }

    setSeleccionados((actuales) => [
      ...actuales,
      docente.id,
    ]);

    setDocenteConflicto(null);
    setMensaje(null);
    setConfirmado(false);
  }

  // QUITAR DOCENTE
  function quitarDocente(id) {
    const nuevos = seleccionados.filter(
      (item) => item !== id
    );

    setSeleccionados(nuevos);

    if (presidenteId === id) {
      const nuevoPresidente = docentes.find(
        (d) =>
          nuevos.includes(d.id) &&
          d.grado === "doctor"
      );

      setPresidenteId(
        nuevoPresidente?.id ?? null
      );
    }

    setConfirmado(false);
    setMensaje(null);
  }

  // DESIGNAR PRESIDENTE
  function designarPresidente(docente) {
    if (!seleccionados.includes(docente.id)) {
      return;
    }

    if (docente.grado !== "doctor") {
      setMensaje({
        tipo: "error",
        texto:
          "El presidente del jurado debe tener grado de doctor.",
      });
      return;
    }

    setPresidenteId(docente.id);
    setMensaje(null);
    setConfirmado(false);
  }

  // CONFIRMAR JURADO
  function confirmarJurado() {
    if (!requisitosCumplidos) {
      setMensaje({
        tipo: "error",
        texto:
          "El jurado necesita 3 miembros, al menos un doctor, un docente de otro departamento, un presidente con grado de doctor y no puede incluir al asesor.",
      });
      return;
    }

    setConfirmado(true);

    setMensaje({
      tipo: "exito",
      texto:
        "El jurado se confirmó correctamente (simulación).",
    });

    onIrActa?.({
      seleccionados,
      presidenteId,
    });
  }

  return (
    <div className="jurado-page">

      {/* CABECERA */}
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
            <span>Sustentación</span>

            <strong>
              {fechaVisible} · {hora} · {sala}
            </strong>
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

      {/* MENÚ SUPERIOR */}
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
            className="nav-activo"
            href="#sustentaciones"
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
            Paso 2 de 3 · jurado
          </span>

          <a href="#salir">
            Cerrar sesión
          </a>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="jurado-contenido">

        <div className="jurado-introduccion">
          <div className="breadcrumb">
            Sustentaciones · {fechaVisible} ·
            {hora} · {sala} · Conformar jurado
          </div>

          <h1>
            Conformación del jurado
          </h1>

          <p>
            {trabajoEjemplo.titulo}
          </p>
        </div>

        {/* AVISO DE CONFLICTO */}
        <div className="jurado-alerta">
          <span className="jurado-alerta-icono">
            !
          </span>

          <span>
            {trabajoActual.asesor} es el asesor
            del trabajo: no puede integrar
            el jurado. La Dra. Gabriela Torres
            Anchante dictó clases al equipo
            en 2026-1; revisa el posible
            conflicto antes de agregarla.
          </span>
        </div>

        <div className="jurado-distribucion">

          {/* DOCENTES DISPONIBLES */}
          <section className="jurado-docentes">

            <div className="jurado-tabla-header">
              <strong>
                DOCENTES DISPONIBLES
              </strong>

              <span>
                Ordenados por carga de jurados del ciclo
              </span>
            </div>

            <div className="jurado-lista">

              {docentes.map((docente) => {
                const agregado =
                  seleccionados.includes(docente.id);

                const esAsesor =
                  esAsesorDelTrabajo(docente);

                return (
                  <div
                    key={docente.id}
                    className={[
                      "jurado-docente",
                      docente.conflicto
                        ? "docente-conflicto"
                        : "",
                      esAsesor
                        ? "docente-asesor"
                        : "",
                    ].join(" ")}
                  >

                    <div className="jurado-docente-info">

                      <strong>
                        {docente.nombre}
                      </strong>

                      {esAsesor ? (
                        <small className="texto-restriccion">
                          Asesor del trabajo · no elegible
                          por reglamento
                        </small>
                      ) : docente.conflicto ? (
                        <small className="texto-conflicto">
                          Posible conflicto: dictó
                          clases al equipo en 2026-1
                        </small>
                      ) : (
                        <small>
                          {docente.departamento} ·{" "}
                          {docente.jurados}{" "}
                          {docente.jurados === 1
                            ? "jurado"
                            : "jurados"}{" "}
                          este ciclo · {docente.grado}
                        </small>
                      )}

                    </div>

                    <div className="jurado-docente-accion">

                      {esAsesor ? (
                        <button
                          type="button"
                          disabled
                          className="btn-no-disponible"
                        >
                          No disponible
                        </button>
                      ) : agregado ? (
                        <button
                          type="button"
                          disabled
                          className="btn-agregado"
                        >
                          {docente.grado === "magíster"
                            ? "Agregada"
                            : "Agregado"}
                        </button>
                      ) : docente.conflicto ? (
                        <button
                          type="button"
                          className="btn-conflicto"
                          onClick={() =>
                            agregarDocente(docente)
                          }
                        >
                          Agregar de todos modos
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-agregar"
                          onClick={() =>
                            agregarDocente(docente)
                          }
                        >
                          Agregar
                        </button>
                      )}

                    </div>
                  </div>
                );
              })}

            </div>

            <div className="jurado-nota">
              El jurado se compone de 3 miembros;
              al menos uno debe tener grado de
              doctor y uno debe pertenecer a un
              departamento distinto al del trabajo.
            </div>

          </section>

          {/* JURADO SELECCIONADO */}
          <aside className="jurado-panel">

            <div className="jurado-panel-header">
              <strong>
                JURADO SELECCIONADO
              </strong>

              <span>
                {miembros.length} de 3
              </span>
            </div>

            <div className="jurado-miembros">

              {miembros.map((docente) => (
                <div
                  key={docente.id}
                  className={
                    presidenteId === docente.id
                      ? "jurado-miembro presidente"
                      : "jurado-miembro"
                  }
                >

                  <div className="jurado-miembro-superior">
                    <strong>
                      {docente.nombre}
                    </strong>

                    {presidenteId === docente.id ? (
                      <span className="etiqueta-presidente">
                        Presidente
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="quitar-miembro"
                        onClick={() =>
                          quitarDocente(docente.id)
                        }
                      >
                        Quitar
                      </button>
                    )}
                  </div>

                  <div className="jurado-miembro-inferior">
                    <small>
                      {docente.departamento} ·
                      {docente.grado}
                    </small>

                    {presidenteId !== docente.id && (
                      <button
                        type="button"
                        onClick={() =>
                          designarPresidente(docente)
                        }
                      >
                        Designar presidente
                      </button>
                    )}

                  </div>
                </div>
              ))}

              {miembros.length === 0 && (
                <div className="jurado-vacio">
                  Aún no has seleccionado docentes.
                </div>
              )}

            </div>

            {/* RESUMEN DE REQUISITOS */}
            <div className="jurado-requisitos">

              {requisitosCumplidos
                ? "Requisitos cumplidos: 3 miembros · 1 doctor · 1 docente de otro departamento · presidente válido."
                : `${miembros.length} de 3 miembros · ${cantidadDoctores} doctores · ${
                    tieneExterno
                      ? "Incluye otro departamento"
                      : "Falta otro departamento"
                  } · ${
                    presidenteValido
                      ? "Presidente válido"
                      : "Falta presidente doctor"
                  }.`}

            </div>

            {/* MENSAJES */}
            {mensaje && (
              <div
                role="alert"
                className={
                  mensaje.tipo === "error"
                    ? "jurado-mensaje error"
                    : "jurado-mensaje exito"
                }
              >
                {mensaje.texto}
              </div>
            )}

            {/* CONFIRMACIÓN */}
            <div className="jurado-panel-acciones">
              <button
                type="button"
                className="jurado-confirmar"
                onClick={confirmarJurado}
                disabled={confirmado}
              >
                {confirmado
                  ? "Jurado confirmado"
                  : "Confirmar jurado"}
              </button>

              <small>
                Se notificará a los tres miembros,
                al equipo y al asesor
              </small>
            </div>

          </aside>
        </div>

        {/* VOLVER A 6.1 */}
        {onVolver && (
          <button
            type="button"
            className="jurado-volver"
            onClick={onVolver}
          >
            ← Volver a programar sustentación
          </button>
        )}

      </main>

      {/* FOOTER */}
      <footer className="footer">
        <span>
          Sesión iniciada como Carmen Rosa Velásquez
          Ayala · rol Administrador · TFC-2026-2-012
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

      {/* MODAL DE CONFLICTO DE INTERÉS */}
      {docenteConflicto && (
        <div className="jurado-modal-fondo">
          <div
            className="jurado-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-conflicto"
          >

            <h2 id="titulo-conflicto">
              Posible conflicto de interés
            </h2>

            <p>
              {docenteConflicto.nombre} dictó
              clases al equipo durante el
              periodo 2026-1.
            </p>

            <p>
              Revisa esta situación antes de
              agregar al docente al jurado.
              La autorización en esta pantalla
              es simulada.
            </p>

            <div className="jurado-modal-botones">

              <button
                type="button"
                onClick={() =>
                  setDocenteConflicto(null)
                }
              >
                Cancelar
              </button>

              <button
                type="button"
                className="jurado-confirmar"
                onClick={() =>
                  agregarDocente(
                    docenteConflicto,
                    true
                  )
                }
              >
                Agregar de todos modos
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

