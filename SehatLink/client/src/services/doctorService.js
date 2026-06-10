import API from './api';

export const getDoctors = (params) => API.get('/doctors', { params });
export const getDoctorById = (id) => API.get(`/doctors/${id}`);
export const searchDoctors = (query) => API.get('/doctors/search', { params: query });
export const addReview = (id, data) => API.post(`/doctors/${id}/review`, data);