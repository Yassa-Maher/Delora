import API from './axios';

export const checkout = (data) => API.post('/orders/checkout', data);
export const createOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/my-orders');
export const uploadPaymentProof = (formData) =>
  API.post('/orders/payment-proof', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
