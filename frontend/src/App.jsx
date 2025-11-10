import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import JefeCocinaPanel from "./pages/JefeCocinaPanel";
import MeseroPanel from "./pages/MeseroPanel";
import AuxComprasPanel from "./pages/AuxComprasPanel";
import DirectorComercialPanel from "./pages/DirectorComercialPanel";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* JEFE DE COCINA */}
        <Route
          path="/jefe-cocina"
          element={
            <ProtectedRoute allowedRoles={["jefe_cocina", "admin"]}>
              <JefeCocinaPanel />
            </ProtectedRoute>
          }
        />

        {/* MESERO */}
        <Route
          path="/mesero"
          element={
            <ProtectedRoute allowedRoles={["mesero", "admin"]}>
              <MeseroPanel />
            </ProtectedRoute>
          }
        />

        {/* AUXILIAR DE COMPRAS */}
        <Route
          path="/aux-compras"
          element={
            <ProtectedRoute allowedRoles={["aux_compras", "admin"]}>
              <AuxComprasPanel />
            </ProtectedRoute>
          }
        />

        {/* DIRECTOR COMERCIAL */}
        <Route
          path="/director-comercial"
          element={
            <ProtectedRoute allowedRoles={["director_comercial", "admin"]}>
              <DirectorComercialPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
