// 6.4 Mi sustentación (Estudiante): sin programar · programada · realizada con resultado
import { useState } from "react";
import Layout from "../componentes/layout/Layout";
import { Alerta, Boton, EncabezadoPagina, Etiqueta, Migas, Tarjeta } from "../componentes/ui";
import { useSustentaciones } from "../context/useSustentaciones";
import { CRITERIOS, ESTUDIANTE, SALAS, VENTANA } from "../data/mock";
import { useIrA } from "../utils/useIrA";
import { aDDMM, aDDMMYYYY, diaSemana, diasFaltantes, horaDeFechaHora } from "../utils/fechas";
import { calcularNotaFinal, docentePorId, nombreDocente, textoResultado } from "../utils/reglas";
import { nombreCompleto, nombreCorto, sustentacionDelEstudiante, trabajoPorCodigo } from "../utils/selectores";

export default function MiSustentacion() {
  const { estado } = useSustentaciones();
  const trabajo = trabajoPorCodigo(estado, ESTUDIANTE.trabajoCodigo);
  const sust = sustentacionDelEstudiante(estado);
  const realizada = sust?.acta?.estado === "REGISTRADA";
  const pct = Math.round((trabajo.avance.aprobados / trabajo.avance.total) * 100);

  const contexto = (
    <>
      <span className="truncar">{trabajo.titulo}</span>
      {realizada ? <Etiqueta tono="exito">Sustentado</Etiqueta> : (
        <>
          <span className="progreso" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
          <b>{pct}%</b>
        </>
      )}
    </>
  );

  return (
    <Layout
      rol="estudiante"
      contexto={contexto}
      estadoNav={realizada ? "Proceso cerrado" : "Etapa 5 de 5 · sustentaciones"}
      pie={`Sesión iniciada como ${nombreCompleto(ESTUDIANTE)} · rol Estudiante · ${trabajo.codigo}${realizada ? " sustentado" : ""}`}
    >
      <Migas>Mi trabajo · Mi sustentación</Migas>
      {!sust ? <SinProgramar /> : realizada ? <Realizada sust={sust} trabajo={trabajo} /> : <Programada sust={sust} trabajo={trabajo} />}
    </Layout>
  );
}

// ---------- Estado vacío ----------
function SinProgramar() {
  return (
    <>
      <EncabezadoPagina titulo="Mi sustentación" subtitulo="Todavía sin fecha asignada" />
      <div className="vacio">
        <span className="vacio__icono" aria-hidden="true">▤</span>
        <h2 className="titulo-seccion">Aún no tienes fecha de sustentación</h2>
        <p>{`La coordinación programa las sustentaciones de los trabajos concluidos entre el ${aDDMM(VENTANA.fechaInicio)} y el ${aDDMMYYYY(VENTANA.fechaFin)}. Te avisaremos por correo con la fecha, hora, sala y jurado.`}</p>
        <Boton variante="secundario">Ver requisitos de sustentación</Boton>
      </div>
    </>
  );
}

