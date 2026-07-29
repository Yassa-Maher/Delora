import API from './axios';

export const getWalletBalance = () => API.get('/wallet/balance');
export const verifyWalletPayment = (orderId) => API.post(`/orders/${orderId}/wallet-pay`);
