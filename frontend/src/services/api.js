import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const instance = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

export default {
  instance,
  getBaseUrl: () => API_BASE,
};
