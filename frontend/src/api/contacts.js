import API from './axios';

export const submitContact = (data) => API.post('/contacts', data);
