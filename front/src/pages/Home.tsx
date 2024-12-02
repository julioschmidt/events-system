import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="w-screen flex justify-center items-center">
      <div>
        <h1 className="text-2xl font-bold mb-4">Bem-vindo!</h1>
        <button
          onClick={() => navigate('/events')}
          className="mr-4 bg-green-500 text-white py-2 px-4 rounded"
        >
          Ver Eventos
        </button>
        <button
          onClick={() => navigate('/user-registrations')}
          className="mr-4 bg-green-500 text-white py-2 px-4 rounded"
        >
          Minhas inscrições
        </button>
        <button
          onClick={() => navigate('/user-checkins')}
          className="mr-4 bg-green-500 text-white py-2 px-4 rounded"
        >
          Minhas participações
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default Home;
