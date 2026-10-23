
import { useState } from "react";
import { docentes } from "../data/docentes";
import { trabajos } from "../data/sustentaciones";
import { SinSustentacion } from "../components/ModalesHU6";
import "../MiSustentacion.css";

function formatearFecha(fecha) {
  if (!fecha) return "11/12/2026";
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

function diaSemana(fecha) {
  if (!fecha) return "Viernes";

  const [anio, mes, dia] = fecha.split("-").map(Number);

  const nombre = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(anio, mes - 1, dia)));

  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

export default function MiSustentacion({
  sustentacion,
  jurado,
  onVolver,
  onVerResultado,
}) {
  // ESTADO TEMPORAL PARA PROBAR EL MOCKUP SIN FECHA
  const [mostrarRequisitos, setMostrarRequisitos] = useState(false);

  // SE MOSTRARÁ AUTOMÁTICAMENTE SI NO EXISTE SUSTENTACIÓN
  const sinFecha = !sustentacion;

  const trabajo =
    trabajos.find(
      (t) => t.id === sustentacion?.trabajoId
    ) || trabajos[0];

  const fecha = sustentacion?.fecha || "2026-12-11";
  const hora = sustentacion?.hora || "10:00";
  const sala = sustentacion?.sala || "A-402";
  const modalidad = sustentacion?.modalidad || "Presencial";

  const miembrosIds = jurado?.seleccionados || [1, 2, 3];
  const presidenteId = jurado?.presidenteId || 1;

  const miembros = miembrosIds
    .map((id) => docentes.find((d) => d.id === id))
    .filter(Boolean);

  const fechaProgramacion = "30/11/2026";

  let actaGuardada = null;

  try {
    const clave = `hu6-acta-registrada-${sustentacion?.id || 1}`;
    const guardado = localStorage.getItem(clave);

    if (guardado) {
      actaGuardada = JSON.parse(guardado);
    }
  } catch {
    actaGuardada = null;
  }

  return (
    <div className="mi-sustentacion-pagina">

      {/* CABECERA */}
      <header className="mi-header">
        <div className="mi-marca">
          <div className="mi-logo">TF</div>

          <div>
            <h2>Trabajos de Fin de Carrera</h2>
            <p>Universidad de Lima · Facultad de Ingeniería</p>
          </div>
        </div>

        <div className="mi-header-derecha">
          <div className="mi-trabajo-activo">
            <span>{trabajo.titulo}</span>

            <div className="mi-mini-progreso">
              <div />
            </div>

            <strong>100%</strong>
          </div>

          <span className="mi-rol">Estudiante</span>

          <div className="mi-avatar">DR</div>

          <div className="mi-usuario">
            <strong>Diana Rojas Tito</strong>
            <small>20210466 · Ing. Industrial</small>
          </div>
        </div>
      </header>

      {/* NAVEGACIÓN */}
      <nav className="mi-navbar">
        <div className="mi-nav-enlaces">
          <a href="#mi-trabajo">Mi trabajo</a>
          <a href="#entregables">Entregables</a>
          <a href="#retroalimentacion">Retroalimentación</a>
          <a href="#asesores">Directorio de asesores</a>

          <a className="mi-nav-activo" href="#mi-sustentacion">
            Mi sustentación
          </a>

          <a href="#cuenta">Mi cuenta</a>
        </div>

        <div className="mi-nav-derecha">
          <span>Etapa 5 de 5 · sustentaciones</span>
          <a href="#salir">Cerrar sesión</a>
        </div>
      </nav>

      {/* CONTENIDO */}
      <main className="mi-contenido">

        <div className="mi-introduccion">
          <div className="mi-breadcrumb">
            Mi trabajo · Mi sustentación
          </div>

          <h1>Mi sustentación</h1>

          {!sinFecha && (
            <p>
              Programada por la coordinación el {fechaProgramacion}
            </p>
          )}
        </div>

        {/* CONDICIÓN PARA MOSTRAR EL ESTADO VACÍO */}
        {sinFecha ? (

          <SinSustentacion
            onRequisitos={() => setMostrarRequisitos(true)}
          />

        ) : (

          <div className="mi-distribucion">

            {/* COLUMNA IZQUIERDA */}
            <div className="mi-columna-principal">

              {/* TARJETA DE FECHA */}
              <section className="mi-tarjeta-fecha">
                <div className="mi-fecha-superior">
                  <span className="mi-estado-programada">
                    Programada
                  </span>

                  <span>
                    Modalidad {modalidad.toLowerCase()}
                  </span>
                </div>

                <div className="mi-datos-fecha">
                  <div>
                    <span className="mi-etiqueta">FECHA</span>
                    <strong>{formatearFecha(fecha)}</strong>
                    <small>{diaSemana(fecha)}</small>
                  </div>

                  <div>
                    <span className="mi-etiqueta">HORA</span>
                    <strong>{hora}</strong>
                    <small>Duración estimada 60 min</small>
                  </div>

                  <div>
                    <span className="mi-etiqueta">SALA</span>
                    <strong>{sala}</strong>
                    <small>
                      {sala.startsWith("A-")
                        ? "Pabellón A, cuarto piso"
                        : "Pabellón B"}
                    </small>
                  </div>
                </div>
              </section>

              {/* REQUISITOS */}
              <section className="mi-requisitos">
                <h2>Requisitos antes de la fecha</h2>

                <div className="mi-requisito">
                  <div className="mi-check completado">✓</div>

                  <div>
                    <strong>Informe final aprobado</strong>
                    <p>
                      Aprobado por el asesor el 24/11/2026
                    </p>
                  </div>
                </div>

                <div className="mi-requisito">
                  <div className="mi-check pendiente" />

                  <div>
                    <strong>Entrega del informe impreso</strong>

                    <p className="mi-texto-advertencia">
                      En la oficina TFC hasta el 04/12/2026
                      (5 días hábiles antes)
                    </p>
                  </div>
                </div>

                <div className="mi-requisito">
                  <div className="mi-check pendiente" />

                  <div>
                    <strong>Constancia de no adeudo</strong>
                    <p>
                      Se solicita en Tesorería y se adjunta
                      al expediente
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* COLUMNA DERECHA */}
            <aside className="mi-sidebar">

              {/* JURADO */}
              <section className="mi-panel mi-jurado">
                <h3>JURADO DESIGNADO</h3>

                <div className="mi-lista-jurado">
                  {miembros.map((docente) => (
                    <div
                      className="mi-jurado-miembro"
                      key={docente.id}
                    >
                      <div>
                        <strong>{docente.nombre}</strong>
                        <small>{docente.departamento}</small>
                      </div>

                      {docente.id === presidenteId && (
                        <span className="mi-presidente">
                          Presidente
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* EQUIPO */}
              <section className="mi-panel mi-equipo">
                <h3>EQUIPO Y ASESOR</h3>

                <p>Diana Rojas Tito · responsable</p>
                <p>Jorge Tapia Bendezú · integrante</p>

                <div className="mi-equipo-asesor">
                  {trabajo.asesor} · asesor
                </div>
              </section>

              {/* CAMBIOS DE FECHA */}
              <section className="mi-cambios">
                <h3>CAMBIOS DE FECHA</h3>

                <p>
                  Solo la coordinación puede reprogramar.
                  Si tienes un impedimento, escribe a
                  tfc@ulima.edu.pe con al menos 5 días
                  de anticipación.
                </p>
              </section>

              {/* RESULTADO DISPONIBLE */}
              {actaGuardada && (
                <section className="mi-panel mi-resultado-disponible">
                  <h3>RESULTADO DISPONIBLE</h3>

                  <p>
                    Tu acta de sustentación ya fue registrada.
                  </p>

                  <button
                    type="button"
                    onClick={onVerResultado}
                  >
                    Ver resultado
                  </button>
                </section>
              )}
            </aside>
          </div>
        )}

        {/* VOLVER */}
        {onVolver && (
          <button
            type="button"
            className="mi-enlace-volver"
            onClick={onVolver}
          >
            ← Volver a administración
          </button>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mi-footer">
        <span>
          Sesión iniciada como Diana Carolina Rojas Tito ·
          rol Estudiante · TFC-2026-2-012
        </span>

        <div>
          <a href="mailto:tfc@ulima.edu.pe">
            Reglamento TFC
          </a>

          <a href="mailto:tfc@ulima.edu.pe">
            tfc@ulima.edu.pe
          </a>

          <span>© 2026 Universidad de Lima</span>
        </div>
      </footer>

      {/* MODAL DE REQUISITOS */}
      {mostrarRequisitos && (
        <div
          className="hu6-overlay"
          onClick={() => setMostrarRequisitos(false)}
        >
          <div
            className="hu6-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-requisitos"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-requisitos">
              Requisitos de sustentación
            </h2>

            <p>
              Para solicitar una fecha de sustentación,
              el trabajo debe estar concluido y contar
              con el informe final aprobado.
            </p>

            <p>
              La coordinación programará la fecha,
              hora, sala y jurado correspondientes.
            </p>

            <div className="hu6-acciones">
              <button
                type="button"
                className="hu6-boton-principal"
                onClick={() => setMostrarRequisitos(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
