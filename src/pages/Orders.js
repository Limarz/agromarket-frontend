import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { getOrders, confirmOrder } from '../services/api';

const toastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
};

const Orders = ({ setOrderCount }) => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await getOrders();
        const data = response.data.$values || response.data || [];
        setOrders(data);
        setOrderCount(data.length);
      } catch (error) {
        setError('Ошибка загрузки заказов: ' + (error.response?.data?.message || error.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [setOrderCount]);

  const confirmOrderHandler = async (orderId) => {
    try {
      await confirmOrder(orderId);
      toast.success('Заказ подтверждён!', toastOptions);
      const response = await getOrders();
      const data = response.data.$values || response.data || [];
      setOrders(data);
      setOrderCount(data.length);
    } catch (error) {
      setError('Ошибка подтверждения заказа: ' + (error.response?.data?.message || error.message));
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (isLoading) return <div className="text-center">Загрузка...</div>;
  if (!orders || orders.length === 0)
    return <div className="alert alert-warning text-center">У вас нет заказов.</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-center mb-4">Ваши заказы</h1>
      <ul className="list-group">
        {orders.map(order => (
          <li key={order.id} className="list-group-item">
            <p>Заказ #{order.id}</p>
            <p>Дата: {new Date(order.orderDate).toLocaleString()}</p>
            <p>Сумма: ${order.totalAmount}</p>
            <p>Статус: {order.status}</p>
            <p>Адрес доставки: {order.deliveryAddress || 'Не указан'}</p>
            <p>Время доставки: {order.deliveryTimeSlot || 'Не указано'}</p>
            {order.status === 'Pending' && (
              <button
                className="btn btn-success mt-2"
                onClick={() => confirmOrderHandler(order.id)}
              >
                Подтвердить получение
              </button>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default Orders;