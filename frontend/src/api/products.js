import API from './axios';

export const getProducts = (params) => API.get('/products', { params });
export const getProductById = (id) => API.get(`/products/${id}`);
export const getCategories = (params) => API.get('/categories', { params });
export const getBanners = () => API.get('/banners');
export const getBranches = () => API.get('/branches');
export const getSettings = () => API.get('/settings');
export const getActiveNotifications = () => API.get('/notifications/active');
