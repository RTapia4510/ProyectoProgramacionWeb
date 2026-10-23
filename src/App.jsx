import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PlanEntregables from './hu4/PlanEntregables';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<PlanEntregables />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
