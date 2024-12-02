import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth/login';

export const authService = {
  login: async (data: { email: string, password: string }) => {
    const response = await axios.post(API_URL, data);
    localStorage.setItem('token', response.data.token);  // Armazena o token JWT
  },
};