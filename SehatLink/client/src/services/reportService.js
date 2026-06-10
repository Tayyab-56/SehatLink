import API from './api';

export const uploadReport = (formData) => API.post('/reports/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getReports = () => API.get('/reports');
export const deleteReport = (id) => API.delete(`/reports/${id}`);