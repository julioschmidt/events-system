import axios from 'axios';

const API_URL = 'http://177.44.248.73:3000/api/users';

export const userService = {
  register: async (data: { name: string, email: string, password: string }) => {
    await axios.post(`${API_URL}`, data);
  },
};