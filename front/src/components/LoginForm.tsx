import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';

interface LoginData {
  email: string;
  password: string;
}

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();
  const [loginError, setLoginError] = useState('');

  const onSubmit = async (data: LoginData) => {
    try {
      await authService.login(data);
      window.location.href = '/'; // Redireciona para a tela principal
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLoginError('E-mail ou senha inválidos');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          {...register('email', { required: 'E-mail é obrigatório' })}
        />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      <div>
        <label htmlFor="password">Senha</label>
        <input
          type="password"
          id="password"
          {...register('password', { required: 'Senha é obrigatória' })}
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>
      {loginError && <div>{loginError}</div>}
      <button type="submit">Entrar</button>
    </form>
  );
};

export default LoginForm;