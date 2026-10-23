// Barra SOLO para presentar: cambia de rol y de estado sin backend.
// Aparece únicamente si la URL lleva ?demo (ej. /sustentaciones/programar?demo).
// Se puede borrar junto con su uso en paginas.jsx.
import { useLocation } from "react-router-dom";
import { useSustentaciones } from "../context/useSustentaciones";
import { useIrA } from "../utils/useIrA";

const PANTALLAS_ADMIN = [
  { ruta: "/sustentaciones/programar", texto: "6.1 Programar" },
  { ruta: "/sustentaciones/jurado", texto: "6.2 Jurado" },
  { ruta: "/sustentaciones/acta", texto: "6.3 Acta" },
  { ruta: "/sustentaciones/acta/imprimir", texto: "Acta A4" },
];

export default function BarraDemo() {
  const { dispatch } = useSustentaciones();
  const irA = useIrA();
  const { pathname } = useLocation();
  const esEstudiante = pathname.startsWith("/mi-sustentacion");
  const ir = (ruta) => irA(`${ruta}?demo`);

  const ver = (preset) => {
    dispatch({ tipo: "PRESET", preset });
    ir("/mi-sustentacion");
  };

  return (
    <div className="demo no-print">
      <strong>Vista demo</strong>
      <div className="demo__grupo">
        <span>Administrador:</span>
        {PANTALLAS_ADMIN.map((p) => (
          <button key={p.ruta} type="button" className={pathname === p.ruta ? "demo__btn demo__btn--activo" : "demo__btn"} onClick={() => ir(p.ruta)}>
            {p.texto}
          </button>
        ))}
      </div>
      <div className="demo__grupo">
        <span>Estudiante:</span>
        <button type="button" className={esEstudiante ? "demo__btn demo__btn--activo" : "demo__btn"} onClick={() => ir("/mi-sustentacion")}>Mi sustentación</button>
        <button type="button" className="demo__btn" onClick={() => ver("sin")}>Sin programar</button>
        <button type="button" className="demo__btn" onClick={() => ver("programada")}>Programada</button>
        <button type="button" className="demo__btn" onClick={() => ver("realizada")}>Realizada</button>
      </div>
      <button type="button" className="demo__btn demo__btn--reset" onClick={() => { dispatch({ tipo: "REINICIAR" }); ir("/sustentaciones/programar"); }}>
        Restablecer datos
      </button>
    </div>
  );
}
