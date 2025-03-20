import axios from 'axios';

const API_URL = "https://agromarket-backend-dpj6.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 60000, // 60 секунд
});

api.interceptors.request.use(config => {
  console.log('Отправляемые cookies:', document.cookie);
  return config;
}, error => {
  return Promise.reject(error);
});

// Аутентификация
export const login = (data) => api.post('/api/auth/login', data);
export const register = (data) => api.post('/api/auth/register', data);
export const logout = () => api.post('/api/auth/logout');
export const checkSession = () => api.get('/api/auth/check-session');

// Корзина
export const getCart = () => api.get('/api/cart');
export const addToCart = (productId, quantity) =>
  api.post(`/api/cart/add?productId=${productId}&quantity=${quantity}`);
export const updateCartItem = (productId, quantity) =>
  api.post(`/api/cart/update?productId=${productId}&quantity=${quantity}`);
export const removeFromCart = (productId) => api.delete(`/api/cart/remove/${productId}`);
export const clearCart = () => api.delete('/api/cart/clear');

// Заказы
export const getOrders = () => api.get('/api/orders');
export const createOrder = (data) => api.post('/api/orders', data);
export const confirmOrder = (id) => api.put(`/api/orders/${id}/confirm`);

// Админ: Заказы
export const getAllOrders = () => api.get('/api/orders/admin/orders');
export const updateOrderStatus = (orderId, status) => api.put(`/api/orders/admin/orders/${orderId}/status`, { status });

// Товары
export const getProducts = () => api.get('/api/products');

// Профиль
export const getProfile = () => api.get('/api/users/profile');
export const updateProfile = (data) => api.put(`/api/users/${data.id}`, data);

// Активность пользователя
export const getUserActivities = () => api.get('/api/useractivity');

// Админ
export const getAllUsers = () => api.get('/api/admin/users');
export const getAllProducts = () => api.get('/api/admin/products'); // Исправлено
export const createProduct = (data) => api.post('/api/admin/products', data, { // Исправлено
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateProduct = (id, data) => api.put(`/api/admin/products/${id}`, data, { // Исправлено
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteProduct = (id) => api.delete(`/api/admin/products/${id}`); // Исправлено
export const getPendingRequests = () => api.get('/api/admin/pending-users');
export const approveRequest = (data) => api.post('/api/admin/approve-user', data);
export const deleteUser = (userId) => api.put(`/api/admin/block-user/${userId}`, { block: true }); // Исправлено: используем блокировку вместо удаления

// Категории
export const getCategories = () => api.get('/api/categories');

export default api;