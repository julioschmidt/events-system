import { useState, useEffect } from 'react';
import { openDB } from 'idb';  // Biblioteca auxiliar para IndexedDB

interface CheckinData {
  userId: string;
  timestamp: number;
}

export const useCheckin = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Função para abrir ou criar o banco de dados IndexedDB
  const initDB = async () => {
    return await openDB('checkinDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('checkins')) {
          db.createObjectStore('checkins', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  };

  // Função para adicionar check-in ao banco de dados
  const addCheckin = async (data: CheckinData) => {
    const db = await initDB();
    await db.add('checkins', data);
  };

  // Função para sincronizar check-ins com o servidor
  const syncCheckins = async () => {
    const db = await initDB();
    const allCheckins = await db.getAll('checkins');

    // Simulação de sincronização com API
    for (const checkin of allCheckins) {
      try {
        await fetch('/api/presencas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkin),
        });
        // Após sincronizar, removemos o check-in local
        await db.delete('checkins', checkin.id);
      } catch (error) {
        console.error('Erro ao sincronizar:', error);
      }
    }
  };

  // Monitora a mudança no status da conexão
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) syncCheckins(); // Sincroniza ao reconectar
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Função pública para registrar check-in
  const handleCheckin = async (data: CheckinData) => {
    if (isOnline) {
      // Se online, envia diretamente para o servidor
      await fetch('/api/presencas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      // Se offline, salva no IndexedDB
      await addCheckin(data);
    }
  };

  return { handleCheckin, isOnline };
};