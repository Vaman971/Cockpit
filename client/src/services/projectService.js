import api from '../axios';

export const projectService = {
  getAll: () => api.get('/project/getProj'),
  getLatest: () => api.get('/project/getLatestProj'),
  getById: (id) => api.get(`/project/getProj/${id}`),
  getByOppId: (oppId) => api.get(`/project/getProjOpp/${oppId}`),
  create: (data) => api.post('/project/createProj', data),
  update: (id, data) => api.put(`/project/updateProj/${id}`, data),
  delete: (id) => api.delete(`/project/deleteProj/${id}`),
  exportExcel: () => api.get('/project/getProjectExcel'),
};
