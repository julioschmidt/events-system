/* eslint-disable @typescript-eslint/no-explicit-any */
import { openDB } from 'idb';
import api from '../api';

// Inicializa ou atualiza o banco de dados
export const initDB = async () => {
  return await openDB('checkinDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('registrations')) {
        db.createObjectStore('registrations', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains('events')) {
        db.createObjectStore('events', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('users')) {
        const usersStore = db.createObjectStore('users', { keyPath: 'id' });
        usersStore.createIndex('by_email', 'email', { unique: true });
      }
    },
  });
};

// Função para buscar o userId a partir do email
export async function getUserIdByEmail(email: string): Promise<any> {
  const db = await initDB();

  try {
    const user = await db.getFromIndex('users', 'by_email', email);
    return user ? user.id : null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

export async function getUserEmailById(id: number): Promise<any> {
  const db = await initDB();

  try {
    const user = await db.get('users', id);
    return user ? user.email : null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

// Sincroniza dados locais para a API
export const syncLocalDataToAPI = async (storeName: string, apiUrl: string) => {
  const data = await getAllDataFromIndexedDB(storeName);

  console.log(storeName);
  console.log(data);

  if (!data || data.length === 0) {
    console.error('Não há dados para sincronizar');
    return true;
  }

  try {
    // Mapeia cada item para uma Promise
    const promises = data.map(async (item) => {
      if (storeName === 'registrations') {
        let userId = item.userId;
        if (item.userEmail) {
          userId = await getUserIdByEmail(item.userEmail);
        }

        item = {
          eventId: item.eventId,
          userId: userId,
          status: item.status ?? 'ACTIVE',
        };
      }

      try {
        // Realiza a chamada à API
        const response = await api.post(apiUrl, item, {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Dados sincronizados:', response.data);
      } catch (error) {
        console.error('Erro ao sincronizar dados:', error);
        throw error; // Opcional: pode interromper o `Promise.all` em caso de erro
      }
    });

    // Aguarda todas as Promises serem resolvidas
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Erro durante a sincronização:', error);
    return false;
  }
};

export const fetchAndSaveDataFromAPI = async (
  apiUrl: string,
  storeName: string
) => {
  const response = api
    .get(apiUrl)
    .then((response) => {
      saveDataToIndexedDB(storeName, response.data);
      return response;
    })
    .catch((error) => {
      console.error('Erro ao buscar dados da API:', error);
      throw error;
    });
  return response;
};

// Adiciona ou atualiza dados no IndexedDB

export const saveDataToIndexedDB = async (storeName: string, data: any) => {
  console.log('entrou');
  console.log(storeName);
  console.log(data);
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  for (const item of data) {
    console.log(item);
    await store.put(item); // 'put' insere ou atualiza
  }
};

// Busca todos os dados de uma store
export const getAllDataFromIndexedDB = async (storeName: string) => {
  const db = await initDB();
  return await db.getAll(storeName);
};

export const clearStore = async (storeName: string) => {
  const db = await initDB(); // Inicializa o banco de dados
  const tx = db.transaction(storeName, 'readwrite'); // Inicia uma transação em modo de leitura e escrita
  const store = tx.objectStore(storeName); // Acessa a store 'users'
  await store.clear(); // Limpa todos os dados da store
  console.log(`Store ${storeName} limpa com sucesso!`);
};

export const updateRegistrationByEventAndEmail = async (
  eventId: number,
  userEmail: string,
  updatedData: Partial<any> // Dados a serem atualizados
) => {
  const db = await initDB(); // Inicializa o banco de dados

  const tx = db.transaction('registrations', 'readwrite');
  const store = tx.objectStore('registrations');

  // Pega todos os registros
  const allRecords = await store.getAll();

  // Encontra o registro correspondente
  const recordToUpdate = allRecords.find(
    (record) => record.eventId === eventId && record.userEmail === userEmail
  );

  if (recordToUpdate) {
    // Atualiza apenas os campos especificados
    const updatedRecord = { ...recordToUpdate, ...updatedData };
    await store.put(updatedRecord); // Salva o registro atualizado
    console.log('Registro atualizado com sucesso:', updatedRecord);
  } else {
    console.error('Registro não encontrado com os critérios especificados');
  }

  await tx.done; // Garante que a transação está concluída
};
