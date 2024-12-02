import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api'; // Importe seu arquivo api.js ou api.ts

interface Certificate {
  id: string;
  eventId: string;
  userId: number;
  certificadoCode: string;
  generatedAt: string;
  validUntil: string;
}

const ValidateCertificate: React.FC = () => {
  const { certificadoCode } = useParams<{ certificadoCode: string }>(); // Obter o código do certificado da URL
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [event, setEvent] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await api.get(`/certificates/${certificadoCode}`);
        setCertificate(response.data); // Se o certificado for encontrado
        const eventResponse = await api.get(`/events/${response.data.eventId}`);
        setEvent(eventResponse.data);
        const userResponse = await api.get(`/users/${response.data.userId}`);
        setUser(userResponse.data);
        setError(null); // Limpar erros, caso existam
      } catch (error) {
        setError('Certificado não válido ou não encontrado'); // Erro caso o código seja inválido
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificadoCode]);

  if (loading) return <p>Carregando certificado...</p>;

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="p-6 border rounded shadow-lg max-w-md">
        {error ? (
          <div className="text-red-500">
            <h2 className="text-2xl font-bold mb-4">Erro!</h2>
            <p>{error}</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">Certificado Válido</h2>
            <p>
              <strong className="break-words">Código:</strong>{' '}
              <span
                style={{
                  overflowWrap: 'break-word', // Garante que o texto vai quebrar a linha quando necessário
                  wordWrap: 'break-word', // Garantir compatibilidade entre navegadores
                  display: 'inline-block', // Evitar que o texto se estique
                  maxWidth: '100%', // Impede que o texto ultrapasse a largura do contêiner
                }}
              >
                {certificate?.certificadoCode}
              </span>
            </p>
            <p>
              <strong>Evento:</strong> {event?.title}
            </p>
            <p>
              <strong>Descrição:</strong> {event?.description}
            </p>
            <p>
              <strong>Usuário:</strong> {user?.name}
            </p>
            <div className="mt-4 text-green-500">
              <p>Este certificado é válido!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidateCertificate;
