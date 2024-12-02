import React, { useEffect, useState } from 'react';
import api from '../api'; // Importe seu arquivo api.js ou api.ts

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface Checkin {
  id: number;
  eventId: number;
  userId: number;
  event: Event;
}

const UserCheckins: React.FC = () => {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [user, setUser] = useState<{ id: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserAndCheckins = async () => {
      try {
        // Buscar o usuário pela rota de tokens
        const userResponse = await api.get('/users/token');
        setUser(userResponse.data.data);

        // Buscar os check-ins do usuário
        const checkinResponse = await api.get(
          `/registrations/${userResponse.data.data.id}/checkins`
        );
        setCheckins(checkinResponse.data);
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndCheckins();
  }, []);

  const handleGenerateCertificate = async (eventId: number) => {
    if (user) {
      try {
        await api.post('/certificates', {
          userId: user.id,
          eventId: eventId,
        });
        alert('Certificado gerado com sucesso!');
      } catch (error) {
        console.error('Erro ao gerar certificado:', error);
      }
    }
  };

  const handleSendCertificateByEmail = async (eventId: number) => {
    if (user) {
      try {
        await api.post('/mails', {
          type: 'certificate',
          userId: user.id,
          eventId: eventId,
        });
        alert('Certificado enviado por e-mail!');
      } catch (error) {
        console.error('Erro ao enviar certificado por e-mail:', error);
      }
    }
  };

  if (loading) return <p>Carregando dados...</p>;

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="p-6 border rounded shadow-lg max-w-md">
        <h1 className="text-2xl font-bold mb-4">Seus Check-ins</h1>
        {checkins.length === 0 ? (
          <p>Você ainda não fez check-in em nenhum evento.</p>
        ) : (
          <ul>
            {checkins.map((checkin) => (
              <li key={checkin.id} className="mb-4">
                <strong>{checkin.event.title}</strong> -{' '}
                {new Date(checkin.event.date).toLocaleDateString()}
                <div className="mt-2">
                  <button
                    onClick={() => handleGenerateCertificate(checkin.eventId)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
                  >
                    Gerar Certificado
                  </button>
                  <button
                    onClick={() =>
                      handleSendCertificateByEmail(checkin.eventId)
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Enviar por E-mail
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserCheckins;
