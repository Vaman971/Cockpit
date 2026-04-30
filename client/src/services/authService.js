import api from '../axios';

export const authService = {
  signIn: (data) => api.post('/auth/signIn', data),
  signOut: () => api.post('/auth/signOut'),
};
