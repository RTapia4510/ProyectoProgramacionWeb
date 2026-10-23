// Cada pantalla de la Historia 6 envuelta en su ámbito de estilos (.h6).
// Este archivo solo exporta componentes (requisito de react-refresh).
import { useSearchParams } from "react-router-dom";
import BarraDemo from "./componentes/BarraDemo";
import ActaImpresion from "./pages/ActaImpresion";
import ActaSustentacion from "./pages/ActaSustentacion";
import ConformarJurado from "./pages/ConformarJurado";
import MiSustentacion from "./pages/MiSustentacion";
import ProgramarSustentacion from "./pages/ProgramarSustentacion";

// Todo el CSS de la feature cuelga de .h6: no pisa (ni es pisado por) Bootstrap ni otras historias.
function Ambito({ children }) {
  const [params] = useSearchParams();
  return (
    <div className="h6">
      {params.has("demo") && <BarraDemo />}
      {children}
    </div>
  );
}

export const PaginaProgramar = () => <Ambito><ProgramarSustentacion /></Ambito>;
export const PaginaJurado = () => <Ambito><ConformarJurado /></Ambito>;
export const PaginaActa = () => <Ambito><ActaSustentacion /></Ambito>;
export const PaginaActaAdmin = () => <Ambito><ActaImpresion origen="admin" /></Ambito>;
export const PaginaMiSustentacion = () => <Ambito><MiSustentacion /></Ambito>;
export const PaginaMiActa = () => <Ambito><ActaImpresion origen="estudiante" /></Ambito>;
