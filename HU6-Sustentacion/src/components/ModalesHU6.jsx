
import "../ModalesHU6.css";

// MODAL 6.1: SALA OCUPADA
export function ModalSalaOcupada({
  fecha = "11/12/2026",
  hora = "11:00",
  sala = "A-402",
  conflicto = "Clasificación automática de reclamos ciudadanos en municipalidades distritales",
  alternativas = [],
  onElegir,
  onCerrar,
}) {
  return (
    <div className="hu6-overlay" onClick={onCerrar}>
      <section
        className="hu6-modal hu6-modal-sala"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hu6-titulo-sala"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="hu6-titulo-sala">
          La sala ya está ocupada
        </h2>

        <div className="hu6-error-ocupacion">
          <span className="hu6-error-icono">!</span>
          <span>
            La sala {sala} está ocupada el {fecha} de
            {" "}{hora} a {
              `${String(Number(hora.slice(0, 2)) + 1).padStart(2, "0")}:${hora.slice(3)}`
            } por «{conflicto}».
          </span>
        </div>

        <div className="hu6-alternativas">
          <h3>ALTERNATIVAS DISPONIBLES</h3>

          {alternativas.length === 0 ? (
            <p>No se encontraron alternativas disponibles.</p>
          ) : (
            alternativas.map((opcion, indice) => (
              <div className="hu6-alternativa" key={indice}>
                <span>
                  {opcion.sala} · {opcion.fecha} · {opcion.hora}
                </span>
                <button
                  type="button"
                  onClick={() => onElegir(opcion)}
                >
                  Usar
                </button>
              </div>
            ))
          )}
        </div>

        <div className="hu6-acciones">
          <button
            type="button"
            className="hu6-boton-texto"
            onClick={onCerrar}
          >
            Cambiar datos
          </button>

          <button type="button" className="hu6-boton-inactivo" disabled>
            Programar
          </button>
        </div>
      </section>
    </div>
  );
}

// MODAL 6.3: REGISTRAR ACTA
export function ModalRegistrarActa({
  resultado = "Aprobado",
  nota = 17,
  onCancelar,
  onConfirmar,
}) {
  return (
    <div className="hu6-overlay" onClick={onCancelar}>
      <section
        className="hu6-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hu6-titulo-acta"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="hu6-titulo-acta">Registrar el acta</h2>

        <div className="hu6-resumen-acta">
          <div>
            <span>RESULTADO</span>
            <strong>{resultado}</strong>
          </div>

          <div className="hu6-nota-acta">
            <span>NOTA FINAL</span>
            <strong>{nota}</strong>
          </div>
        </div>

        <div className="hu6-advertencia-acta">
          El acta queda definitiva: se notifica al equipo,
          al asesor y a la Secretaría Académica.
          Solo Secretaría puede rectificarla después.
        </div>

        <div className="hu6-acciones">
          <button
            type="button"
            className="hu6-boton-texto"
            onClick={onCancelar}
          >
            Revisar de nuevo
          </button>

          <button
            type="button"
            className="hu6-boton-principal"
            onClick={onConfirmar}
          >
            Registrar acta
          </button>
        </div>
      </section>
    </div>
  );
}

// ESTADO 6.4: SIN SUSTENTACIÓN
export function SinSustentacion({ onRequisitos }) {
  return (
    <section className="hu6-sin-sustentacion">
      <div className="hu6-icono-calendario">▤</div>

      <h2>Aún no tienes fecha de sustentación</h2>

      <p>
        La coordinación programa las sustentaciones de
        los trabajos concluidos entre el 07/12 y el
        19/12/2026. Te avisaremos por correo con la
        fecha, hora, sala y jurado.
      </p>

      <button type="button" onClick={onRequisitos}>
        Ver requisitos de sustentación
      </button>
    </section>
  );
}
