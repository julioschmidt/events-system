/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from 'jwt-decode';
import api from '../api';

export const adminUserService = {
  getAdminUser: async () => {
    try {
      if (navigator.onLine) {
        // Tenta buscar dados da API quando online
        const response = await api.get('/users/token');
        const { admin } = response.data.data;
        return admin as boolean;
      } else {
        // Quando offline, busca o token no localStorage e decodifica
        const token = localStorage.getItem('token');

        if (token) {
          try {
            const decodedToken = jwtDecode<any>(token); // Altere <any> para o tipo correto se souber
            const admin = decodedToken?.admin || false; // Verifica se a chave admin está no token
            return admin;
          } catch (decodeError) {
            console.error('Erro ao decodificar o token:', decodeError);
            return false;
          }
        } else {
          console.error('Token não encontrado no localStorage');
          return false;
        }
      }
    } catch (error) {
      // Em caso de erro (como falha na rede), retorna false
      console.error('Erro ao buscar eventos da API:', error);
      return false;
    }
  },
};
