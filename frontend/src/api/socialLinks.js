import API from './axios';

export const getSocialLinks = () => API.get('/social-links');
export const createSocialLink = (data) => API.post('/social-links', data);
export const updateSocialLink = (id, data) => API.put(`/social-links/${id}`, data);
export const deleteSocialLink = (id) => API.delete(`/social-links/${id}`);
