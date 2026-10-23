
import { useState } from "react";
import { docentes } from "../data/docentes";
import { trabajos } from "../data/sustentaciones";
import "../MiSustentacion.css";
import "../ResultadoSustentacion.css";

const criterios = [
  { id: "rigor", nombre: "Rigor metodológico", peso: 30 },
  { id: "resultados", nombre: "Resultados y análisis", peso: 30 },
  { id: "informe", nombre: "Calidad del informe", peso: 20 },
  { id: "defensa", nombre: "Exposición y defensa", peso: 20 },
];


function formatearFecha(fecha) {
  if (!fecha) return "11/12/2026";
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

export default function ResultadoSustentacion({
  sustentacion,
  jurado,
  onVolver,
  onVerActa,
}) {
  const [aviso, setAviso] = useState("");

  const trabajo =
    trabajos.find(t => t.id === sustentacion?.trabajoId) ||
    trabajos[0];

  const acta = (() => {
    try {
      const clave =
        `hu6-acta-registrada-${sustentacion?.id || 1}`;
      const guardado = localStorage.getItem(clave);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  })();

  
if (!acta || !acta.notas || !acta.resultado) {
  return (
    <div
      className="mi-sustentacion-pagina"
      style={{
        minHeight: "100vh",
        padding: "60px 24px",
        textAlign: "center",
      }}
    >
      <h2>Resultado no disponible</h2>

      <p>
        Todavía no existe un acta de sustentación
        registrada para este trabajo.
      </p>

      <button
        type="button"
        onClick={onVolver}
      >
        ← Volver a Mi sustentación
      </button>
    </div>
  );
}

const notas = acta.notas;
const resultado = acta.resultado;
const observaciones = acta.observaciones ?? "";


  const promedio = criterios.reduce(
    (total, c) => total + Number(notas[c.id]) * c.peso / 100,
    0
  );

  const notaFinal = Math.round(promedio);

  const fecha = formatearFecha(
    sustentacion?.fecha || "2026-12-11"
  );
  const sala = sustentacion?.sala || "A-402";

  const idsJurado =
    acta?.juradoIds || jurado?.seleccionados || [1, 2, 3];

  const presidenteId =
    acta?.presidenteId || jurado?.presidenteId || 1;

  const miembros = idsJurado
    .map(id => docentes.find(d => d.id === id))
    .filter(Boolean);

  function descargarInforme() {
    setAviso(
      "El informe final todavía es un documento simulado. Se incorporará el enlace correspondiente cuando se integre con la HU4."
    );
  }

  function descargarActa() {
  setAviso("");
  onVerActa?.();
}

  return (
    <div className="mi-sustentacion-pagina resultado-pagina">

      {/* CABECERA DEL ESTUDIANTE */}
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
            <strong className="resultado-sustentado">
              Sustentado
            </strong>
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
          <a className="mi-nav-activo" href="#sustentacion">
            Mi sustentación
          </a>
          <a href="#cuenta">Mi cuenta</a>
        </div>

        <div className="mi-nav-derecha">
          <span>Proceso cerrado</span>
          <a href="#salir">Cerrar sesión</a>
        </div>
      </nav>

      {/* CONTENIDO */}
      <main className="resultado-contenido">
        <div className="resultado-introduccion">
          <div className="mi-breadcrumb">
            Mi trabajo · Mi sustentación
          </div>

          <h1>Mi sustentación</h1>

          <p>
            Realizada el {fecha} · acta registrada por la
            coordinación el {fecha} a las 12:20
          </p>
        </div>

        <div className="resultado-columnas">

          {/* COLUMNA IZQUIERDA */}
          <div className="resultado-principal">

            {/* RESULTADO FINAL */}
            <section className="resultado-tarjeta">
              <div className="resultado-estado">
                <span className="resultado-etiqueta">
                  RESULTADO DEL JURADO
                </span>
                <h2>{resultado}</h2>
                <p>
                  Por unanimidad · {fecha} · Sala {sala}
                </p>
              </div>

              <div className="resultado-calificacion-final">
                <span>NOTA FINAL</span>
                <strong>{notaFinal}</strong>
              </div>
            </section>

            {/* DETALLE DE CALIFICACIONES */}
            <section className="resultado-detalle">
              <h2>Detalle de la calificación</h2>

              <div className="resultado-tabla-cabecera">
                <span>CRITERIO</span>
                <span>PESO</span>
                <span>NOTA</span>
              </div>

              {criterios.map(criterio => (
                <div
                  className="resultado-tabla-fila"
                  key={criterio.id}
                >
                  <span>{criterio.nombre}</span>
                  <span>{criterio.peso}%</span>
                  <strong>{notas[criterio.id]}</strong>
                </div>
              ))}

              <div className="resultado-observaciones">
                <h3>OBSERVACIONES DEL JURADO</h3>
                <div className="resultado-comentario">
                  {observaciones || "Sin observaciones."}
                </div>
              </div>
            </section>
          </div>

          {/* COLUMNA DERECHA */}
          <aside className="resultado-sidebar">

            {/* DOCUMENTOS */}
            <section className="resultado-panel">
              <h3>DOCUMENTOS</h3>

              <div className="resultado-botones">
                <button
                  type="button"
                  className="resultado-btn-principal"
                  onClick={descargarActa}
                >
                  Descargar acta firmada (PDF)
                </button>

                <button
                  type="button"
                  className="resultado-btn-secundario"
                  onClick={descargarInforme}
                >
                  Descargar informe final
                </button>

                <button
                  type="button"
                  className="resultado-btn-simple"
                  onClick={() =>
                    setAviso(
                      "La ficha completa del trabajo corresponde a la HU2 y se conectará durante la integración."
                    )
                  }
                >
                  Ver mi trabajo
                </button>
              </div>

              {aviso && (
                <p className="resultado-aviso" role="status">
                  {aviso}
                </p>
              )}
            </section>

            {/* JURADO */}
            <section className="resultado-panel">
              <h3>JURADO</h3>

              <div className="resultado-lista-jurado">
                {miembros.map(docente => (
                  <div
                    className="resultado-miembro"
                    key={docente.id}
                  >
                    <span>{docente.nombre}</span>

                    {docente.id === presidenteId && (
                      <span className="resultado-presidente">
                        Presidente
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* SIGUIENTE PASO */}
            <section className="resultado-siguiente">
              <strong>Siguiente paso</strong>
              <p>
                Con el acta aprobada puedes iniciar el
                trámite de bachillerato en la Secretaría
                Académica.
              </p>
            </section>
          </aside>
        </div>

        {onVolver && (
          <button
            className="resultado-volver"
            onClick={onVolver}
          >
            ← Volver a mi sustentación
          </button>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mi-footer">
        <span>
          Sesión iniciada como Diana Carolina Rojas Tito ·
          rol Estudiante · TFC-2026-2-012 sustentado
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
    </div>
  );
}
