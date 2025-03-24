import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Modal, Button, Form, Accordion } from 'react-bootstrap';
import { getProfile, getAllUsers, getAllOrders, getAllProducts, createProduct, updateProduct, deleteProduct, getPendingRequests, approveRequest, updateOrderStatus, deleteUser, getCategories } from '../services/api';

const toastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
};

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: 0, stock: 0, description: '', image: null, categoryId: null });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userResponse, usersResponse, productsResponse, ordersResponse, pendingResponse, categoriesResponse] = await Promise.all([
          getProfile(),
          getAllUsers(),
          getAllProducts(),
          getAllOrders(),
          getPendingRequests(),
          getCategories(),
        ]);
        console.log('User:', userResponse.data);
        console.log('Users:', usersResponse.data);
        console.log('Products:', productsResponse.data);
        console.log('Orders:', ordersResponse.data);
        console.log('Pending Requests:', pendingResponse.data);
        console.log('Categories:', categoriesResponse.data);
        setUser(userResponse.data);

        const sortedUsers = (usersResponse.data.$values || usersResponse.data || []).sort((a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setUsers(sortedUsers);

        const sortedProducts = (productsResponse.data.$values || productsResponse.data || []).sort((a, b) =>
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setProducts(sortedProducts);

        const sortedOrders = (ordersResponse.data.$values || ordersResponse.data || []).sort((a, b) =>
          new Date(b.orderDate) - new Date(a.orderDate)
        );
        setOrders(sortedOrders);

        const sortedPendingRequests = (pendingResponse.data.$values || pendingResponse.data || []).sort((a, b) =>
          new Date(b.requestDate || 0) - new Date(a.requestDate || 0)
        );
        setPendingRequests(sortedPendingRequests);

        setCategories(categoriesResponse.data.$values || categoriesResponse.data || []);
      } catch (error) {
        setError('Ошибка загрузки данных: ' + (error.response?.data?.message || error.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('price', productForm.price);
      formData.append('stock', productForm.stock);
      formData.append('description', productForm.description);
      if (productForm.image) {
        console.log('Отправляемый файл:', productForm.image); // Логируем файл
        formData.append('image', productForm.image);
      }
      if (productForm.categoryId) {
        formData.append('categoryId', productForm.categoryId);
      }

      // Логируем содержимое FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        toast.success('Товар обновлён!', toastOptions);
      } else {
        await createProduct(formData);
        toast.success('Товар добавлен!', toastOptions);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', price: 0, stock: 0, description: '', image: null, categoryId: null });
      const productsResponse = await getAllProducts();
      const sortedProducts = (productsResponse.data.$values || productsResponse.data || []).sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setProducts(sortedProducts);
    } catch (error) {
      console.error('Ошибка при отправке:', error.response?.data || error.message);
      setError('Ошибка: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      toast.success('Товар удалён!', toastOptions);
      const productsResponse = await getAllProducts();
      const sortedProducts = (productsResponse.data.$values || productsResponse.data || []).sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setProducts(sortedProducts);
    } catch (error) {
      setError('Ошибка удаления товара: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleApproveRequest = async (userId, approve) => {
    try {
      const response = await approveRequest({ userId, approve });
      toast.success(response.data.message || (approve ? 'Роль Farmer назначена!' : 'Запрос отклонён!'), toastOptions);
      const pendingResponse = await getPendingRequests();
      const sortedPendingRequests = (pendingResponse.data.$values || pendingResponse.data || []).sort((a, b) =>
        new Date(b.requestDate || 0) - new Date(a.requestDate || 0)
      );
      setPendingRequests(sortedPendingRequests);
    } catch (error) {
      setError('Ошибка обработки запроса: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Статус заказа обновлён!', toastOptions);
      const ordersResponse = await getAllOrders();
      const sortedOrders = (ordersResponse.data.$values || ordersResponse.data || []).sort((a, b) =>
        new Date(b.orderDate) - new Date(a.orderDate)
      );
      setOrders(sortedOrders);
    } catch (error) {
      setError('Ошибка обновления статуса заказа: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      toast.success('Пользователь удалён!', toastOptions);
      const usersResponse = await getAllUsers();
      const sortedUsers = (usersResponse.data.$values || usersResponse.data || []).sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setUsers(sortedUsers);
    } catch (error) {
      setError('Ошибка удаления пользователя: ' + (error.response?.data?.message || error.message));
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (isLoading) return <div className="text-center">Загрузка...</div>;
  if (!user || (user.role !== 'Admin' && user.role?.name !== 'Admin')) {
    return <div className="alert alert-danger text-center">Доступ только для администраторов.</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-center mb-4">Админ-панель</h1>

      <Accordion defaultActiveKey="">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Товары</Accordion.Header>
          <Accordion.Body>
            <button className="btn btn-primary mb-3" onClick={() => setShowProductModal(true)}>Добавить товар</button>
            <div className="row">
              {products.map(product => (
                <div key={product.id} className="col-md-4 mb-3">
                  <div className="card">
                    <div className="card-body">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '10px' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '150px',
                            backgroundColor: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px',
                          }}
                        >
                          Нет изображения
                        </div>
                      )}
                      <h5 className="card-title">{product.name}</h5>
                      <p>Цена: ${product.price}</p>
                      <p>В наличии: {product.stock} шт.</p>
                      <p>Описание: {product.description}</p>
                      <p>Категория: {product.category || 'Не указана'}</p>
                      <button
                        className="btn btn-warning me-2"
                        onClick={() => {
                          setEditingProduct(product);
                          setProductForm({
                            name: product.name,
                            price: product.price,
                            stock: product.stock,
                            description: product.description,
                            image: null,
                            categoryId: product.categoryId
                          });
                          setShowProductModal(true);
                        }}
                      >
                        Редактировать
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDeleteProduct(product.id)}>
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>Заказы</Accordion.Header>
          <Accordion.Body>
            <ul className="list-group">
              {orders.map(order => (
                <li key={order.id} className="list-group-item">
                  <p>Заказ #{order.id}</p>
                  <p>Пользователь: {order.username || 'Неизвестный'}</p>
                  <p>Адрес: {order.deliveryAddress || 'Не указан'}</p>
                  <p>Дата: {new Date(order.orderDate).toLocaleString()}</p>
                  <p>Сумма: ${order.totalAmount}</p>
                  <p>Статус: {order.status}</p>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                    className="form-select w-auto d-inline-block"
                  >
                    <option value="Pending">В ожидании</option>
                    <option value="Processing">В обработке</option>
                    <option value="Shipped">Отправлен</option>
                    <option value="Delivered">Доставлен</option>
                    <option value="Cancelled">Отменён</option>
                  </select>
                </li>
              ))}
            </ul>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2">
          <Accordion.Header>Пользователи</Accordion.Header>
          <Accordion.Body>
            <ul className="list-group">
              {users.map(user => (
                <li key={user.id} className="list-group-item">
                  <p>Имя: {user.username}</p>
                  <p>Email: {user.email}</p>
                  <p>Роль: {user.role?.name || user.role || 'Не указана'}</p>
                  <button className="btn btn-danger" onClick={() => handleDeleteUser(user.id)}>
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="3">
          <Accordion.Header>Запросы на дополнительные права</Accordion.Header>
          <Accordion.Body>
            {pendingRequests.length === 0 ? (
              <p>Нет ожидающих запросов.</p>
            ) : (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Имя пользователя</th>
                    <th>Email</th>
                    <th>Текущая роль</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map(request => (
                    <tr key={request.id}>
                      <td>{request.username}</td>
                      <td>{request.email}</td>
                      <td>{request.role?.name || request.role || 'Нет роли'}</td>
                      <td>
                        <button
                          className="btn btn-success me-2"
                          onClick={() => handleApproveRequest(request.id, true)}
                        >
                          Одобрить (Farmer)
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleApproveRequest(request.id, false)}
                        >
                          Отклонить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleProductSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Название</Form.Label>
              <Form.Control
                type="text"
                value={productForm.name}
                onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Цена</Form.Label>
              <Form.Control
                type="number"
                value={productForm.price}
                onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>В наличии</Form.Label>
              <Form.Control
                type="number"
                value={productForm.stock}
                onChange={e => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={productForm.description}
                onChange={e => setProductForm({ ...productForm, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Категория</Form.Label>
              <Form.Select
                value={productForm.categoryId || ''}
                onChange={e => setProductForm({ ...productForm, categoryId: e.target.value ? parseInt(e.target.value) : null })}
              >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Изображение</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={e => setProductForm({ ...productForm, image: e.target.files[0] })}
              />
              {editingProduct && editingProduct.imageUrl && !productForm.image && (
                <div className="mt-2">
                  <p>Текущее изображение:</p>
                  <img
                    src={editingProduct.imageUrl}
                    alt="Текущее изображение"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </Form.Group>
            <Button variant="primary" type="submit">
              {editingProduct ? 'Сохранить' : 'Добавить'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </motion.div>
  );
};

export default AdminPanel;