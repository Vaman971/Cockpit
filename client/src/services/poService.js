import api from '../axios';

export const poService = {
  getAll: () => api.get('/po/getAll'),
  getById: (id) => api.get(`/po/get/${id}`),
  create: (data) => api.post('/po/create', data),
  update: (id, data) => api.put(`/po/update/${id}`, data),
  delete: (id) => api.delete(`/po/delete/${id}`),
};
