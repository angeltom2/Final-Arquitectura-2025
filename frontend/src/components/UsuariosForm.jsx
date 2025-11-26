import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../styles/UsuarioForm.css";

export default function UsuarioForm({ onSave, editingUser, setEditingUser }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    contraseña: "",
    rol: "",
    activo: true,
  });

  useEffect(() => {
    if (editingUser) {
      setForm({
        nombre: editingUser?.nombre || "",
        email: editingUser?.email || "",
        contraseña: "",
        rol: editingUser?.rol || "",
        activo: editingUser?.activo ?? true,
      });
    } else {
      setForm({
        nombre: "",
        email: "",
        contraseña: "",
        rol: "",
        activo: true,
      });
    }
  }, [editingUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 📌 VALIDACIÓN #1: Email con @
    if (!form.email.includes("@")) {
      return Swal.fire({
        icon: "error",
        title: "Email inválido",
        text: "El correo debe contener un '@'.",
      });
    }

    // 📌 VALIDACIÓN #2: Contraseña mínimo 6 caracteres (solo al crear)
    if (!editingUser && form.contraseña.length < 6) {
      return Swal.fire({
        icon: "error",
        title: "Contraseña demasiado corta",
        text: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    // Si todo está bien ✔
    onSave(form);
  };

  return (
    <form className="usuario-form" onSubmit={handleSubmit}>
      <h2>{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</h2>

      <input
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Nombre"
        required
      />

      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />

      {!editingUser && (
        <input
          name="contraseña"
          type="password"
          value={form.contraseña}
          onChange={handleChange}
          placeholder="Contraseña"
          required
        />
      )}

      <select name="rol" value={form.rol} onChange={handleChange} required>
        <option value="">Selecciona un rol</option>
        <option value="jefe_cocina">Jefe de Cocina</option>
        <option value="mesero">Mesero</option>
        <option value="aux_compras">Auxiliar de Compras</option>
        <option value="dir_compras">Director Área de Compras</option>
        <option value="dir_comercial">Director Comercial</option>
        <option value="cocinero">Cocinero</option> 
      </select>

      {editingUser && (
        <div className="checkbox-container">
          <label className="switch">
            <input
              type="checkbox"
              name="activo"
              checked={!!form.activo}
              onChange={handleChange}
            />
            <span className="slider round"></span>
          </label>
          <span className="checkbox-label">Usuario activo</span>
        </div>
      )}

      <div className="buttons">
        <button type="submit">{editingUser ? "Actualizar" : "Crear"}</button>

        {editingUser && (
          <button type="button" onClick={() => setEditingUser(null)}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
