import React, { useEffect, useState } from 'react';
import api from '../api';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface Registration {
  id: number;
  eventId: number;
  status: string;
  event: Event; // Event nested within registration
}

interface User {
  id: number;
  name: string;
}

const UserRegistrations: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserAndRegistrations = async () => {
      try {
        // Buscar o usuário atual pela rota /users/token
        const userResponse = await api.get('/users/token');
        setUser(userResponse.data.data);

        // Buscar todas as registrations do usuário pela rota /registrations/:userId
        const registrationsResponse = await api.get(
          `/registrations/${userResponse.data.data.id}`
        );
        if (registrationsResponse.data) {
          setRegistrations(registrationsResponse.data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário e inscrições:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRegistrations();
  }, []);

  const handleCancelRegistration = async (registrationId: number) => {
    try {
      await api.delete(`/registrations/${registrationId}`);
      alert('Inscrição cancelada com sucesso!');
      // Atualizar a lista de inscrições após o cancelamento
      setRegistrations(
        registrations.filter((reg) => reg.id !== registrationId)
      );
    } catch (error) {
      console.error('Erro ao cancelar a inscrição:', error);
    }
  };

  if (loading) return <p>Carregando inscrições...</p>;
  if (!user) return <p>Usuário não encontrado.</p>;

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="p-6 border rounded shadow-lg max-w-md">
        <h1 className="text-2xl font-bold mb-4">Suas Inscrições</h1>
        {registrations.length === 0 ? (
          <p>Você não está registrado em nenhum evento.</p>
        ) : (
          <ul>
            {registrations.map((registration) => (
              <li key={registration.id} className="mb-4 border-b pb-2">
                <h2 className="text-lg font-semibold">
                  {registration.event.title}
                </h2>
                <p>{registration.event.description}</p>
                <p>
                  Data: {new Date(registration.event.date).toLocaleDateString()}
                </p>
                <p>Status: {registration.status}</p>
                <button
                  onClick={() => handleCancelRegistration(registration.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 mt-2"
                >
                  Cancelar Inscrição
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserRegistrations;
