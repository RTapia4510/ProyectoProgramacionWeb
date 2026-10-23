
import { useState } from "react";
import "./App.css";

import ProgramarSustentacion from "./pages/ProgramarSustentacion";
import ConformarJurado from "./pages/ConformarJurado";
import ActaSustentacion from "./pages/ActaSustentacion";
import MiSustentacion from "./pages/MiSustentacion";
import ResultadoSustentacion from "./pages/ResultadoSustentacion";
import ActaImprimible from "./pages/ActaImprimible";

function App() {
  const [pantalla, setPantalla] = useState("programar");
  const [sustentacionActual, setSustentacionActual] = useState(null);
  const [juradoActual, setJuradoActual] = useState(null);
  const [origenActa, setOrigenActa] = useState("acta");

  function navegar(destino) {
    setPantalla(destino);
    window.scrollTo(0, 0);
  }

  function irAJurado(sustentacion) {
    setSustentacionActual(sustentacion);
    setJuradoActual(null);
    navegar("jurado");
  }

  function irAActa(datosJurado) {
    setJuradoActual(datosJurado);
    navegar("acta");
  }

  function verActaImprimible(origen) {
    setOrigenActa(origen);
    navegar("imprimible");
  }

function tieneActaRegistrada() {
  if (!sustentacionActual?.id) return false;

  try {
    return Boolean(
      localStorage.getItem(
        `hu6-acta-registrada-${sustentacionActual.id}`
      )
    );
  } catch {
    return false;
  }
}
  return (
    <>
      {pantalla === "programar" && (
        <ProgramarSustentacion
          onIrJurado={irAJurado}
        />
      )}

      {pantalla === "jurado" && (
        <ConformarJurado
          sustentacion={sustentacionActual}
          onVolver={() => navegar("programar")}
          onIrActa={irAActa}
        />
      )}

      {pantalla === "acta" && (
        <ActaSustentacion
          sustentacion={sustentacionActual}
          jurado={juradoActual}
          onVolver={() => navegar("jurado")}
          onIrEstudiante={() => navegar("estudiante")}
          onVerActa={() => {
  if (tieneActaRegistrada()) {
    verActaImprimible("acta");
  } else {
    alert("Primero debes registrar el acta.");
  }
}}
        />
      )}

      {pantalla === "estudiante" && (
        <MiSustentacion
          sustentacion={sustentacionActual}
          jurado={juradoActual}
          onVolver={() => navegar("acta")}
          onVerResultado={() => {
  if (tieneActaRegistrada()) {
    navegar("resultado");
  } else {
    alert("Todavía no existe un acta registrada.");
  }
}}
        />
      )}

      {pantalla === "resultado" && (
        <ResultadoSustentacion
          sustentacion={sustentacionActual}
          jurado={juradoActual}
          onVolver={() => navegar("estudiante")}
          onVerActa={() => verActaImprimible("resultado")}
        />
      )}

      {pantalla === "imprimible" && (
        <ActaImprimible
          sustentacion={sustentacionActual}
          jurado={juradoActual}
          onVolver={() => navegar(origenActa)}
        />
      )}
    </>
  );
}

export default App;

