import API from './axios';

export const getMyNotifications = () => API.get('/user-notifications');
export const getUnreadCount = () => API.get('/user-notifications/unread-count');
export const markNotificationRead = (id) => API.put(`/user-notifications/${id}/read`);
export const markAllRead = () => API.put('/user-notifications/read-all');
