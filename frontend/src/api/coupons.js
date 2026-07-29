import API from './axios';

export const validateCoupon = (data) => API.post('/coupons/validate', data);
