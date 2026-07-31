import API from './axios';

export const getPaymentMethods = () => API.get('/payment-methods');
export const getActivePaymentMethods = () => API.get('/payment-methods/active');
export const createPaymentMethod = (data) => API.post('/payment-methods', data);
export const updatePaymentMethod = (id, data) => API.put(`/payment-methods/${id}`, data);
export const deletePaymentMethod = (id) => API.delete(`/payment-methods/${id}`);
