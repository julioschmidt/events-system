/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { checkinService } from '../services/checkinService';

interface CheckinData {
  userId: number;
  eventId: number;
}

const CheckinForm: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>(); // Captura o ID do evento da URL
  const { register, handleSubmit, formState: { errors } } = useForm<CheckinData>();
  const [message, setMessage] = useState('');

  const onSubmit = async (data: CheckinData) => {
    try {
      await checkinService.checkin({ ...data, eventId: Number(eventId) });
      setMessage('✅ Presença registrada com sucesso!');
    } catch (error: unknown) {
      setMessage('❌ Erro ao registrar presença. Tente novamente.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Check-in do Evento</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-gray-700">ID do Usuário</label>
          <input
            id="userId"
            type="number"
            {...register('userId', { required: 'O ID do usuário é obrigatório' })}
            className="w-full p-2 border rounded"
          />
          {errors.userId && <p className="text-red-500 text-sm">{errors.userId.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Registrar Presença
        </button>
      </form>

      {message && <p className="mt-4 text-center text-lg">{message}</p>}
    </div>
  );
};

export default CheckinForm;