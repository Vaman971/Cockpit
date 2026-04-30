import api from '../axios';

export const opportunityService = {
  getAll: () => api.get('/oppurtunities/getOpp'),
  getLatest: () => api.get('/oppurtunities/getLatestOpp'),
  getById: (id) => api.get(`/oppurtunities/getOpp/${id}`),
  create: (data) => api.post('/oppurtunities/createOpp', data),
  update: (id, data) => api.put(`/oppurtunities/updateOpp/${id}`, data),
  delete: (id) => api.delete(`/oppurtunities/deleteOpp/${id}`),
};
