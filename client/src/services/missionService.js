import api from '../axios';

export const missionService = {
  getAll: () => api.get('/mission/getAll'),
  getById: (id) => api.get(`/mission/getMission/${id}`),
  getByProjectId: (projectId) => api.get(`/mission/getMissionByProjId/${projectId}`),
  create: (data) => api.post('/mission/create', data),
  update: (id, data) => api.put(`/mission/update/${id}`, data),
  delete: (id) => api.delete(`/mission/delete/${id}`),
};
