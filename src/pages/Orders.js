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

  // Группировка заказов по месяцам
  const groupOrdersByMonth = () => {
    const grouped = {};

    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      const monthYear = orderDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' }); // Например, "март 2023"
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(order);
    });

    // Сортировка месяцев по убыванию даты
    return Object.keys(grouped)
      .sort((a, b) => {
        const dateA = new Date(a.split(' ')[1], new Date(Date.parse(a.split(' ')[0] + ' 1, 2023')).getMonth());
        const dateB = new Date(b.split(' ')[1], new Date(Date.parse(b.split(' ')[0] + ' 1, 2023')).getMonth());
        return dateB - dateA;
      })
      .reduce((obj, key) => {
        obj[key] = grouped[key];
        return obj;
      }, {});
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (isLoading) return <div className="text-center">Загрузка...</div>;
  if (!orders || orders.length === 0)
    return <div className="alert alert-warning text-center">У вас нет заказов.</div>;

  const groupedOrders = groupOrdersByMonth();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-center mb-4">Ваши заказы</h1>
      <div className="accordion" id="ordersAccordion">
        {Object.keys(groupedOrders).map((monthYear, index) => (
          <div className="accordion-item" key={monthYear}>
            <h2 className="accordion-header" id={`heading-${index}`}>
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-${index}`}
                aria-expanded={index === 0 ? "true" : "false"} // Первый месяц открыт по умолчанию
                aria-controls={`collapse-${index}`}
              >
                {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)} ({groupedOrders[monthYear].length} заказов)
              </button>
            </h2>
            <div
              id={`collapse-${index}`}
              className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
              aria-labelledby={`heading-${index}`}
              data-bs-parent="#ordersAccordion"
            >
              <div className="accordion-body">
                <ul className="list-group">
                  {groupedOrders[monthYear].map(order => (
                    <li key={order.id} className="list-group-item">
                      <p>Заказ #{order.id}</p>
                      <p>Дата заказа: {new Date(order.orderDate).toLocaleString()}</p>
                      <p>Сумма: ${order.totalAmount}</p>
                      <p>Статус: {order.status}</p>
                      <p>Адрес доставки: {order.deliveryAddress || 'Не указан'}</p>
                      <p>Дата доставки: {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('ru-RU') : 'Не указана'}</p>
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Orders;