// frontend/src/components/UsuariosTable.jsx
import React from "react";
import "../styles/UsuariosTable.css";

export default function UsuariosTable({ usuarios, onEdit, onDelete }) {
  return (
    <table className="usuarios-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((u) => (
          <tr key={u.id}>
            <td>{u.id}</td>
            <td>{u.nombre}</td>
            <td>{u.email}</td>
            <td>{u.rol}</td>
            <td>
              {u.activo ? (
                <span style={{ color: "green" }}>✔️</span>
              ) : (
                <span style={{ color: "red" }}>❌</span>
              )}
            </td>
            <td>
              <button onClick={() => onEdit(u)}>Editar</button>
              <button onClick={() => onDelete(u.id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
