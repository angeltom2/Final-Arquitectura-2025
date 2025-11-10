import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import UsuariosTable from "../components/UsuariosTable";
import UsuarioForm from "../components/UsuariosForm";
import Inventario from "../pages/Inventario"; // 👈 Importamos la vista de inventario
import "../styles/AdminPanel.css";

export default function AdminPanel() {
  const [usuarios, setUsuarios] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [activeSection, setActiveSection] = useState("usuarios");

  // 🧩 Cargar usuarios
  const fetchUsuarios = async () => {
    try {
      const res = await api.get("/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
    }
  };

  useEffect(() => {
    if (activeSection === "usuarios") fetchUsuarios();
  }, [activeSection]);

  // 📝 Crear o actualizar usuario
  const handleSave = async (data) => {
    try {
      if (editingUser) {
        await api.put(`/usuarios/${editingUser.id}`, data);
        Swal.fire("Actualizado", "Usuario modificado correctamente", "success");
      } else {
        await api.post("/usuarios", data);
        Swal.fire("Creado", "Usuario agregado correctamente", "success");
      }
      fetchUsuarios();
      setEditingUser(null);
    } catch (err) {
      Swal.fire("Error", "No se pudo guardar el usuario", "error");
    }
  };

  // ❌ Eliminar usuario
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/usuarios/${id}`);
        Swal.fire("Eliminado", "Usuario borrado correctamente", "success");
        fetchUsuarios();
      } catch {
        Swal.fire("Error", "No se pudo eliminar el usuario", "error");
      }
    }
  };

  // 🚪 Cerrar sesión con confirmación
  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: "¿Desea cerrar sesión?",
      text: "Tendrá que iniciar sesión nuevamente para acceder al panel.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#b33a2c",
      cancelButtonColor: "#999",
    });

    if (confirm.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      Swal.fire({
        title: "Sesión cerrada",
        text: "Hasta pronto 👋",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      setTimeout(() => (window.location.href = "/"), 1500);
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Admin</h2>
        <ul>
          <li
            className={activeSection === "usuarios" ? "active" : ""}
            onClick={() => setActiveSection("usuarios")}
          >
            👤 Gestión de Usuarios
          </li>
          <li
            className={activeSection === "inventario" ? "active" : ""}
            onClick={() => setActiveSection("inventario")}
          >
            📦 Gestión de Inventario
          </li>
        </ul>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        {activeSection === "usuarios" && (
          <>
            <h1>👥 Gestión de Usuarios</h1>
            <UsuarioForm
              onSave={handleSave}
              editingUser={editingUser}
              setEditingUser={setEditingUser}
            />
            <UsuariosTable
              usuarios={usuarios}
              onEdit={setEditingUser}
              onDelete={handleDelete}
            />
          </>
        )}

        {activeSection === "inventario" && <Inventario />}
      </main>
    </div>
  );
}
