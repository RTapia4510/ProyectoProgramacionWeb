// Árbol de rutas: público, estudiante, asesor, administrador y compartidas.
import { Route, Routes } from 'react-router-dom';
import Theme from './styles/Theme.jsx';
import AppLayout from './components/Layout.jsx';
import { RequireRole } from './routes/Guards.jsx';

import Landing from './pages/public/Landing.jsx';
import Info from './pages/public/Info.jsx';
import Login from './pages/public/Login.jsx';
import RegisterStudent from './pages/public/RegisterStudent.jsx';
import RegisterAdvisor from './pages/public/RegisterAdvisor.jsx';
import Recover from './pages/public/Recover.jsx';

import Account from './pages/shared/Account.jsx';
import Directory from './pages/shared/Directory.jsx';
import Consolidated from './pages/shared/Consolidated.jsx';
import NotFound from './pages/shared/NotFound.jsx';

import MyWork from './pages/student/MyWork.jsx';
import WorkForm from './pages/student/WorkForm.jsx';
import Team from './pages/student/Team.jsx';
import MyWorks from './pages/student/MyWorks.jsx';
import Plan from './pages/student/Plan.jsx';
import Alerts from './pages/student/Alerts.jsx';
import { FeedbackHistory, FeedbackIndex } from './pages/student/Feedback.jsx';
import MySust from './pages/student/MySust.jsx';

import Mentees from './pages/advisor/Mentees.jsx';
import Requests from './pages/advisor/Requests.jsx';
import Profile from './pages/advisor/Profile.jsx';
import PlanEditor from './pages/advisor/PlanEditor.jsx';
import Inbox from './pages/advisor/Inbox.jsx';
import Review from './pages/advisor/Review.jsx';

import Dashboard from './pages/admin/Dashboard.jsx';
import Works from './pages/admin/Works.jsx';
import Load from './pages/admin/Load.jsx';
import Sustentaciones from './pages/admin/Sustentaciones.jsx';
import Program from './pages/admin/Program.jsx';
import Jury from './pages/admin/Jury.jsx';
import Acta from './pages/admin/Acta.jsx';
import Users from './pages/admin/Users.jsx';

export default function App() {
  return (
    <>
      <Theme />
      <Routes>
        <Route element={<AppLayout />}>
          {/* Público */}
          <Route path="/" element={<Landing />} />
          <Route path="/proceso" element={<Info tipo="proceso" />} />
          <Route path="/cronograma" element={<Info tipo="cronograma" />} />
          <Route path="/faq" element={<Info tipo="faq" />} />
          <Route path="/asesores" element={<Directory />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro/estudiante" element={<RegisterStudent />} />
          <Route path="/registro/asesor" element={<RegisterAdvisor />} />
          <Route path="/recuperar" element={<Recover />} />

          {/* Cualquier rol con sesión */}
          <Route element={<RequireRole roles={['estudiante', 'asesor', 'admin']} />}>
            <Route path="/cuenta" element={<Account />} />
          </Route>

          {/* Estudiante */}
          <Route element={<RequireRole roles={['estudiante']} />}>
            <Route path="/mi-trabajo" element={<MyWork />} />
            <Route path="/mi-trabajo/nuevo" element={<WorkForm />} />
            <Route path="/mi-trabajo/editar" element={<WorkForm editar />} />
            <Route path="/mi-trabajo/equipo" element={<Team />} />
            <Route path="/mi-trabajo/consolidado" element={<Consolidated />} />
            <Route path="/mis-trabajos" element={<MyWorks />} />
            <Route path="/entregables" element={<Plan />} />
            <Route path="/entregables/alertas" element={<Alerts />} />
            <Route path="/retroalimentacion" element={<FeedbackIndex />} />
            <Route path="/retroalimentacion/:entregableId" element={<FeedbackHistory />} />
            <Route path="/mi-sustentacion" element={<MySust />} />
          </Route>

          {/* Asesor */}
          <Route element={<RequireRole roles={['asesor']} />}>
            <Route path="/asesor/asesorados" element={<Mentees />} />
            <Route path="/asesor/asesorados/:id" element={<Consolidated />} />
            <Route path="/asesor/asesorados/:id/plan" element={<PlanEditor />} />
            <Route path="/asesor/solicitudes" element={<Requests />} />
            <Route path="/asesor/revision" element={<Inbox />} />
            <Route path="/asesor/revision/:avanceId" element={<Review />} />
            <Route path="/asesor/ficha" element={<Profile />} />
          </Route>

          {/* Administrador */}
          <Route element={<RequireRole roles={['admin']} />}>
            <Route path="/admin/tablero" element={<Dashboard />} />
            <Route path="/admin/trabajos" element={<Works />} />
            <Route path="/admin/carga" element={<Load />} />
            <Route path="/admin/sustentaciones" element={<Sustentaciones />} />
            <Route path="/admin/sustentaciones/nueva" element={<Program />} />
            <Route path="/admin/sustentaciones/:id/jurado" element={<Jury />} />
            <Route path="/admin/sustentaciones/:id/acta" element={<Acta />} />
            <Route path="/admin/usuarios" element={<Users />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
