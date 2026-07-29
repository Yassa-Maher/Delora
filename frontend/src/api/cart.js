import API from './axios';

export const getCart = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart', data);
export const removeFromCart = (productId) => API.delete(`/cart/${productId}`);
export const updateCartItemQuantity = (itemId, quantity) => API.put(`/cart/${itemId}`, { quantity });
export const removeCartItem = (itemId) => API.delete(`/cart/item/${itemId}`);
