// 6.1 Programar sustentación (Administrador) + modal "La sala ya está ocupada"
import { useState } from "react";
import Layout from "../componentes/layout/Layout";
import { Alerta, Boton, Campo, EncabezadoPagina, Migas, Modal, Segmentado, Tarjeta } from "../componentes/ui";
import { useSustentaciones } from "../context/useSustentaciones";
import { ADMIN, DURACION_MIN, HORAS, MODALIDADES, PERIODO, SALAS, VENTANA } from "../data/mock";
import Enlace from "../componentes/Enlace";
import { useIrA } from "../utils/useIrA";
import { aDDMM, aDDMMYYYY, dentroDeVentana, sumarMinutos } from "../utils/fechas";
import { bloquesDeSala, buscarChoqueSala, docentePorId, nombreDocente, sugerirAlternativas } from "../utils/reglas";
import { nombreCompleto, trabajoPorCodigo, trabajosPorProgramar } from "../utils/selectores";

const ETIQUETA_BLOQUE = { LIBRE: "Libre", OCUPADA: "Ocupada", SELECCIONADA: "Seleccionada" };

export default function ProgramarSustentacion() {
  const { estado, dispatch } = useSustentaciones();
  const irA = useIrA();
  const disponibles = trabajosPorProgramar(estado);

  const [trabajoCodigo, setTrabajoCodigo] = useState(disponibles[0]?.codigo ?? "");
  const [fecha, setFecha] = useState("2026-12-11");
  const [hora, setHora] = useState("10:00");
  const [salaId, setSalaId] = useState("A-402");
  const [modalidad, setModalidad] = useState("PRESENCIAL");
  const [modalOcupada, setModalOcupada] = useState(null);

  const trabajo = trabajoPorCodigo(estado, trabajoCodigo);
  const asesor = trabajo ? docentePorId(trabajo.asesorId) : null;
  const sala = SALAS.find((s) => s.codigo === salaId);
  const choque = buscarChoqueSala(estado.sustentaciones, salaId, fecha, hora);
  const enVentana = dentroDeVentana(fecha, VENTANA);
  const bloques = bloquesDeSala(estado.sustentaciones, salaId, fecha, hora);
  const horaFin = sumarMinutos(hora, DURACION_MIN);

  const programadas = estado.sustentaciones.filter((s) => s.estado === "PROGRAMADA").length;
  const realizadas = estado.sustentaciones.filter((s) => s.estado === "REALIZADA").length;

  const programar = () => {
    if (!trabajo || !enVentana) return;
    if (choque) {
      setModalOcupada({
        choque,
        tituloChoque: trabajoPorCodigo(estado, choque.trabajoCodigo)?.titulo,
        alternativas: sugerirAlternativas(estado.sustentaciones, salaId, fecha, hora),
      });
      return;
    }
    dispatch({ tipo: "PROGRAMAR", trabajoCodigo, fecha, hora, salaId, modalidad });
    irA("/sustentaciones/jurado");
  };

  const usarAlternativa = (alt) => {
    setSalaId(alt.salaId);
    setFecha(alt.fecha);
    setHora(alt.hora);
    setModalOcupada(null);
  };

  return (
    <Layout
      rol="admin"
      contexto={<><span>Periodo</span><b>{PERIODO.codigo}</b></>}
      estadoNav={`Ventana de sustentaciones ${aDDMM(VENTANA.fechaInicio)} – ${aDDMM(VENTANA.fechaFin)}`}
      pie={`Sesión iniciada como ${nombreCompleto(ADMIN)} · rol Administrador · coordinación TFC ${PERIODO.codigo}`}
    >
      <Migas>Sustentaciones · Programar</Migas>
      <EncabezadoPagina
        titulo="Programar sustentación"
        subtitulo="Solo los trabajos en estado Concluido pueden programarse. La sala no puede tener dos sustentaciones a la misma hora."
      />

      <div className="rejilla rejilla--2-1">
        <Tarjeta className="formulario">
          <Campo etiqueta="Trabajo concluido" htmlFor="trabajo" ayuda={
            trabajo
              ? `${disponibles.length} trabajos concluidos disponibles · asesor ${nombreDocente(asesor)} · equipo de ${trabajo.equipo.length} integrantes`
              : "No hay trabajos concluidos pendientes de programar."
          }>
            <select id="trabajo" className="control control--serif" value={trabajoCodigo} onChange={(e) => setTrabajoCodigo(e.target.value)} disabled={!trabajo}>
              {disponibles.map((t) => <option key={t.codigo} value={t.codigo}>{t.titulo}</option>)}
            </select>
          </Campo>

          <div className="fila-2">
            <Campo etiqueta="Fecha" htmlFor="fecha" ayuda={enVentana ? `Dentro de la ventana ${aDDMMYYYY(VENTANA.fechaInicio)} – ${aDDMMYYYY(VENTANA.fechaFin)}` : `Fuera de la ventana ${aDDMMYYYY(VENTANA.fechaInicio)} – ${aDDMMYYYY(VENTANA.fechaFin)}`}>
              <input id="fecha" type="date" className={`control ${enVentana ? "" : "control--error"}`} value={fecha} min={VENTANA.fechaInicio} max={VENTANA.fechaFin} onChange={(e) => setFecha(e.target.value)} />
            </Campo>
            <Campo etiqueta="Hora" htmlFor="hora" ayuda={`Bloques de ${DURACION_MIN} minutos`}>
              <select id="hora" className="control" value={hora} onChange={(e) => setHora(e.target.value)}>
                {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </Campo>
          </div>

          <div className="fila-2">
            <Campo etiqueta="Sala" htmlFor="sala">
              <select id="sala" className="control" value={salaId} onChange={(e) => setSalaId(e.target.value)}>
                {SALAS.map((s) => <option key={s.codigo} value={s.codigo}>{`${s.codigo} · pabellón ${s.pabellon} · ${s.aforo} asientos`}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Modalidad">
              <Segmentado nombre="Modalidad" opciones={MODALIDADES} valor={modalidad} onChange={setModalidad} />
            </Campo>
          </div>

          {!enVentana ? (
            <Alerta tipo="aviso">La fecha elegida está fuera de la ventana de sustentaciones del periodo.</Alerta>
          ) : choque ? (
            <Alerta tipo="error">{`La sala ${salaId} ya está ocupada el ${aDDMMYYYY(fecha)} de ${hora} a ${horaFin}. Elige otro bloque o sala.`}</Alerta>
          ) : (
            <Alerta tipo="exito">{`La sala ${salaId} está libre el ${aDDMMYYYY(fecha)} de ${hora} a ${horaFin}. Ningún miembro del jurado tiene otra sustentación en ese bloque.`}</Alerta>
          )}

          <div className="nota-caja">
            <span className="etiqueta-mayus">Notificaciones al guardar</span>
            <p>Se notificará al equipo, al asesor y a los tres miembros del jurado con la fecha, hora, sala y modalidad.</p>
          </div>

          <div className="acciones">
            <Boton variante="texto" onClick={() => irA("/sustentaciones/programar")}>Cancelar</Boton>
            <Boton onClick={programar} disabled={!trabajo || !enVentana}>Programar y conformar jurado</Boton>
          </div>
        </Tarjeta>

        <div className="columna">
          <Tarjeta etiqueta={`Sala ${salaId} · ${aDDMMYYYY(fecha)}`}>
            <ul className="bloques">
              {bloques.map((b) => (
                <li key={b.horaInicio} className={`bloque bloque--${b.estado.toLowerCase()}`}>
                  <span>{`${b.horaInicio} – ${b.horaFin}`}</span>
                  <span>{ETIQUETA_BLOQUE[b.estado]}</span>
                </li>
              ))}
            </ul>
            <p className="campo__ayuda">{sala && `Pabellón ${sala.pabellon}, piso ${sala.piso} · ${sala.aforo} asientos`}</p>
          </Tarjeta>

          <Tarjeta etiqueta="Sustentaciones del periodo">
            <dl className="contadores">
              <div><dt>Programadas</dt><dd>{programadas}</dd></div>
              <div><dt>Realizadas</dt><dd>{realizadas}</dd></div>
              <div><dt>Concluidos por programar</dt><dd>{disponibles.length}</dd></div>
            </dl>
            <Enlace a="/sustentaciones/programar" className="enlace">Ver calendario completo</Enlace>
          </Tarjeta>
        </div>
      </div>

      {modalOcupada && (
        <Modal titulo="La sala ya está ocupada" onCerrar={() => setModalOcupada(null)}>
          <Alerta tipo="error">
            {`La sala ${modalOcupada.choque.salaId} está ocupada el ${aDDMMYYYY(modalOcupada.choque.fecha)} de ${modalOcupada.choque.hora} a ${sumarMinutos(modalOcupada.choque.hora, DURACION_MIN)} por «${modalOcupada.tituloChoque}».`}
          </Alerta>
          <div className="nota-caja">
            <span className="etiqueta-mayus">Alternativas disponibles</span>
            {modalOcupada.alternativas.length === 0 && <p>No hay alternativas libres ese día.</p>}
            <ul className="alternativas">
              {modalOcupada.alternativas.map((a) => (
                <li key={`${a.salaId}-${a.hora}`}>
                  <span>{`${a.salaId} · ${aDDMMYYYY(a.fecha)} · ${a.hora}`}</span>
                  <button type="button" className="boton boton--texto" onClick={() => usarAlternativa(a)}>Usar</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="acciones">
            <Boton variante="texto" onClick={() => setModalOcupada(null)}>Cambiar datos</Boton>
            <Boton disabled>Programar</Boton>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
