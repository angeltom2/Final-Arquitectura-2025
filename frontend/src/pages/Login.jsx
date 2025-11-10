// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import "../pages/Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, contraseña });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.usuario));
      Swal.fire("Bienvenido", "Inicio de sesión exitoso", "success");
      navigate("/admin");
    } catch {
      Swal.fire("Error", "Credenciales incorrectas", "error");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-container">
          <img src="../logos/LogoLogin.png" alt="Logo Konrad Gourmet" className="logo" />
        </div>

        <h3 className="login-title">Iniciar Sesión</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Usuario"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
          <button type="submit">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );
}
