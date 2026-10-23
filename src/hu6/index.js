// API pública de la Historia 6. Los demás módulos solo deben importar desde aquí.
// Importar este archivo también carga los estilos de la feature (todos bajo .h6).
import "./styles/sustentacion.css";

export { RUTAS_SUSTENTACION, RUTA_INICIAL_SUSTENTACION } from "./rutas";
export { default as ProveedorSustentacion } from "./context/ProveedorSustentacion";
export { useSustentaciones } from "./context/useSustentaciones";
export { rutasSustentacion } from "./rutasSustentacion";
