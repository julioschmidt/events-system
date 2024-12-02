/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { saveDataToIndexedDB } from '../utils/indexedDB';
import api from '../api';

interface UserData {
  id: number;
  name: string;
  email: string;
  password: string;
}

interface UserRegistrationFormProps {
  eventId?: number; // Tornar opcional, para o caso de não estar sempre presente
  handleCreatedUser?: (user: UserData) => void;
}

const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({
  eventId,
  handleCreatedUser,
}) => {
  const [formData, setFormData] = useState<UserData>({
    id: 0,
    name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Processando...');

    try {
      if (navigator.onLine) {
        // Envia os dados para a API
        const response = await api.post('/users', formData);
        console.log(formData);
        console.log(response.data);

        if (response.status !== 201 || !response.data) {
          throw new Error('Erro ao cadastrar usuário.');
        }

        if (eventId) {
          // Registra o usuário no evento
          const registerResponse = await api.post(`/registrations`, {
            eventId,
            userId: response.data.id,
          });

          if (registerResponse.status !== 200) {
            throw new Error('Erro ao registrar usuário no evento.');
          }
        }

        if (handleCreatedUser) {
          handleCreatedUser(response.data);
        }
        setMessage('Usuário cadastrado com sucesso na API!');
      } else {
        const user = { ...formData, id: Date.now() };
        // Salva localmente se offline
        await saveDataToIndexedDB('users', [user]);

        if (eventId) {
          await saveDataToIndexedDB('registrations', [
            { eventId, userEmail: formData.email, status: 'ACTIVE' },
          ]);
        }

        if (handleCreatedUser) {
          handleCreatedUser(user);
        }

        setMessage('Sem conexão. Usuário salvo localmente.');
      }
    } catch (error) {
      setMessage('Erro ao cadastrar usuário.');
    }

    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 border rounded shadow-lg max-w-md"
    >
      <div className="mb-4">
        <label htmlFor="name" className="block text-white">
          Nome:
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className="border rounded w-full p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-white">
          Email:
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="border rounded w-full p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-white">
          Senha:
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="border rounded w-full p-2"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 mb-4"
      >
        {eventId ? 'Registrar Usuário' : 'Cadastrar Usuário'}
      </button>

      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </form>
  );
};

export default UserRegistrationForm;
