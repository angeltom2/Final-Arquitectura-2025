import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import UsuariosTable from "../components/UsuariosTable";
import UsuarioForm from "../components/UsuariosForm";
import "../styles/AdminPanel.css";

export default function AdminPanel() {
  const [usuarios, setUsuarios] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  // 🧩 Cargar usuarios al entrar
  const fetchUsuarios = async () => {
    try {
      const res = await api.get("/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

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

  return (
    <div className="admin-panel">
      <h1>Panel de Administración</h1>
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
    </div>
  );
}
