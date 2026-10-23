// Rutas de la Historia 6 listas para pegar dentro de <Routes> del App del grupo.
// Uso en el App.jsx del grupo:
//   import { ProveedorSustentacion, rutasSustentacion } from "./hu6";
//   <ProveedorSustentacion>
//     <Routes> ...rutas del grupo... {rutasSustentacion} </Routes>
//   </ProveedorSustentacion>
import { Route } from "react-router-dom";
import { RUTAS_SUSTENTACION } from "./rutas";

export const rutasSustentacion = RUTAS_SUSTENTACION.map(({ path, Componente }) => (
  <Route key={path} path={path} element={<Componente />} />
));
