/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { eventService } from '../services/eventService';

const Inscription = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await eventService.getEvents();
      setEvents(data);
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <h1>Eventos</h1>
      <ul>
        {events.map((event: any) => (
          <li key={event.id}>{event.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Inscription;