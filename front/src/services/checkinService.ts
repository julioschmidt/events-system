import axios from 'axios';

const API_URL = 'http://177.44.248.73:3000/api/checkin';

export const checkinService = {
  checkin: async (data: { userId: number; eventId: number }) => {
    const response = await axios.post(`${API_URL}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Inclui o token JWT se necessário
      },
    });
    return response.data;
  },
};