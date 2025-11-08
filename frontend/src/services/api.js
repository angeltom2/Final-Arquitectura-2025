// frontend/src/services/api.js
import axios from 'axios';

// Asegúrate que esta URL venga del entorno o use localhost:4000/api por defecto
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
  timeout: 5000,
});

// Exportación directa del cliente axios
export default api;
