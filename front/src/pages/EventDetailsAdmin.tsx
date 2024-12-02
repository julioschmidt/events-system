/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import UserRegistrationForm from '../components/UserRegistrationForm';
import {
  getAllDataFromIndexedDB,
  getUserEmailById,
  getUserIdByEmail,
  initDB,
  saveDataToIndexedDB,
  updateRegistrationByEventAndEmail,
} from '../utils/indexedDB';

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

const EventDetailsAdmin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [users, setUsers] = useState<User[]>([]); // Estado para armazenar usuários
  const [registeredUsersIds, setRegisteredUsersIds] = useState<number[]>([]); // Estado para armazenar IDs dos usuários registrados
  const [selectedUserId, setSelectedUserId] = useState<number>(0); // Estado para o usuário selecionado
  const [canCheckin, setCanCheckin] = useState<boolean>(false); // Estado para habilitar/desabilitar o botão de check-in
  const [loading, setLoading] = useState<boolean>(true);
  const [registerUserButton, setRegisterUserButton] = useState<boolean>(false);
  const [checkedInUsersIds, setCheckedInUsersIds] = useState<number[]>([]);
  const [userCheckedInWarning, setUserCheckedInWarning] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (navigator.onLine) {
        // Verifica se está online
        try {
          const response = await api.get(`/events/${id}`);
          setEvent(response.data);

          // Opcional: Salvar ou atualizar o evento no IndexedDB para uso offline
          await saveDataToIndexedDB('events', [response.data]);
        } catch (error) {
          console.error('Erro ao buscar detalhes do evento:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Caso esteja offline
        try {
          const db = await initDB();
          const eventData = await db.get('events', Number(id!)); // Busca o evento pelo ID

          if (eventData) {
            setEvent(eventData); // Atualiza o estado com os dados do IndexedDB
          } else {
            console.error('Evento não encontrado no IndexedDB.');
          }
        } catch (error) {
          console.error('Erro ao buscar evento offline:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    const fetchUsers = async () => {
      try {
        if (navigator.onLine) {
          const responseUsers = await api.get('/users');
          const responseRegistrations = await api.get(
            `/registrations/by-event/${id}`
          );

          setRegisteredUsersIds(
            responseRegistrations.data.map(
              (registration: any) => registration.userId
            )
          );

          setCheckedInUsersIds(
            responseRegistrations.data
              .filter(
                (registration: any) => registration.status === 'CHECKED_IN'
              )
              .map((registration: any) => registration.userId)
          );

          setUsers(responseUsers.data);
        } else {
          // Buscando dados no IndexedDB
          const users = await getAllDataFromIndexedDB('users');
          const registrations = await getAllDataFromIndexedDB('registrations');

          // Filtra as registrations com o eventId correspondente
          const filteredRegistrations = registrations.filter(
            (registration) => registration.eventId == id
          );

          const auxRegisteredUsers: number[] = [];

          await Promise.all(
            filteredRegistrations.map(async (registration: any) => {
              let userId = registration.userId;
              if (registration.userEmail) {
                userId = (await getUserIdByEmail(
                  registration.userEmail
                )) as number;
              }
              auxRegisteredUsers.push(userId);
            })
          );

          setRegisteredUsersIds(auxRegisteredUsers);

          setCheckedInUsersIds(
            filteredRegistrations
              .filter(
                (registration: any) => registration.status === 'CHECKED_IN'
              )
              .map((registration: any) => registration.userId)
          );

          setUsers(users);
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    fetchEventDetails();
    fetchUsers();
  }, [id]);

  useEffect(() => {
    if (selectedUserId) {
      if (
        registeredUsersIds.includes(selectedUserId) &&
        !checkedInUsersIds.includes(selectedUserId)
      ) {
        setUserCheckedInWarning(false);
        setRegisterUserButton(false);
        setCanCheckin(true);
      } else if (
        registeredUsersIds.includes(selectedUserId) &&
        checkedInUsersIds.includes(selectedUserId)
      ) {
        setCanCheckin(false);
        setUserCheckedInWarning(true);
        setRegisterUserButton(false);
      } else {
        setCanCheckin(false);
        setRegisterUserButton(true);
        setUserCheckedInWarning(false);
      }
    }
  }, [selectedUserId, registeredUsersIds]);

  const handleCheckIn = async () => {
    try {
      if (navigator.onLine) {
        await api.post(`/registrations/checkin`, {
          userId: selectedUserId,
          eventId: Number(id),
        });
      } else {
        const userEmail = await getUserEmailById(selectedUserId);
        // Salva localmente se offline
        await updateRegistrationByEventAndEmail(Number(id), userEmail, {
          status: 'CHECKED_IN',
        });
      }

      alert('Check-in realizado com sucesso!');
      setCheckedInUsersIds([...checkedInUsersIds, selectedUserId]);
      setCanCheckin(false);
      setUserCheckedInWarning(true);
    } catch (error) {
      console.error('Erro ao realizar check-in:', error);
    }
  };

  const handleRegisterUser = async () => {
    try {
      if (navigator.onLine) {
        await api.post(`/registrations`, {
          userId: selectedUserId,
          eventId: Number(id),
        });
      } else {
        const userEmail = await getUserEmailById(selectedUserId);
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
      setRegisteredUsersIds([...registeredUsersIds, selectedUserId]);
      setRegisterUserButton(false);
      setCanCheckin(true);
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
    }
  };

  const handleCreatedUser = (user: User) => {
    console.log('createdUser');
    console.log(user);
    setUsers([...users, user]);
    setRegisteredUsersIds([...registeredUsersIds, user.id]);
  };

  if (loading) return <p>Carregando detalhes do evento...</p>;
  if (!event) return <p>Evento não encontrado.</p>;

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-1/2 h-screen flex items-center justify-center">
        <div className="p-6 border rounded shadow-lg max-w-md">
          <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
          <p className="mb-4">{event.description}</p>
          <p className="mb-4">
            Data: {new Date(event.date).toLocaleDateString()}
          </p>
          {/* Adiciona o Select */}
          <div className="mb-4">
            <label htmlFor="userSelect" className="block">
              Selecione o Usuário:
            </label>
            <select
              id="userSelect"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              className="w-full border p-2 rounded"
            >
              <option value="">Selecione...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            {userCheckedInWarning && (
              <p className="text-red-500">
                Este usuário já fez check-in neste evento.
              </p>
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
              Registrar Usuário
            </button>
          )}
        </div>
      </div>
      <div className="w-1/2">
        <div className="w-1/2">
          <UserRegistrationForm
            eventId={Number(id)}
            handleCreatedUser={handleCreatedUser}
          />
        </div>
      </div>
    </div>
  );
};

export default EventDetailsAdmin;
