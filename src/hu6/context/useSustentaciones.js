import { useContext } from "react";
import { SustentacionContext } from "./SustentacionContext";

export function useSustentaciones() {
  const contexto = useContext(SustentacionContext);
  if (!contexto) {
    throw new Error("useSustentaciones debe usarse dentro de <ProveedorSustentacion>.");
  }
  return contexto;
}
