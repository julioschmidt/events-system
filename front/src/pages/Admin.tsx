import React from 'react';
import { useNavigate } from 'react-router-dom';
import SyncButton from '../components/SyncButton';
import UserRegistrationForm from '../components/UserRegistrationForm';

const Admin: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="p-6 w-screen flex items-center justify-center">
      <div className="w-1/2 flex justify-center items-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">Bem-vindo!</h1>
          {navigator.onLine && <SyncButton />}
          <button
            onClick={() => navigate('/events')}
            className="mr-4 bg-green-500 text-white py-2 px-4 rounded"
          >
            Ver Eventos
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded"
          >
            Sair
          </button>
        </div>
      </div>
      <div className="w-1/2">
        <div className="w-1/2">
          <UserRegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default Admin;
