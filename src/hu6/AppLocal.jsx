// SOLO PARA PROBAR LA HISTORIA 6 POR SEPARADO (no se integra al App del grupo).
// Para usarlo: en src/main.jsx cambiar
//   import App from './App.jsx'   →   import App from './hu6/AppLocal.jsx'
// y volver a dejarlo como estaba antes de hacer commit.
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProveedorSustentacion, RUTA_INICIAL_SUSTENTACION, rutasSustentacion } from "./index";

export default function AppLocal() {
  return (
    <BrowserRouter>
      <ProveedorSustentacion>
        <Routes>
          {rutasSustentacion}
          <Route path="*" element={<Navigate to={RUTA_INICIAL_SUSTENTACION} replace />} />
        </Routes>
      </ProveedorSustentacion>
    </BrowserRouter>
  );
}
