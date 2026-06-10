import API from './api';

export const getStats = () => API.get('/admin/stats');
export const getAllUsers = () => API.get('/admin/users');
export const getAllAppointments = () => API.get('/admin/appointments');
export const toggleDoctorStatus = (doctorId) => API.put(`/admin/doctors/${doctorId}/toggle`);
export const getAnalytics = () => API.get('/admin/analytics');