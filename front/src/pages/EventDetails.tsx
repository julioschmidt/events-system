import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import {
  getAllDataFromIndexedDB,
  getUserEmailById,
  initDB,
  saveDataToIndexedDB,
  updateRegistrationByEventAndEmail,
} from '../utils/indexedDB';
import { adminUserService } from '../services/adminUserService';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface User {
  id: number;
  name: string;
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [user, setUser] = useState<User>(); // Estado para armazenar usuários
  const [canCheckin, setCanCheckin] = useState<boolean>(false); // Estado para habilitar/desabilitar o botão de check-in
  const [loading, setLoading] = useState<boolean>(true);
  const [registerUserButton, setRegisterUserButton] = useState<boolean>(false);
  const [userCheckedInWarning, setUserCheckedInWarning] =
    useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        if (navigator.onLine) {
          const response = await api.get(`/events/${id}`);
          setEvent(response.data);
        } else {
          const db = await initDB();
          const eventData = await db.get('events', Number(id!)); // Busca o evento pelo ID

          if (eventData) {
            setEvent(eventData); // Atualiza o estado com os dados do IndexedDB
          } else {
            console.error('Evento não encontrado no IndexedDB.');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do evento:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        let registration;
        if (navigator.onLine) {
          const response = await api.get('/users/token');
          setUser(response.data.data);
          const responseRegistration = await api.get(
            `/registrations/${response.data.data.id}/${id}`
          );
          registration = responseRegistration.data;
        } else {
          const user = await adminUserService.getUser();
          const registrations = await getAllDataFromIndexedDB('registrations');
          const filteredRegistrations = registrations.filter(
            (registration) => registration.eventId == id
          );
          registration = filteredRegistrations.find((registration) => {
            return registration.userEmail &&
              registration.userEmail == user.email
              ? registration
              : registration.userId == user.id
              ? registration
              : null;
          });
        }

        if (!registration) {
          setCanCheckin(false);
          setRegisterUserButton(true);
          setUserCheckedInWarning(false);
        } else if (registration.status === 'CHECKED_IN') {
          setCanCheckin(false);
          setUserCheckedInWarning(true);
          setRegisterUserButton(false);
        } else if (registration.status === 'ACTIVE') {
          setCanCheckin(true);
          setUserCheckedInWarning(false);
          setRegisterUserButton(false);
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    fetchEventDetails();
    fetchUser();
  }, [id]);

  const handleCheckIn = async () => {
    try {
      if (navigator.onLine) {
        await api.post(`/registrations/checkin`, {
          userId: user!.id,
          eventId: Number(id),
        });
        const userEmail = await getUserEmailById(user!.id);
        await api.post('/mails', {
          type: 'checkin',
          eventTitle: event!.title,
          date: Date.now(),
          userEmail: userEmail,
        });
      } else {
        const userEmail = await getUserEmailById(user!.id);
        await updateRegistrationByEventAndEmail(Number(id), userEmail, {
          status: 'CHECKED_IN',
        });
      }

      alert('Check-in realizado com sucesso!');
      navigate(`/events`);
    } catch (error) {
      console.error('Erro ao realizar check-in:', error);
    }
  };

  const handleRegisterUser = async () => {
    try {
      if (navigator.onLine) {
        await api.post(`/registrations`, {
          userId: user!.id,
          eventId: Number(id),
        });
        const userEmail = await getUserEmailById(user!.id);
        await api.post('/mails', {
          type: 'registration',
          eventTitle: event!.title,
          eventDate: event!.date,
          userEmail: userEmail,
        });
      } else {
        const userEmail = await getUserEmailById(user!.id);
        // Salva localmente se offline
        await saveDataToIndexedDB('registrations', [
          {
            eventId: Number(id),
            userEmail: userEmail,
            status: 'ACTIVE',
          },
        ]);
      }
      alert('Usuário registrado com sucesso!');
      setRegisterUserButton(false);
      setCanCheckin(true);
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
    }
  };

  if (loading) return <p>Carregando detalhes do evento...</p>;
  if (!event) return <p>Evento não encontrado.</p>;

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="p-6 border rounded shadow-lg max-w-md">
        <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
        <p className="mb-4">{event.description}</p>
        <p className="mb-4">
          Data: {new Date(event.date).toLocaleDateString()}
        </p>
        <div>
          {userCheckedInWarning && (
            <p className="text-red-500">Você já fez check-in neste evento.</p>
          )}
        </div>
        <button
          onClick={handleCheckIn}
          disabled={!canCheckin}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-300"
        >
          Fazer Check-in
        </button>
        {registerUserButton && (
          <button
            onClick={() => handleRegisterUser()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ml-3"
          >
            Registrar-se
          </button>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
