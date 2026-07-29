import API from './axios';

export const getFavorites = () => API.get('/favorites');
export const addFavorite = (data) => API.post('/favorites', data);
export const removeFavorite = (productId) => API.delete(`/favorites/${productId}`);
export const removeFromFavorites = (favId) => API.delete(`/favorites/item/${favId}`);
