// frontend/src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import AuthContext from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // crea un CSS pequeño si quieres

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, "contraseña": password }); // ✅ BIEN (con comillas)
      const { token, usuario } = res.data;
      login(token, usuario);
      await Swal.fire({ icon: 'success', title: 'Bienvenido', text: `Hola ${usuario.nombre}` });
      // redirige según rol (por ahora admin)
      if (usuario.rol === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      const message = err?.response?.data?.message || 'Error al iniciar sesión';
      Swal.fire({ icon: 'error', title: 'Login fallido', text: message });
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <label>Contraseña</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
