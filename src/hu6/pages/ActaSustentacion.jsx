// 6.3 Acta de sustentación: registro de notas y resultado (Administrador) + modal de confirmación
import { useState } from "react";
import Layout from "../componentes/layout/Layout";
import { Alerta, Boton, EncabezadoPagina, Etiqueta, Migas, Modal, Segmentado, Tarjeta } from "../componentes/ui";
import { useSustentaciones } from "../context/useSustentaciones";
import { ADMIN, CRITERIOS, RESULTADOS } from "../data/mock";
import Enlace from "../componentes/Enlace";
import { aDDMMYYYY, horaDeFechaHora } from "../utils/fechas";
import { calcularNotaFinal, docentePorId, esNotaValida, nombreDocente, textoResultado } from "../utils/reglas";
import { nombreCompleto, sustentacionActual, trabajoPorCodigo } from "../utils/selectores";

export default function ActaSustentacion() {
  const { estado, dispatch } = useSustentaciones();
  const sust = sustentacionActual(estado);

  const [notas, setNotas] = useState(sust?.acta?.notas ?? {});
  const [resultado, setResultado] = useState(sust?.acta?.resultado ?? null);
  const [observaciones, setObservaciones] = useState(sust?.acta?.observaciones ?? "");
  const [confirmando, setConfirmando] = useState(false);
  const [intento, setIntento] = useState(false);

  if (!sust || !sust.juradoConfirmado) return <SinJurado />;

  const trabajo = trabajoPorCodigo(estado, sust.trabajoCodigo);
  const asesor = docentePorId(trabajo.asesorId);
  const registrada = sust.acta?.estado === "REGISTRADA";
  const notaFinal = calcularNotaFinal(notas);
  const faltantes = CRITERIOS.filter((c) => !esNotaValida(notas[c.id]));
  const completa = faltantes.length === 0 && resultado;
  const datosActa = { notas, resultado, observaciones };

  const cambiarNota = (id, texto) => {
    const valor = texto === "" ? undefined : Number(texto);
    setNotas((n) => ({ ...n, [id]: valor }));
  };

  const registrar = () => {
    setIntento(true);
    if (completa) setConfirmando(true);
  };

  const confirmarRegistro = () => {
    dispatch({ tipo: "REGISTRAR_ACTA", sustentacionId: sust.id, acta: datosActa });
    setConfirmando(false);
  };

  const ubicacion = `${aDDMMYYYY(sust.fecha)} · ${sust.hora} · Sala ${sust.salaId} · ${sust.modalidad.toLowerCase()} · ${trabajo.titulo}`;

  return (
    <Layout
      rol="admin"
      contexto={<><span>Acta</span><b>{trabajo.codigo}</b></>}
      estadoNav="Paso 3 de 3 · acta"
      pie={`Sesión iniciada como ${nombreCompleto(ADMIN)} · rol Administrador · acta ${registrada ? "registrada" : "en borrador"}`}
    >
      <Migas>Sustentaciones · Acta</Migas>
      <EncabezadoPagina
        titulo="Acta de sustentación"
        subtitulo={ubicacion}
        acciones={<Enlace a="/sustentaciones/acta/imprimir" className="boton boton--secundario">Ver vista de impresión</Enlace>}
      />

      {registrada && (
        <Alerta tipo="exito" className="alerta--ancha">
          {`Acta registrada el ${aDDMMYYYY(sust.acta.fechaRegistro)} a las ${horaDeFechaHora(sust.acta.fechaRegistro)}. Se notificó al equipo, al asesor y a la Secretaría Académica.`}
        </Alerta>
      )}

      <div className="rejilla rejilla--acta">
        <Tarjeta className="formulario">
          <h2 className="titulo-seccion">Calificación por criterios</h2>
          <table className="tabla-notas">
            <thead>
              <tr><th>Criterio</th><th>Peso</th><th>Nota (0–20)</th></tr>
            </thead>
            <tbody>
              {CRITERIOS.map((c) => {
                const invalida = intento && !esNotaValida(notas[c.id]);
                return (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td className="muted">{c.peso}%</td>
                    <td>
                      <input
                        aria-label={`Nota de ${c.nombre}`}
                        className={`control control--nota ${invalida ? "control--error" : ""}`}
                        type="number" min="0" max="20" step="1" inputMode="numeric"
                        value={notas[c.id] ?? ""}
                        disabled={registrada}
                        onChange={(e) => cambiarNota(c.id, e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="nota-final">
            <span>Nota final ponderada</span>
            <strong>{notaFinal ?? "—"}</strong>
          </div>

          <div className="campo">
            <span className="etiqueta-mayus">Resultado</span>
            <Segmentado nombre="Resultado" opciones={RESULTADOS} valor={resultado} onChange={setResultado} deshabilitado={registrada} />
            {intento && !resultado && <p className="texto-error campo__ayuda">Selecciona el resultado de la sustentación.</p>}
          </div>

          <div className="campo">
            <label className="etiqueta-mayus" htmlFor="obs">Observaciones del jurado</label>
            <textarea id="obs" className="control control--area" rows={3} value={observaciones} disabled={registrada} onChange={(e) => setObservaciones(e.target.value)} />
          </div>

          {intento && faltantes.length > 0 && (
            <Alerta tipo="error">{`Faltan notas válidas (0 a 20) en: ${faltantes.map((c) => c.nombre).join(", ")}.`}</Alerta>
          )}

          {!registrada && (
            <div className="acciones">
              <Boton variante="texto" onClick={() => dispatch({ tipo: "GUARDAR_ACTA", sustentacionId: sust.id, acta: datosActa })}>Guardar borrador</Boton>
              <Boton onClick={registrar}>Registrar acta</Boton>
            </div>
          )}
        </Tarjeta>

        <div className="columna">
          <Tarjeta etiqueta="Jurado que firma">
            <ul className="lista-simple">
              {sust.jurado.map((m) => (
                <li key={m.docenteId}>
                  <span>{nombreDocente(docentePorId(m.docenteId))}</span>
                  {m.rol === "PRESIDENTE" && <Etiqueta tono="acento">Presidente</Etiqueta>}
                </li>
              ))}
            </ul>
          </Tarjeta>

          <Tarjeta etiqueta="Datos del trabajo">
            <dl className="datos">
              <div><dt>Equipo</dt><dd>{trabajo.equipo.map((e) => `${e.nombres.split(" ")[0]} ${e.apellidos}`).join(" · ")}</dd></div>
              <div><dt>Asesor</dt><dd>{nombreDocente(asesor)}</dd></div>
              <div><dt>Línea</dt><dd>{trabajo.linea}</dd></div>
              <div><dt>Avance del plan</dt><dd>{`${Math.round((trabajo.avance.aprobados / trabajo.avance.total) * 100)}% · ${trabajo.avance.aprobados} de ${trabajo.avance.total} aprobados`}</dd></div>
            </dl>
          </Tarjeta>

          <Alerta tipo="aviso" titulo="El acta es definitiva">
            Una vez registrada, solo la Secretaría Académica puede rectificarla. El estudiante verá el resultado y podrá descargar el acta firmada.
          </Alerta>
        </div>
      </div>

      {confirmando && (
        <Modal titulo="Registrar el acta" onCerrar={() => setConfirmando(false)}>
          <div className="resumen-acta">
            <div><span className="etiqueta-mayus">Resultado</span><strong className="serif">{textoResultado(resultado)}</strong></div>
            <div className="derecha"><span className="etiqueta-mayus">Nota final</span><strong className="nota-grande">{notaFinal}</strong></div>
          </div>
          <Alerta tipo="aviso">El acta queda definitiva: se notifica al equipo, al asesor y a la Secretaría Académica. Solo Secretaría puede rectificarla después.</Alerta>
          <div className="acciones">
            <Boton variante="texto" onClick={() => setConfirmando(false)}>Revisar de nuevo</Boton>
            <Boton onClick={confirmarRegistro}>Registrar acta</Boton>
          </div>
        </Modal>
      )}
    </Layout>
  );
}

function SinJurado() {
  return (
    <Layout rol="admin" estadoNav="Paso 3 de 3 · acta">
      <Migas>Sustentaciones · Acta</Migas>
      <EncabezadoPagina titulo="Acta de sustentación" subtitulo="Antes de registrar el acta debes programar la sustentación y confirmar el jurado." />
      <Tarjeta>
        <p><Enlace a="/sustentaciones/programar" className="enlace">Ir a programar sustentación</Enlace></p>
      </Tarjeta>
    </Layout>
  );
}
