import { useEffect } from 'react';
import { saveDataToIndexedDB } from '../utils/indexedDB';

export const useSyncData = () => {
  const fetchAndSaveData = async () => {
    try {
      const eventsResponse = await fetch('/api/events');
      const usersResponse = await fetch('/api/users');
      const events = await eventsResponse.json();
      const users = await usersResponse.json();

      // Salva os dados localmente
      await saveDataToIndexedDB('events', events);
      await saveDataToIndexedDB('users', users);
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
    }
  };

  useEffect(() => {
    fetchAndSaveData(); // Sincroniza ao carregar o app

    // Re-sincroniza a cada X minutos
    const interval = setInterval(() => {
      fetchAndSaveData();
    }, 5 * 60 * 1000); // Exemplo: a cada 5 minutos

    return () => clearInterval(interval);
  }, []);
};