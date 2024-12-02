import {
  getAllDataFromIndexedDB,
  saveDataToIndexedDB,
} from '../utils/indexedDB';
import api from '../api';

export const eventService = {
  getEvents: async () => {
    try {
      // Tenta acessar a API se estiver online
      if (navigator.onLine) {
        const response = await api.get('/events');
        // Atualiza o IndexedDB com os dados mais recentes
        await saveDataToIndexedDB('events', response.data);
        return response.data;
      } else {
        // Caso esteja offline, busca do IndexedDB
        console.warn(
          'Sem conexão com a internet. Buscando eventos localmente.'
        );
        const localData = await getAllDataFromIndexedDB('events');
        return localData;
      }
    } catch (error) {
      // Em caso de erro (como falha na rede), busca do IndexedDB
      console.error('Erro ao buscar eventos da API:', error);
      const localData = await getAllDataFromIndexedDB('events');
      return localData;
    }
  },
};
