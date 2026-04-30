import api from '../axios';

export const extensionService = {
  getAll: () => api.get('/extension/getExtensions'),
  getById: (id) => api.get(`/extension/getExtension/${id}`),
  create: (data) => api.post('/extension/createExtension', data),
  update: (id, data) => api.put(`/extension/updateExtension/${id}`, data),
  delete: (id) => api.delete(`/extension/deleteExtension/${id}`),
  
  // Extension Invoices
  getInvoicesByExtensionId: (extensionId) => api.get(`/extensionInvoice/getExtensionInvoicesByExtensionId/${extensionId}`),
  createInvoice: (extensionId, data) => api.post(`/extensionInvoice/createExtensionInvoice/${extensionId}`, data),
  updateInvoice: (id, data) => api.put(`/extensionInvoice/updateExtensionInvoice/${id}`, data),
  deleteInvoice: (id) => api.delete(`/extensionInvoice/deleteExtensionInvoice/${id}`),
};
