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
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const logout = () => api.post('/auth/logout');
export const checkSession = () => api.get('/auth/check-session');

// Корзина
export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity) =>
  api.post(`/cart/add?productId=${productId}&quantity=${quantity}`);
export const updateCartItem = (productId, quantity) =>
  api.post(`/cart/update?productId=${productId}&quantity=${quantity}`);
export const removeFromCart = (productId) => api.delete(`/cart/remove/${productId}`);
export const clearCart = () => api.delete('/cart/clear');

// Заказы
export const getOrders = () => api.get('/orders');
export const createOrder = (data) => api.post('/orders', data);
export const confirmOrder = (id) => api.put(`/orders/${id}/confirm`);

// Админ: Заказы
export const getAllOrders = () => api.get('/orders/admin/orders');
export const updateOrderStatus = (orderId, status) => api.put(`/orders/admin/orders/${orderId}/status`, { status });

// Товары
export const getProducts = () => api.get('/products');

// Профиль
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put(`/users/${data.id}`, data);

// Активность пользователя
export const getUserActivities = () => api.get('/useractivity');

// Админ
export const getAllUsers = () => api.get('/admin/users');
export const getAllProducts = () => api.get('/admin/products');
export const createProduct = (data) => api.post('/products', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateProduct = (id, data) => api.put(`/products/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getPendingRequests = () => api.get('/admin/pending-users');
export const approveRequest = (data) => api.post('/admin/approve-user', data);
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

// Категории
export const getCategories = () => api.get('/categories');

export default api;