/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  syncLocalDataToAPI,
  fetchAndSaveDataFromAPI,
  clearStore,
} from '../utils/indexedDB';

const SyncButton: React.FC = () => {
  const [message, setMessage] = useState<string>(''); // Estado para a mensagem de feedback

  const handleSync = async () => {
    setMessage('Sincronizando...'); // Mensagem inicial

    try {
      const userSyncResponse = await syncLocalDataToAPI('users', '/users');
      if (!userSyncResponse) {
        throw new Error('Erro ao sincronizar usuários.');
      }

      await clearStore('users');

      const usersResponse = await fetchAndSaveDataFromAPI('/users', 'users');

      const registrationSyncResponse = await syncLocalDataToAPI(
        'registrations',
        '/registrations'
      );

      if (!registrationSyncResponse) {
        throw new Error('Erro ao sincronizar registros.');
      }

      await clearStore('registrations');

      const registrationsResponse = await fetchAndSaveDataFromAPI(
        '/registrations',
        'registrations'
      );

      await clearStore('events');

      // Atualiza o IndexedDB com dados mais recentes da API
      const eventsResponse = await fetchAndSaveDataFromAPI('/events', 'events');

      if (
        !eventsResponse.data ||
        !usersResponse.data ||
        !registrationsResponse.data
      ) {
        throw new Error('Erro ao buscar dados da API.');
      }

      setMessage('Sincronização concluída com sucesso!'); // Mensagem de sucesso
    } catch (error) {
      setMessage('Erro ao sincronizar. Tente novamente.'); // Mensagem de erro
    }

    // Remove a mensagem após alguns segundos (opcional)
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleSync}
        className="bg-green-500 text-white py-2 px-4 rounded"
      >
        Sincronizar Dados
      </button>
      {message && <p className="text-sm text-white">{message}</p>}{' '}
      {/* Exibe a mensagem */}
    </div>
  );
};

export default SyncButton;
