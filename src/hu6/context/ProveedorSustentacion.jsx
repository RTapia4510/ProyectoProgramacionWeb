// Proveedor del estado de la Historia 6. Envolver con él las rutas de sustentación.
// Sin backend, el estado se guarda en localStorage para que sobreviva a recargar la página.
import { useEffect, useMemo, useReducer } from "react";
import { SustentacionContext } from "./SustentacionContext";
import { estadoInicial, reductor } from "./reductor";

const CLAVE = "tfc.historia6.estado.v1"; // subir el número si cambia la forma del estado

const cargar = () => {
  try {
    const guardado = window.localStorage.getItem(CLAVE);
    if (guardado) {
      const e = JSON.parse(guardado);
      if (Array.isArray(e?.trabajos) && Array.isArray(e?.sustentaciones)) return e;
    }
  } catch {
    // localStorage bloqueado o JSON dañado: se usan los datos de ejemplo
  }
  return estadoInicial();
};

export default function ProveedorSustentacion({ children }) {
  const [estado, dispatch] = useReducer(reductor, undefined, cargar);

  useEffect(() => {
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch {
      // sin espacio o bloqueado: la app sigue funcionando solo en memoria
    }
  }, [estado]);

  const valor = useMemo(() => ({ estado, dispatch }), [estado]);
  return <SustentacionContext.Provider value={valor}>{children}</SustentacionContext.Provider>;
}
