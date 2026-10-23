import { useState } from 'react'
import './PlanEntregables.css'
function PlanEntregables() {

  // Datos de prueba de los entregables
  const [entregables, setEntregables] = useState([
    {
      id: 1,
      nombre: "Propuesta de investigación",
      fecha: "2026-10-25",
      estado: "Aprobado"
    },
    {
      id: 2,
      nombre: "Marco teórico",
      fecha: "2026-11-05",
      estado: "Pendiente"
    },
    {
      id: 3,
      nombre: "Desarrollo del proyecto",
      fecha: "2026-11-20",
      estado: "Pendiente"
    }
  ]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [peso, setPeso] = useState("");
  const [obligatorio, setObligatorio] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [idAvance, setIdAvance] = useState(null);
const [enlaceAvance, setEnlaceAvance] = useState("");
const [descripcionAvance, setDescripcionAvance] = useState("");
const [versionAvance, setVersionAvance] = useState("");


  function agregarEntregable() {
if (
  nombre.trim() === "" ||
  fecha === "" ||
  descripcion.trim() === "" ||
  peso === ""
) {
  alert("Completa todos los campos");
  return;
}

if (Number(peso) <= 0 || Number(peso) > 100) {
  alert("El peso debe estar entre 1 y 100");
  return;
}

const pesoTotal = entregables
  .filter((entregable) => entregable.id !== idEditando)
  .reduce(
    (total, entregable) => total + Number(entregable.peso || 0),
    0
  );

if (pesoTotal + Number(peso) > 100) {
  alert("La suma de los pesos no puede superar el 100%");
  return;
}

  const nuevoEntregable = {
  id: Date.now(),
  nombre: nombre,
  descripcion: descripcion,
  fecha: fecha,
  peso: Number(peso),
  obligatorio: obligatorio,
  estado: "Pendiente"
};

  if (idEditando !== null) {
  setEntregables(
    entregables.map((entregable) =>
      entregable.id === idEditando
        ? { ...nuevoEntregable, id: idEditando, estado: entregable.estado }
        : entregable
    )
  );
} else {
  setEntregables([...entregables, nuevoEntregable]);
}

  setNombre("");
  setFecha("");
  setDescripcion("");
  setPeso("");
  setObligatorio(false);
  setMostrarFormulario(false);
  setIdEditando(null);
}
function eliminarEntregable(id) {
  const confirmar = window.confirm(
    "¿Estás seguro de eliminar este entregable?"
  );

  if (confirmar) {
    setEntregables(
      entregables.filter((entregable) => entregable.id !== id)
    );
  }
}
function editarEntregable(entregable) {
  setIdEditando(entregable.id);
  setNombre(entregable.nombre);
  setFecha(entregable.fecha);
  setDescripcion(entregable.descripcion || "");
  setPeso(entregable.peso ?? "");
  setObligatorio(entregable.obligatorio || false);
  setMostrarFormulario(true);
}
function obtenerAlerta(entregable) {
  if (entregable.estado !== "Pendiente") {
    return "Sin alerta";
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaLimite = new Date(entregable.fecha + "T00:00:00");

  const diferencia = fechaLimite - hoy;
  const dias = Math.round(diferencia / (1000 * 60 * 60 * 24));

  if (dias < 0) {
    return "Vencido";
  }

  if (dias <= 3) {
    return "Próximo a vencer";
  }

  return "A tiempo";
}

function guardarAvance() {
  if (
    enlaceAvance.trim() === "" ||
    descripcionAvance.trim() === "" ||
    versionAvance === ""
  ) {
    alert("Completa todos los campos del avance");
    return;
  }

  if (Number(versionAvance) < 1 || !Number.isInteger(Number(versionAvance))) {
    alert("La versión debe ser un número entero mayor o igual a 1");
    return;
  }

  const hoy = new Date();

  const fechaHoy = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0")
  ].join("-");

  setEntregables(
    entregables.map((entregable) => {
      if (entregable.id === idAvance) {
        return {
          ...entregable,
          enlaceAvance: enlaceAvance,
          descripcionAvance: descripcionAvance,
          versionAvance: Number(versionAvance),
          estado: fechaHoy > entregable.fecha
            ? "Entregado con retraso"
            : "Entregado"
        };
      }

      return entregable;
    })
  );

  setEnlaceAvance("");
  setDescripcionAvance("");
  setVersionAvance("");
  setIdAvance(null);
}
function cambiarEstado(id, nuevoEstado) {
  setEntregables(
    entregables.map((entregable) =>
      entregable.id === id
        ? { ...entregable, estado: nuevoEstado }
        : entregable
    )
  );
}

function cargarPlantilla() {
  const confirmar = window.confirm(
    "¿Deseas cargar la plantilla? Se reemplazarán los entregables actuales."
  );

  if (!confirmar) {
    return;
  }

  setEntregables([
    {
      id: 1,
      nombre: "Propuesta de investigación",
      descripcion: "Presentación del tema y objetivos",
      fecha: "2026-11-01",
      peso: 20,
      obligatorio: true,
      estado: "Pendiente"
    },
    {
      id: 2,
      nombre: "Marco teórico",
      descripcion: "Investigación de antecedentes",
      fecha: "2026-11-15",
      peso: 30,
      obligatorio: true,
      estado: "Pendiente"
    },
    {
      id: 3,
      nombre: "Informe final",
      descripcion: "Presentación del trabajo completo",
      fecha: "2026-12-10",
      peso: 50,
      obligatorio: true,
      estado: "Pendiente"
    }
  ]);
}



  return (
    <div className="hu4-contenedor">
      <h1>Plan de entregables</h1>
      <p>Seguimiento de trabajos de fin de carrera</p>

      <h2>Mis entregables</h2>
      <button type="button" onClick={cargarPlantilla}>
  Cargar plantilla
</button>
      <button
  type="button"
  onClick={() => setMostrarFormulario(!mostrarFormulario)}
>
  Agregar entregable
</button>

{mostrarFormulario && (
  <div>
    <h3>Nuevo entregable</h3>

    <input
  type="text"
  placeholder="Nombre del entregable"
  value={nombre}
  onChange={(e) => setNombre(e.target.value)}
/>

<input
  type="date"
  value={fecha}
  onChange={(e) => setFecha(e.target.value)}
/>
<textarea
  placeholder="Descripción del entregable"
  value={descripcion}
  onChange={(e) => setDescripcion(e.target.value)}
/>

<input
  type="number"
  placeholder="Peso del entregable (%)"
  min="1"
  max="100"
  value={peso}
  onChange={(e) => setPeso(e.target.value)}
/>

<label>
  <input
    type="checkbox"
    checked={obligatorio}
    onChange={(e) => setObligatorio(e.target.checked)}
  />
  Obligatorio
</label>

<button type="button" onClick={agregarEntregable}>
  {idEditando !== null ? "Guardar cambios" : "Guardar"}
</button>
  </div>
)}
{idAvance !== null && (
  <div>
    <h3>Registrar avance</h3>

    <input
      type="url"
      placeholder="Enlace del trabajo"
      value={enlaceAvance}
      onChange={(e) => setEnlaceAvance(e.target.value)}
    />

    <textarea
      placeholder="Descripción del avance"
      value={descripcionAvance}
      onChange={(e) => setDescripcionAvance(e.target.value)}
    />

    <input
      type="number"
      placeholder="Número de versión"
      min="1"
      value={versionAvance}
      onChange={(e) => setVersionAvance(e.target.value)}
    />

    <button type="button" onClick={guardarAvance}>
  Guardar avance
</button>

    <button
      type="button"
      onClick={() => setIdAvance(null)}
    >
      Cancelar
    </button>
  </div>
)}

      <table border="1" cellPadding="10">
        <thead>
          <tr>
                <th>Nombre</th>
    <th>Descripción</th>
    <th>Fecha límite</th>
    <th>Peso (%)</th>
    <th>Obligatorio</th>
    <th>Estado</th>
<th>Cambiar estado</th>
<th>Alerta</th>
<th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {[...entregables]
  .sort((a, b) => a.fecha.localeCompare(b.fecha))
  .map((entregable) => (
            <tr key={entregable.id}>
              <td>{entregable.nombre}</td>
<td>{entregable.descripcion || "Sin descripción"}</td>
<td>{entregable.fecha}</td>
<td>{entregable.peso ?? "Sin definir"}</td>
<td>{entregable.obligatorio ? "Sí" : "No"}</td>
<td>{entregable.estado}</td>
<td>
  <select
    value={entregable.estado}
    onChange={(e) => cambiarEstado(entregable.id, e.target.value)}
  >
    <option value="Pendiente">Pendiente</option>
    <option value="Entregado">Entregado</option>
    <option value="Entregado con retraso">Entregado con retraso</option>
    <option value="Observado">Observado</option>
    <option value="Aprobado">Aprobado</option>
  </select>
</td>
<td>{obtenerAlerta(entregable)}</td>
<td>
  <button
    type="button"
    onClick={() => editarEntregable(entregable)}
  >
    Editar
  </button>
  <button
  type="button"
  onClick={() => setIdAvance(entregable.id)}
>
  Registrar avance
</button>

{entregable.enlaceAvance && (
  <button
    type="button"
    onClick={() =>
      alert(
        "Descripción: " + entregable.descripcionAvance +
        "\nVersión: " + entregable.versionAvance +
        "\nEnlace: " + entregable.enlaceAvance
      )
    }
  >
    Ver avance
  </button>
)}


  <button
    type="button"
    onClick={() => eliminarEntregable(entregable.id)}
  >
    Eliminar
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
      
<h2>Línea de tiempo de entregables</h2>

<div>
  {[...entregables]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((entregable) => (
      <div
        key={entregable.id}
        style={{
          borderLeft: "4px solid #6c63ff",
          padding: "10px",
          marginBottom: "15px",
          textAlign: "left"
        }}
      >
        <strong>{entregable.fecha}</strong>

        <p>{entregable.nombre}</p>

        <p>Estado: {entregable.estado}</p>
      </div>
    ))}
</div>

    </div>
  );
}

export default PlanEntregables;
