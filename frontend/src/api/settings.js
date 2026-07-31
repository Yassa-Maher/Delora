import API from './axios';

export const getSettings = () => API.get('/settings');
export const updateSetting = (data) => API.put('/settings', data);
export const deleteSetting = (keyName) => API.delete(`/settings/${keyName}`);
