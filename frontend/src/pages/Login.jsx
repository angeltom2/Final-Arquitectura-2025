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
      const { token, usuario } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(usuario));

      Swal.fire({
        title: "Bienvenido",
        text: `Has iniciado sesión como ${usuario.rol.toUpperCase()}`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      // Redirección según rol
      switch (usuario.rol) {
        case "admin":
          navigate("/admin");
          break;
        case "jefe_cocina":
          navigate("/jefe-cocina");
          break;
        case "mesero":
          navigate("/mesero");
          break;
        case "cocinero":            // <-- agregar este caso
          navigate("/cocinero");
          break;
        case "aux_compras":
          navigate("/aux-compras");
          break;
        case "dir_compras":
          navigate("/dir-compras");
          break;
        case "dir_comercial":
          navigate("/dir-comercial");
          break;
        default:
          navigate("/");
      }
    } catch {
      Swal.fire("Error", "Credenciales incorrectas", "error");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-container">
          <img
            src="/logos/LogoLogin.png"
            alt="Logo Konrad Gourmet"
            className="logo"
          />
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
