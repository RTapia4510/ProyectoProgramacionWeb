// Acta de sustentación · documento A4 para impresión (no es pantalla completa)
import { Boton } from "../componentes/ui";
import { useSustentaciones } from "../context/useSustentaciones";
import { CRITERIOS, PERIODO } from "../data/mock";
import { useIrA } from "../utils/useIrA";
import { aDDMMYYYY } from "../utils/fechas";
import { calcularNotaFinal, docentePorId, nombreDocente, textoResultado } from "../utils/reglas";
import { nombreCompleto, sustentacionActual, sustentacionDelEstudiante, trabajoPorCodigo } from "../utils/selectores";

export default function ActaImpresion({ origen = "admin" }) {
  const { estado } = useSustentaciones();
  const irA = useIrA();
  const sust = origen === "admin" ? sustentacionActual(estado) : sustentacionDelEstudiante(estado);
  const volver = origen === "admin" ? "/sustentaciones/acta" : "/mi-sustentacion";

  if (!sust?.acta) {
    return (
      <div className="hoja-fondo">
        <div className="hoja"><p>No hay un acta para mostrar todavía.</p></div>
        <Boton variante="secundario" onClick={() => irA(volver)}>Volver</Boton>
      </div>
    );
  }

  const trabajo = trabajoPorCodigo(estado, sust.trabajoCodigo);
  const asesor = docentePorId(trabajo.asesorId);
  const { notas, observaciones, resultado } = sust.acta;
  const notaFinal = calcularNotaFinal(notas);

  return (
    <div className="hoja-fondo">
      <div className="hoja-barra no-print">
        <Boton variante="secundario" onClick={() => irA(volver)}>Volver</Boton>
        <Boton onClick={() => window.print()}>Imprimir / guardar PDF</Boton>
      </div>

      <article className="hoja">
        <header className="hoja__encabezado">
          <p className="etiqueta-mayus">Universidad de Lima · Facultad de Ingeniería</p>
          <h1>Acta de sustentación de trabajo de fin de carrera</h1>
          <p className="hoja__codigo">{`Código ${trabajo.codigo} · Semestre ${PERIODO.codigo}`}</p>
        </header>

        <div className="hoja__bloque">
          <span className="etiqueta-mayus">Título</span>
          <p className="hoja__titulo">{trabajo.titulo}</p>
        </div>
        <div className="hoja__grid">
          <div><span className="etiqueta-mayus">Línea de investigación</span><p>{trabajo.linea}</p></div>
          <div><span className="etiqueta-mayus">Fecha y hora</span><p>{`${aDDMMYYYY(sust.fecha)} · ${sust.hora} · Sala ${sust.salaId}`}</p></div>
          <div><span className="etiqueta-mayus">Equipo</span><p>{trabajo.equipo.map(nombreCompleto).join(" · ")}</p></div>
          <div><span className="etiqueta-mayus">Asesor</span><p>{nombreDocente(asesor)}</p></div>
        </div>

        <table className="hoja__tabla">
          <thead><tr><th>Criterio</th><th>Peso</th><th>Nota</th></tr></thead>
          <tbody>
            {CRITERIOS.map((c) => (
              <tr key={c.id}><td>{c.nombre}</td><td>{c.peso}%</td><td>{notas[c.id] ?? "—"}</td></tr>
            ))}
            <tr className="hoja__total"><td>{`Nota final · Resultado: ${textoResultado(resultado) || "—"}`}</td><td>100%</td><td>{notaFinal ?? "—"}</td></tr>
          </tbody>
        </table>

        <div className="hoja__bloque">
          <span className="etiqueta-mayus">Observaciones del jurado</span>
          <p>{observaciones || "Sin observaciones."}</p>
        </div>

        <div className="hoja__firmas">
          {sust.jurado.map((m) => (
            <div key={m.docenteId}>
              <div className="hoja__linea" />
              <strong>{nombreDocente(docentePorId(m.docenteId))}</strong>
              <span>{m.rol === "PRESIDENTE" ? "Presidente del jurado" : "Miembro"}</span>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
