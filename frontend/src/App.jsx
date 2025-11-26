import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import JefeCocinaPanel from "./pages/JefeCocinaPanel";
import MeseroPanel from "./pages/MeseroPanel";
import AuxComprasPanel from "./pages/AuxComprasPanel";
import DirectorComprasPanel from "./pages/DirectorComprasPanel";
import DirectorComercialPanel from "./pages/DirectorComercialPanel";
import CocineroPanel from "./pages/CocineroPanel"; // Nuevo componente
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

        {/* DIRECTOR DE COMPRAS */}
        <Route
          path="/dir-compras"
          element={
            <ProtectedRoute allowedRoles={["dir_compras", "admin"]}>
              <DirectorComprasPanel />
            </ProtectedRoute>
          }
        />

        {/* DIRECTOR COMERCIAL */}
        <Route
          path="/dir-comercial"
          element={
            <ProtectedRoute allowedRoles={["dir_comercial", "admin"]}>
              <DirectorComercialPanel />
            </ProtectedRoute>
          }
        />

        {/* COCINERO */}
        <Route
          path="/cocinero"
          element={
            <ProtectedRoute allowedRoles={["cocinero", "admin"]}>
              <CocineroPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
