import API from './api';

export const bookAppointment = (data) => API.post('/appointments', data);
export const getMyAppointments = () => API.get('/appointments/my');
export const cancelAppointment = (id) => API.put(`/appointments/${id}/cancel`);
export const completeAppointment = (id, data) => API.put(`/appointments/${id}/complete`, data);