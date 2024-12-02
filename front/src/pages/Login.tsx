import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import UserRegistrationForm from '../components/UserRegistrationForm';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Estado para alternar entre login e cadastro
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await api.post('/users/login', { email, password });
      console.log(response);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token); // Armazena o token
        if (response.data.admin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        alert('Falha no login: Token não recebido');
      }
    } catch (error) {
      console.error('Erro ao realizar o login:', error);
      alert('Erro ao tentar fazer login');
    }
  };

  const handleCreatedUser = () => {
    setIsRegistering(false);
  };

  const getCreatedUserInputs = (inputs: {
    email: string;
    password: string;
  }) => {
    setEmail(inputs.email);
    setPassword(inputs.password);
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      {isRegistering ? (
        // Exibe o formulário de cadastro
        <UserRegistrationForm
          handleCreatedUser={handleCreatedUser}
          getInputs={getCreatedUserInputs}
        />
      ) : (
        <>
          <div className="p-6 border rounded shadow-lg max-w-md">
            <h2 className="mb-4 text-xl text-white font-bold">Login</h2>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-2 border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-full p-2 mb-4 border"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 text-white py-2 rounded"
            >
              Entrar
            </button>
            <div className="mt-4 text-center">
              <span>Não tem uma conta? </span>
              <button
                onClick={() => setIsRegistering(true)}
                className="text-blue-500"
              >
                Cadastre-se
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Login;
