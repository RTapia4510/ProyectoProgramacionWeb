
import { useState } from "react";
import { docentes } from "../data/docentes";
import { trabajos } from "../data/sustentaciones";
import { ModalRegistrarActa } from "../components/ModalesHU6";
import "../Acta.css";

const criterios = [
  { id: "rigor", nombre: "Rigor metodológico", peso: 30 },
  { id: "resultados", nombre: "Resultados y análisis", peso: 30 },
  { id: "informe", nombre: "Calidad del informe", peso: 20 },
  { id: "defensa", nombre: "Exposición y defensa", peso: 20 },
];

const notasIniciales = {
  rigor: "17",
  resultados: "16",
  informe: "18",
  defensa: "17",
};

const observacionesIniciales =
  "Se recomienda publicar los resultados en el repositorio institucional y ampliar la validación a dos distritos adicionales.";

function formatearFecha(fecha) {
  if (!fecha) return "11/12/2026";

  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

function leerGuardado(clave) {
  try {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : null;
  } catch {
    return null;
  }
}

export default function ActaSustentacion({
  sustentacion,
  jurado,
  onVolver,
  onIrEstudiante,
  onVerActa,
}) {
  const trabajo =
    trabajos.find(
      (t) => t.id === sustentacion?.trabajoId
    ) || trabajos[0];

  const fecha = formatearFecha(
    sustentacion?.fecha || "2026-12-11"
  );

  const hora = sustentacion?.hora || "10:00";
  const sala = sustentacion?.sala || "A-402";
  const modalidad = sustentacion?.modalidad || "Presencial";

  const idSustentacion = sustentacion?.id || 1;

  const claveBorrador = `hu6-acta-${idSustentacion}`;
  const claveRegistrada =
    `hu6-acta-registrada-${idSustentacion}`;

  const [datosIniciales] = useState(() => {
    return (
      leerGuardado(claveRegistrada) ||
      leerGuardado(claveBorrador)
    );
  });

  const [notas, setNotas] = useState(
    datosIniciales?.notas || notasIniciales
  );

  const [resultado, setResultado] = useState(
    datosIniciales?.resultado || "Aprobado"
  );

  const [observaciones, setObservaciones] = useState(
    datosIniciales?.observaciones ?? observacionesIniciales
  );

  const [registrada, setRegistrada] = useState(
    () => Boolean(leerGuardado(claveRegistrada))
  );

  const [mostrarConfirmacion, setMostrarConfirmacion] =
    useState(false);

  const [mensaje, setMensaje] = useState(null);

  const miembrosIds =
    datosIniciales?.juradoIds ||
    jurado?.seleccionados ||
    [1, 2, 3];

  const presidenteId =
    datosIniciales?.presidenteId ||
    jurado?.presidenteId ||
    1;

  const miembros = miembrosIds
    .map((id) => docentes.find((d) => d.id === id))
    .filter(Boolean);

  // VALIDAR NOTAS
  const notasValidas = criterios.every((criterio) => {
    const valor = notas[criterio.id];

    return (
      valor !== "" &&
      valor !== undefined &&
      Number.isFinite(Number(valor)) &&
      Number(valor) >= 0 &&
      Number(valor) <= 20
    );
  });

  // CALCULAR PROMEDIO PONDERADO
  const promedio = notasValidas
    ? criterios.reduce(
        (total, criterio) =>
          total +
          Number(notas[criterio.id]) *
            (criterio.peso / 100),
        0
      )
    : null;

  // NOTA REDONDEADA PARA EL MOCKUP
  const notaFinal =
    promedio === null
      ? "—"
      : String(Math.round(promedio));

  function cambiarNota(id, valor) {
    if (registrada) return;

    setNotas((anteriores) => ({
      ...anteriores,
      [id]: valor,
    }));

    setMensaje(null);
  }

  function obtenerDatosActa() {
    return {
      sustentacionId: idSustentacion,
      trabajoId: trabajo.id,
      notas,
      promedio,
      notaFinal,
      resultado,
      observaciones,
      juradoIds: miembrosIds,
      presidenteId,
      fecha,
      hora,
      sala,
      modalidad,
    };
  }

  // GUARDAR BORRADOR
  function guardarBorrador() {
    if (registrada) return;

    localStorage.setItem(
      claveBorrador,
      JSON.stringify(obtenerDatosActa())
    );

    setMensaje({
      tipo: "exito",
      texto: "Borrador del acta guardado correctamente.",
    });
  }

  // ABRIR MODAL DE CONFIRMACIÓN
  function prepararRegistro() {
    if (registrada) return;

    if (!notasValidas) {
      setMensaje({
        tipo: "error",
        texto:
          "Todas las notas deben ser valores entre 0 y 20.",
      });
      return;
    }

    if (
      resultado === "Aprobado con observaciones" &&
      !observaciones.trim()
    ) {
      setMensaje({
        tipo: "error",
        texto:
          "Debes ingresar las observaciones del jurado.",
      });
      return;
    }

    setMostrarConfirmacion(true);
  }

  // CONFIRMAR REGISTRO
  function registrarActa() {
    if (registrada || !notasValidas) return;

    const acta = {
      ...obtenerDatosActa(),
      registrada: true,
    };

    localStorage.setItem(
      claveRegistrada,
      JSON.stringify(acta)
    );

    localStorage.removeItem(claveBorrador);

    setRegistrada(true);
    setMostrarConfirmacion(false);

    setMensaje({
      tipo: "exito",
      texto:
        "Acta registrada correctamente. Ya no puede modificarse desde esta pantalla.",
    });
  }

  return (
    <div className="acta-pagina">

      {/* HEADER */}
      <header className="header">
        <div className="marca">
          <div className="marca-icono">TF</div>

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
            <span>Acta</span>
            <strong>TFC-2026-2-012</strong>
          </div>

          <span className="rol-admin">
            Administrador
          </span>

          <div className="usuario-avatar">CV</div>

          <div className="usuario-textos">
            <strong>Carmen Velásquez Ayala</strong>
            <small>Coordinación TFC</small>
          </div>
        </div>
      </header>

      {/* NAVEGACIÓN */}
      <nav className="navbar">
        <div className="nav-links">
          <a href="#tablero">Tablero</a>
          <a href="#trabajos">Trabajos</a>
          <a href="#carga">Carga por asesor</a>

          <a
            href="#sustentaciones"
            className="nav-activo"
          >
            Sustentaciones
          </a>

          <a href="#usuarios">Usuarios</a>
          <a href="#cuenta">Mi cuenta</a>
        </div>

        <div className="nav-final">
          <span>Paso 3 de 3 · acta</span>
          <a href="#salir">Cerrar sesión</a>
        </div>
      </nav>

      {/* CONTENIDO */}
      <main className="acta-contenido">

        <div className="acta-encabezado">
          <div>
            <div className="breadcrumb">
              Sustentaciones · Acta
            </div>

            <h1>Acta de sustentación</h1>

            <p>
              {fecha} · {hora} · Sala {sala} ·{" "}
              {modalidad.toLowerCase()} · {trabajo.titulo}
            </p>
          </div>

          <button
            type="button"
            className="acta-boton-impresion"
            onClick={onVerActa}
          >
            Ver vista de impresión
          </button>
        </div>

        <div className="acta-columnas">

          {/* FORMULARIO */}
          <section className="acta-formulario">

            <h2>Calificación por criterios</h2>

            <div className="acta-tabla">

              <div className="acta-tabla-cabecera">
                <span>CRITERIO</span>
                <span>PESO</span>
                <span>NOTA (0–20)</span>
              </div>

              {criterios.map((criterio) => (
                <div
                  className="acta-tabla-fila"
                  key={criterio.id}
                >
                  <span>{criterio.nombre}</span>

                  <span>{criterio.peso}%</span>

                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={notas[criterio.id]}
                    disabled={registrada}
                    onChange={(e) =>
                      cambiarNota(
                        criterio.id,
                        e.target.value
                      )
                    }
                    aria-label={`Nota de ${criterio.nombre}`}
                  />
                </div>
              ))}
            </div>

            {/* PROMEDIO */}
            <div className="acta-promedio">
              <strong>Nota final ponderada</strong>

              <strong className="acta-nota-final">
                {notaFinal}
              </strong>
            </div>

            {/* RESULTADO */}
            <div className="acta-seccion">
              <label>RESULTADO</label>

              <div className="acta-resultados">
                {[
                  "Aprobado",
                  "Aprobado con observaciones",
                  "Desaprobado",
                ].map((opcion) => (
                  <button
                    type="button"
                    key={opcion}
                    disabled={registrada}
                    className={
                      resultado === opcion
                        ? "acta-resultado activo"
                        : "acta-resultado"
                    }
                    onClick={() =>
                      setResultado(opcion)
                    }
                  >
                    {opcion}
                  </button>
                ))}
              </div>
            </div>

            {/* OBSERVACIONES */}
            <div className="acta-seccion">
              <label htmlFor="observaciones-acta">
                OBSERVACIONES DEL JURADO
              </label>

              <textarea
                id="observaciones-acta"
                rows="3"
                value={observaciones}
                disabled={registrada}
                onChange={(e) =>
                  setObservaciones(e.target.value)
                }
              />
            </div>

            {/* MENSAJES */}
            {mensaje && (
              <div
                role="status"
                className={
                  mensaje.tipo === "exito"
                    ? "acta-mensaje exito"
                    : "acta-mensaje error"
                }
              >
                {mensaje.texto}
              </div>
            )}

            {/* BOTONES */}
            <div className="acta-acciones">
              <button
                type="button"
                className="acta-borrador"
                disabled={registrada}
                onClick={guardarBorrador}
              >
                Guardar borrador
              </button>

              <button
                type="button"
                className="acta-registrar"
                disabled={registrada}
                onClick={prepararRegistro}
              >
                {registrada
                  ? "Acta registrada"
                  : "Registrar acta"}
              </button>
            </div>
          </section>

          {/* PANEL DERECHO */}
          <aside className="acta-sidebar">

            <section className="acta-panel">
              <h3>JURADO QUE FIRMA</h3>

              {miembros.map((docente) => (
                <div
                  className="acta-jurado-fila"
                  key={docente.id}
                >
                  <span>{docente.nombre}</span>

                  {docente.id === presidenteId && (
                    <span className="acta-presidente">
                      Presidente
                    </span>
                  )}
                </div>
              ))}
            </section>

            <section className="acta-panel">
              <h3>DATOS DEL TRABAJO</h3>

              <div className="acta-datos">
                <p>
                  <strong>Equipo</strong>{" "}
                  Diana Rojas Tito · Jorge Tapia Bendezú
                </p>

                <p>
                  <strong>Asesor</strong>{" "}
                  {trabajo.asesor}
                </p>

                <p>
                  <strong>Línea</strong>{" "}
                  Gestión de operaciones
                </p>

                <p>
                  <strong>Avance del plan</strong>{" "}
                  100% · 5 de 5 aprobados
                </p>
              </div>
            </section>

            <section className="acta-aviso">
              <strong>El acta es definitiva</strong>

              <p>
                Una vez registrada, solo la Secretaría
                Académica puede rectificarla.
                El estudiante verá el resultado y podrá
                descargar el acta firmada.
              </p>
            </section>
          </aside>
        </div>

        {/* NAVEGACIÓN ENTRE PANTALLAS */}
        <div className="acta-navegacion-inferior">
          {onVolver && (
            <button
              type="button"
              className="acta-volver"
              onClick={onVolver}
            >
              ← Volver a conformación del jurado
            </button>
          )}

          {onIrEstudiante && (
            <button
              type="button"
              className="acta-registrar"
              onClick={onIrEstudiante}
            >
              Ver pantalla del estudiante →
            </button>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <span>
          Sesión iniciada como Carmen Rosa Velásquez Ayala
          · rol Administrador ·{" "}
          {registrada
            ? "acta registrada"
            : "acta en borrador"}
        </span>

        <div className="footer-links">
          <a href="mailto:tfc@ulima.edu.pe">
            Reglamento TFC
          </a>

          <a href="mailto:tfc@ulima.edu.pe">
            tfc@ulima.edu.pe
          </a>

          <span>© 2026 Universidad de Lima</span>
        </div>
      </footer>

      {/* NUEVO MODAL DE LA PÁGINA 47 */}
      {mostrarConfirmacion && (
        <ModalRegistrarActa
          resultado={resultado}
          nota={notaFinal}
          onCancelar={() =>
            setMostrarConfirmacion(false)
          }
          onConfirmar={registrarActa}
        />
      )}
    </div>
  );
}
