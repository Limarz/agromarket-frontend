import React, { useState, useEffect } from 'react';
import {
  getPendingUsers,
  approveUser,
  getAllUsers,
  blockUser,
  getAllOrders,
  updateOrderStatus,
  getAnalytics,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
} from '../services/api';

function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0, description: '' });
  const [editProduct, setEditProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pendingResponse, usersResponse, ordersResponse, analyticsResponse, productsResponse] = await Promise.all([
          getPendingUsers(),
          getAllUsers(),
          getAllOrders(),
          getAnalytics(),
          getProducts(),
        ]);
        setPendingUsers(pendingResponse.data);
        setUsers(usersResponse.data);
        setOrders(ordersResponse.data);
        setAnalytics(analyticsResponse.data);
        setProducts(productsResponse.data);
      } catch (err) {
        setError(err.response?.data || 'Ошибка загрузки данных');
      }
    };
    fetchData();
  }, []);

  const handleApproveUser = async (userId, approve) => {
    try {
      await approveUser({ userId, approve });
      const response = await getPendingUsers();
      setPendingUsers(response.data);
    } catch (err) {
      setError(err.response?.data || 'Ошибка одобрения пользователя');
    }
  };

  const handleBlockUser = async (id, block) => {
    try {
      await blockUser(id, block);
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data || 'Ошибка блокировки пользователя');
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      const response = await getAllOrders();
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data || 'Ошибка обновления статуса заказа');
    }
  };

  const handleCreateProduct = async () => {
    try {
      await createProduct(newProduct);
      const response = await getProducts();
      setProducts(response.data);
      setNewProduct({ name: '', price: 0, stock: 0, description: '' });
      alert('Товар создан!');
    } catch (err) {
      setError(err.response?.data || 'Ошибка создания товара');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editProduct) return;
    try {
      await updateProduct(editProduct.id, editProduct);
      const response = await getProducts();
      setProducts(response.data);
      setEditProduct(null);
      alert('Товар обновлен!');
    } catch (err) {
      setError(err.response?.data || 'Ошибка обновления товара');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      const response = await getProducts();
      setProducts(response.data);
      alert('Товар удален!');
    } catch (err) {
      setError(err.response?.data || 'Ошибка удаления товара');
    }
  };

  return (
    <div>
      <h2>Панель администратора</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>Пользователи на одобрение</h3>
      <ul>
        {pendingUsers.map((user) => (
          <li key={user.id}>
            {user.username} - {user.email}
            <button onClick={() => handleApproveUser(user.id, true)}>Одобрить</button>
            <button onClick={() => handleApproveUser(user.id, false)}>Отклонить</button>
          </li>
        ))}
      </ul>

      <h3>Все пользователи</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.isBlocked ? 'Заблокирован' : 'Активен'}
            <button onClick={() => handleBlockUser(user.id, !user.isBlocked)}>
              {user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
            </button>
          </li>
        ))}
      </ul>

      <h3>Все заказы</h3>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            Заказ #{order.id} - {order.status}
            <select
              value={order.status}
              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
            >
              <option value="Pending">В ожидании</option>
              <option value="Confirmed">Подтвержден</option>
              <option value="Shipped">Отправлен</option>
              <option value="Delivered">Доставлен</option>
            </select>
          </li>
        ))}
      </ul>

      <h3>Аналитика</h3>
      {analytics && (
        <div>
          <p>Всего пользователей: {analytics.totalUsers}</p>
          <p>Всего заказов: {analytics.totalOrders}</p>
          <p>Общий доход: {analytics.totalRevenue} руб.</p>
          <p>Ожидающих заказов: {analytics.pendingOrders}</p>
          <h4>Топ-5 товаров:</h4>
          <ul>
            {analytics.topProducts.map((product) => (
              <li key={product.name}>
                {product.name} - {product.totalSold} продано
              </li>
            ))}
          </ul>
        </div>
      )}

      <h3>Создать товар</h3>
      <div>
        <input
          type="text"
          placeholder="Название"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Цена"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Запас"
          value={newProduct.stock}
          onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
        />
        <input
          type="text"
          placeholder="Описание"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        />
        <button onClick={handleCreateProduct}>Создать</button>
      </div>

      <h3>Все товары</h3>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - {product.price} руб. (Остаток: {product.stock})
            <button onClick={() => setEditProduct(product)}>Редактировать</button>
            <button onClick={() => handleDeleteProduct(product.id)}>Удалить</button>
          </li>
        ))}
      </ul>

      {editProduct && (
        <div>
          <h3>Редактировать товар</h3>
          <input
            type="text"
            value={editProduct.name}
            onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
          />
          <input
            type="number"
            value={editProduct.price}
            onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) })}
          />
          <input
            type="number"
            value={editProduct.stock}
            onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) })}
          />
          <input
            type="text"
            value={editProduct.description}
            onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
          />
          <button onClick={handleUpdateProduct}>Сохранить</button>
          <button onClick={() => setEditProduct(null)}>Отмена</button>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;