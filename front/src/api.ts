import axios from 'axios';

// Crie uma instância do axios
const api = axios.create({
  baseURL: 'http://177.44.248.73:3000/api', // Altere para a URL da sua API
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
