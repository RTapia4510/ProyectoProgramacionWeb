
import { docentes } from "../data/docentes";
import { trabajos } from "../data/sustentaciones";
import "../ActaImprimible.css";

const criterios = [
  { id: "rigor", nombre: "Rigor metodológico", peso: 30 },
  { id: "resultados", nombre: "Resultados y análisis", peso: 30 },
  { id: "informe", nombre: "Calidad del informe", peso: 20 },
  { id: "defensa", nombre: "Exposición y defensa", peso: 20 },
];

function fechaVisible(fecha) {
  if (!fecha) return "11/12/2026";
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

export default function ActaImprimible({
  sustentacion,
  jurado,
  onVolver,
}) {
  const trabajo =
    trabajos.find(
      t => t.id === sustentacion?.trabajoId
    ) || trabajos[0];

  let acta = null;

  try {
    const clave =
      `hu6-acta-registrada-${sustentacion?.id || 1}`;

    const guardada = localStorage.getItem(clave);

    if (guardada) {
      acta = JSON.parse(guardada);
    }
  } catch {
    acta = null;
  }

  
if (!acta || !acta.notas || !acta.resultado) {
  return (
    <div
      className="imprimible-pagina"
      style={{
        minHeight: "100vh",
        padding: "60px 24px",
        textAlign: "center",
      }}
    >
      <h2>Acta no disponible</h2>

      <p>
        Debes registrar el acta de sustentación
        antes de imprimirla.
      </p>

      <button
        type="button"
        onClick={onVolver}
      >
        ← Volver
      </button>
    </div>
  );
}

const notas = acta.notas;
const resultado = acta.resultado;
const observaciones = acta.observaciones ?? "";


  const promedio = criterios.reduce(
    (total, criterio) =>
      total +
      Number(notas[criterio.id]) *
        criterio.peso / 100,
    0
  );

  const notaFinal = Math.round(promedio);

  const fecha = fechaVisible(
    sustentacion?.fecha || "2026-12-11"
  );
  const hora = sustentacion?.hora || "10:00";
  const sala = sustentacion?.sala || "A-402";

  const idsJurado =
    acta?.juradoIds ||
    jurado?.seleccionados ||
    [1, 2, 3];

  const presidenteId =
    acta?.presidenteId ||
    jurado?.presidenteId ||
    1;

  const miembros = idsJurado
    .map(id => docentes.find(d => d.id === id))
    .filter(Boolean);

  return (
    <div className="imprimible-pagina">

      {/* CONTROLES DE VISTA PREVIA */}
      <div className="imprimible-controles">
        <button
          type="button"
          className="imprimible-volver"
          onClick={onVolver}
        >
          ← Volver
        </button>

        <strong>Vista previa del acta</strong>

        <button
          type="button"
          className="imprimible-boton"
          onClick={() => window.print()}
        >
          Imprimir / Guardar como PDF
        </button>
      </div>

      {/* DOCUMENTO A4 */}
      <article className="documento-a4">

        {/* ENCABEZADO */}
        <header className="documento-encabezado">
          <p>UNIVERSIDAD DE LIMA · FACULTAD DE INGENIERÍA</p>

          <h1>
            Acta de sustentación de trabajo de fin de carrera
          </h1>

          <span>
            Código TFC-2026-2-012 · Semestre 2026-2
          </span>
        </header>

        <div className="documento-linea" />

        {/* INFORMACIÓN DEL TRABAJO */}
        <section className="documento-informacion">
          <div className="documento-campo completo">
            <span>TÍTULO</span>
            <strong>{trabajo.titulo}</strong>
          </div>

          <div className="documento-dos-columnas">
            <div className="documento-campo">
              <span>LÍNEA DE INVESTIGACIÓN</span>
              <p>Gestión de operaciones</p>
            </div>

            <div className="documento-campo">
              <span>FECHA Y HORA</span>
              <p>
                {fecha} · {hora} · Sala {sala}
              </p>
            </div>
          </div>

          <div className="documento-dos-columnas">
            <div className="documento-campo">
              <span>EQUIPO</span>
              <p>
                Diana Carolina Rojas Tito · Jorge Luis Tapia Bendezú
              </p>
            </div>

            <div className="documento-campo">
              <span>ASESOR</span>
              <p>{trabajo.asesor}</p>
            </div>
          </div>
        </section>

        {/* TABLA DE CALIFICACIONES */}
        <table className="documento-tabla">
          <thead>
            <tr>
              <th>CRITERIO</th>
              <th>PESO</th>
              <th>NOTA</th>
            </tr>
          </thead>

          <tbody>
            {criterios.map(c => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.peso}%</td>
                <td>{notas[c.id]}</td>
              </tr>
            ))}

            <tr className="documento-total">
              <td>
                Nota final · Resultado: {resultado}
              </td>
              <td>100%</td>
              <td>{notaFinal}</td>
            </tr>
          </tbody>
        </table>

        {/* OBSERVACIONES */}
        <section className="documento-observaciones">
          <h2>OBSERVACIONES DEL JURADO</h2>
          <p>
            {observaciones || "Sin observaciones."}
          </p>
        </section>

        {/* FIRMAS */}
        <section className="documento-firmas">
          {miembros.map(docente => (
            <div
              className="documento-firma"
              key={docente.id}
            >
              <div className="documento-firma-linea" />

              <strong>{docente.nombre}</strong>

              <span>
                {docente.id === presidenteId
                  ? "Presidente del jurado"
                  : "Miembro"}
              </span>
            </div>
          ))}
        </section>

      </article>

      {!acta && (
        <p className="imprimible-advertencia">
          Vista de demostración: aún no se ha encontrado
          un acta registrada para esta sustentación.
        </p>
      )}
    </div>
  );
}
