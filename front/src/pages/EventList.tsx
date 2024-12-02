import React, { useEffect, useState } from 'react';
import { eventService } from '../services/eventService';
import { useNavigate } from 'react-router-dom';
import { set } from 'react-hook-form';
import api from '../api';
import { adminUserService } from '../services/adminUserService';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
}

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate(); // Hook para navegar entre as páginas

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await eventService.getEvents();
      setEvents(data);
      setLoading(false);
    };

    const fetchUserRole = async () => {
      await adminUserService.getAdminUser().then((response) => {
        setIsAdmin(response == true ? true : false);
      });
    };

    fetchEvents();
    fetchUserRole();
  }, []);

  const handleDetailsClick = (eventId: string) => {
    if (isAdmin) {
      navigate(`/events/details/${eventId}/admin`); // Redireciona para a página de check-in
    } else {
      navigate(`/events/details/${eventId}`); // Redireciona para a página de detalhes do evento
    }
  };

  if (loading) return <p>Carregando eventos...</p>;

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div>
        <h1 className="text-xl font-bold mb-4">Eventos Disponíveis</h1>
        {events.length === 0 ? (
          <p>Nenhum evento encontrado.</p>
        ) : (
          <ul>
            {events.map((event) => (
              <li
                key={event.id}
                className="mb-4 flex justify-between gap-5 items-center border-b pb-2"
              >
                <div>
                  <h2 className="text-lg font-semibold">{event.title}</h2>
                  <p>{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleDetailsClick(event.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Detalhes
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventList;