// ---------- Programada ----------
function Programada({ sust, trabajo }) {
  const sala = SALAS.find((s) => s.codigo === sust.salaId);
  const asesor = docentePorId(trabajo.asesorId);
  const [hoy] = useState(() => new Date());
  const faltan = diasFaltantes(sust.fecha, hoy);

  return (
    <>
      <EncabezadoPagina
        titulo="Mi sustentación"
        subtitulo={`Programada por la coordinación el ${aDDMMYYYY(sust.fechaProgramacion)} · faltan ${faltan} días`}
      />
      <div className="rejilla rejilla--estudiante">
        <div className="columna">
          <section className="hero hero--programada">
            <div className="hero__fila">
              <Etiqueta tono="info">Programada</Etiqueta>
              <span className="hero__modalidad">{`Modalidad ${sust.modalidad.toLowerCase()}`}</span>
            </div>
            <div className="hero__datos">
              <div><span className="etiqueta-mayus">Fecha</span><strong className="hero__valor">{aDDMMYYYY(sust.fecha)}</strong><span>{diaSemana(sust.fecha)}</span></div>
              <div><span className="etiqueta-mayus">Hora</span><strong className="hero__valor">{sust.hora}</strong><span>Duración estimada 60 min</span></div>
              <div><span className="etiqueta-mayus">Sala</span><strong className="hero__valor">{sust.salaId}</strong><span>{`Pabellón ${sala.pabellon}, ${pisoTexto(sala.piso)} piso`}</span></div>
            </div>
          </section>

          <Tarjeta titulo="Requisitos antes de la fecha">
            <ul className="requisitos">
              {trabajo.requisitos.map((r) => (
                <li key={r.tipo} className={r.cumplido ? "requisito requisito--ok" : "requisito"}>
                  <span className="requisito__icono" aria-hidden="true">{r.cumplido ? "✓" : ""}</span>
                  <div>
                    <p className="requisito__titulo">{r.titulo}</p>
                    <p className={r.fechaLimite && !r.cumplido ? "texto-aviso" : "muted"}>{detalleRequisito(r)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Tarjeta>
        </div>

        <div className="columna">
          <Tarjeta etiqueta="Jurado designado">
            <ul className="jurado-lista">
              {sust.jurado.map((m) => {
                const d = docentePorId(m.docenteId);
                return (
                  <li key={m.docenteId}>
                    <div><strong>{nombreDocente(d)}</strong><span className="muted">{d.departamento}</span></div>
                    {m.rol === "PRESIDENTE" && <Etiqueta tono="acento">Presidente</Etiqueta>}
                  </li>
                );
              })}
            </ul>
          </Tarjeta>

          <Tarjeta etiqueta="Equipo y asesor">
            <ul className="lista-simple lista-simple--vertical">
              {trabajo.equipo.map((e) => <li key={e.id}>{`${nombreCorto(e)} · ${e.rol === "RESPONSABLE" ? "responsable" : "integrante"}`}</li>)}
              <li className="separado">{`${nombreDocente(asesor)} · asesor`}</li>
            </ul>
          </Tarjeta>

          <div className="nota-caja">
            <span className="etiqueta-mayus">Cambios de fecha</span>
            <p>Solo la coordinación puede reprogramar. Si tienes un impedimento, escribe a tfc@ulima.edu.pe con al menos 5 días de anticipación.</p>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------- Realizada con resultado ----------
function Realizada({ sust, trabajo }) {
  const irA = useIrA();
  const acta = sust.acta;
  const notaFinal = calcularNotaFinal(acta.notas);

  return (
    <>
      <EncabezadoPagina
        titulo="Mi sustentación"
        subtitulo={`Realizada el ${aDDMMYYYY(sust.fecha)} · acta registrada por la coordinación el ${aDDMMYYYY(acta.fechaRegistro)} a las ${horaDeFechaHora(acta.fechaRegistro)}`}
      />
      <div className="rejilla rejilla--estudiante">
        <div className="columna">
          <section className="hero hero--resultado">
            <div>
              <span className="etiqueta-mayus">Resultado del jurado</span>
              <strong className="hero__resultado">{textoResultado(acta.resultado)}</strong>
              <span>{`${acta.porUnanimidad ? "Por unanimidad · " : ""}${aDDMMYYYY(sust.fecha)} · Sala ${sust.salaId}`}</span>
            </div>
            <div className="derecha">
              <span className="etiqueta-mayus">Nota final</span>
              <strong className="nota-gigante">{notaFinal}</strong>
            </div>
          </section>

          <Tarjeta titulo="Detalle de la calificación">
            <table className="tabla-notas tabla-notas--lectura">
              <thead><tr><th>Criterio</th><th>Peso</th><th>Nota</th></tr></thead>
              <tbody>
                {CRITERIOS.map((c) => (
                  <tr key={c.id}><td>{c.nombre}</td><td className="muted">{c.peso}%</td><td><strong>{acta.notas[c.id]}</strong></td></tr>
                ))}
              </tbody>
            </table>
            {acta.observaciones && (
              <>
                <span className="etiqueta-mayus">Observaciones del jurado</span>
                <blockquote className="cita">{acta.observaciones}</blockquote>
              </>
            )}
          </Tarjeta>
        </div>

        <div className="columna">
          <Tarjeta etiqueta="Documentos">
            <div className="pila">
              <Boton onClick={() => irA("/mi-sustentacion/acta")}>Descargar acta firmada (PDF)</Boton>
              <Boton variante="secundario" onClick={() => window.alert("Descarga del informe final (pendiente de backend)")}>Descargar informe final</Boton>
              <Boton variante="secundario" onClick={() => window.alert("Ver mi trabajo pertenece a otra historia de usuario")}>Ver mi trabajo</Boton>
            </div>
          </Tarjeta>

          <Tarjeta etiqueta="Jurado">
            <ul className="lista-simple">
              {sust.jurado.map((m) => (
                <li key={m.docenteId}>
                  <span>{nombreDocente(docentePorId(m.docenteId))}</span>
                  {m.rol === "PRESIDENTE" && <Etiqueta tono="acento">Presidente</Etiqueta>}
                </li>
              ))}
            </ul>
          </Tarjeta>

          <Alerta tipo="exito" titulo="Siguiente paso">
            Con el acta aprobada puedes iniciar el trámite de bachillerato en la Secretaría Académica.
          </Alerta>
        </div>
      </div>
    </>
  );
}

const pisoTexto = (n) => ({ 1: "primer", 2: "segundo", 3: "tercer", 4: "cuarto", 5: "quinto" })[n] ?? `${n}.º`;

const detalleRequisito = (r) => {
  if (r.tipo === "INFORME_FINAL_APROBADO") return `Aprobado por ${r.aprobadoPor} el ${aDDMMYYYY(r.fechaCumplimiento)}`;
  if (r.tipo === "INFORME_IMPRESO") return `En ${r.lugarEntrega} hasta el ${aDDMMYYYY(r.fechaLimite)} (${r.diasHabilesAntes} días hábiles antes)`;
  return r.nota;
};
