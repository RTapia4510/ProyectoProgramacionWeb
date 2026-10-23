// 6.2 Conformación del jurado, con advertencia de conflicto (Administrador)
import Layout from "../componentes/layout/Layout";
import { Alerta, Boton, EncabezadoPagina, Etiqueta, Migas, Tarjeta } from "../componentes/ui";
import { useSustentaciones } from "../context/useSustentaciones";
import { ADMIN, DOCENTES, GRADOS } from "../data/mock";
import Enlace from "../componentes/Enlace";
import { useIrA } from "../utils/useIrA";
import { aDDMMYYYY } from "../utils/fechas";
import { conflictoDocencia, docentePorId, estadoCandidato, nombreDocente, validarJurado } from "../utils/reglas";
import { nombreCompleto, sustentacionActual, trabajoPorCodigo } from "../utils/selectores";

export default function ConformarJurado() {
  const { estado, dispatch } = useSustentaciones();
  const irA = useIrA();
  const sust = sustentacionActual(estado);

  if (!sust) return <SinSustentacion />;

  const trabajo = trabajoPorCodigo(estado, sust.trabajoCodigo);
  const asesor = docentePorId(trabajo.asesorId);
  const lleno = sust.jurado.length >= 3;
  const { items, cumple } = validarJurado(sust.jurado, trabajo);
  const resumen = `${aDDMMYYYY(sust.fecha)} · ${sust.hora} · ${sust.salaId}`;

  // Candidatos ordenados por carga de jurados del ciclo (menor primero)
  const candidatos = [...DOCENTES]
    .sort((a, b) => a.cargaJurados - b.cargaJurados)
    .map((d) => ({ docente: d, ...estadoCandidato(d, { trabajo, sustentacion: sust, sustentaciones: estado.sustentaciones }) }));

  const conflictivos = DOCENTES.filter((d) => d.id !== asesor.id && conflictoDocencia(d, trabajo));

  const agregar = (c) =>
    dispatch({
      tipo: "AGREGAR_JURADO",
      sustentacionId: sust.id,
      docenteId: c.docente.id,
      motivo: c.estado === "ADVERTENCIA" ? c.motivo : "",
    });

  const confirmar = () => {
    dispatch({ tipo: "CONFIRMAR_JURADO", sustentacionId: sust.id });
    irA("/sustentaciones/acta");
  };

  return (
    <Layout
      rol="admin"
      contexto={<><span>Sustentación</span><b>{resumen}</b></>}
      estadoNav="Paso 2 de 3 · jurado"
      pie={`Sesión iniciada como ${nombreCompleto(ADMIN)} · rol Administrador · ${trabajo.codigo}`}
    >
      <Migas>{`Sustentaciones · ${resumen} · Conformar jurado`}</Migas>
      <EncabezadoPagina titulo="Conformación del jurado" subtitulo={trabajo.titulo} serif />

      <Alerta tipo="aviso" className="alerta--ancha">
        {`${nombreDocente(asesor)} es el asesor del trabajo: no puede integrar el jurado.`}
        {conflictivos.map((d) => ` ${nombreDocente(d)} dictó clases al equipo en ${conflictoDocencia(d, trabajo).periodo}; revisa el posible conflicto antes de agregarla.`)}
      </Alerta>

      <div className="rejilla rejilla--jurado">
        <Tarjeta className="tarjeta--lista">
          <header className="lista__cabecera">
            <span className="etiqueta-mayus">Docentes disponibles</span>
            <span className="campo__ayuda">Ordenados por carga de jurados del ciclo</span>
          </header>
          <ul className="docentes">
            {candidatos.map((c) => (
              <li key={c.docente.id} className={`docente docente--${c.estado.toLowerCase()}`}>
                <div>
                  <p className="docente__nombre">{nombreDocente(c.docente)}</p>
                  <p className="docente__meta">
                    {c.motivo ? (
                      <span className={c.estado === "NO_ELEGIBLE" ? "texto-error" : "texto-aviso"}>{c.motivo}</span>
                    ) : (
                      `${c.docente.departamento} · ${c.docente.cargaJurados} jurados este ciclo · ${GRADOS[c.docente.grado]}`
                    )}
                  </p>
                </div>
                {c.estado === "AGREGADO" && <Boton variante="neutro" disabled>{c.docente.genero === "F" ? "Agregada" : "Agregado"}</Boton>}
                {c.estado === "NO_ELEGIBLE" && <Boton variante="neutro" disabled>No disponible</Boton>}
                {c.estado === "ADVERTENCIA" && <Boton variante="aviso" disabled={lleno} onClick={() => agregar(c)}>Agregar de todos modos</Boton>}
                {c.estado === "DISPONIBLE" && <Boton variante="secundario" disabled={lleno} onClick={() => agregar(c)}>Agregar</Boton>}
              </li>
            ))}
          </ul>
          <p className="lista__pie">El jurado se compone de 3 miembros; al menos uno debe tener grado de doctor y uno debe pertenecer al departamento del trabajo.</p>
        </Tarjeta>

        <Tarjeta className="panel-jurado">
          <header className="tarjeta__cabecera">
            <span className="etiqueta-mayus">Jurado seleccionado</span>
            <Etiqueta tono={cumple ? "exito" : "neutro"}>{`${sust.jurado.length} de 3`}</Etiqueta>
          </header>

          {sust.jurado.length === 0 && <p className="campo__ayuda">Aún no agregaste docentes al jurado.</p>}
          {sust.jurado.map((m) => {
            const d = docentePorId(m.docenteId);
            const presidente = m.rol === "PRESIDENTE";
            return (
              <article key={m.docenteId} className={`miembro ${presidente ? "miembro--presidente" : ""}`}>
                <div className="miembro__fila">
                  <strong>{nombreDocente(d)}</strong>
                  {presidente ? <Etiqueta tono="acento">Presidente</Etiqueta> : (
                    <button type="button" className="enlace-peligro" onClick={() => dispatch({ tipo: "QUITAR_JURADO", sustentacionId: sust.id, docenteId: d.id })}>Quitar</button>
                  )}
                </div>
                <div className="miembro__fila">
                  <span className="docente__meta">{`${d.departamento} · ${GRADOS[d.grado]}`}</span>
                  {!presidente && (
                    <button type="button" className="enlace" onClick={() => dispatch({ tipo: "DESIGNAR_PRESIDENTE", sustentacionId: sust.id, docenteId: d.id })}>Designar presidente</button>
                  )}
                </div>
                {m.agregadoConAdvertencia && <p className="texto-aviso docente__meta">{m.motivoAdvertencia}</p>}
                {presidente && (
                  <button type="button" className="enlace-peligro enlace-peligro--suelto" onClick={() => dispatch({ tipo: "QUITAR_JURADO", sustentacionId: sust.id, docenteId: d.id })}>Quitar</button>
                )}
              </article>
            );
          })}

          <ul className="requisitos-jurado">
            {items.map((i) => (
              <li key={i.texto} className={i.ok ? "ok" : "pendiente"}><span aria-hidden="true">{i.ok ? "✓" : "○"}</span>{i.texto}</li>
            ))}
          </ul>

          <Boton className="boton--bloque" disabled={!cumple} onClick={confirmar}>Confirmar jurado</Boton>
          <p className="campo__ayuda centrado">Se notificará a los tres miembros, al equipo y al asesor</p>
        </Tarjeta>
      </div>
    </Layout>
  );
}

function SinSustentacion() {
  return (
    <Layout rol="admin" estadoNav="Paso 2 de 3 · jurado">
      <Migas>Sustentaciones · Conformar jurado</Migas>
      <EncabezadoPagina titulo="Conformación del jurado" subtitulo="Primero programa una sustentación." />
      <Tarjeta>
        <p>Todavía no hay una sustentación en curso. Comienza por el paso 1.</p>
        <p><Enlace a="/sustentaciones/programar" className="enlace">Ir a programar sustentación</Enlace></p>
      </Tarjeta>
    </Layout>
  );
}
