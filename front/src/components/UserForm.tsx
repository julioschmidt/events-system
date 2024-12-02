import { useForm } from 'react-hook-form';
import { userService } from '../services/userService';

interface UserData {
  name: string;
  email: string;
  password: string;
}

const UserForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<UserData>();

  const onSubmit = async (data: UserData) => {
    try {
      await userService.register(data);
      alert('Usuário cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Nome</label>
        <input
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
        />
        {errors.name && <span>{errors.name.message}</span>}
      </div>
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
      <button type="submit">Cadastrar</button>
    </form>
  );
};

export default UserForm;