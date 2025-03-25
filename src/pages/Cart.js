import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import DatePicker from 'react-datepicker'; // Импорт DatePicker
import { registerLocale } from 'react-datepicker'; // Для локализации
import ru from 'date-fns/locale/ru'; // Русская локализация
import TimeSlotSelector from '../components/TimeSlotSelector';
import { getCart, updateCartItem, removeFromCart, clearCart, createOrder, getOrders } from '../services/api';

// Импортируем стили для react-leaflet и react-datepicker
import 'leaflet/dist/leaflet.css';
import 'react-datepicker/dist/react-datepicker.css';

// Регистрируем русскую локализацию для DatePicker
registerLocale('ru', ru);

const toastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
};

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const Cart = ({ setCartCount, setOrderCount }) => {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState([55.7558, 37.6173]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // Новое состояние для даты доставки
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const response = await getCart();
        const items = response.data.items?.$values || response.data.items || [];
        setCart({ ...response.data, items });
        setCartCount(items.reduce((sum, item) => sum + (item.quantity || 0), 0));
      } catch (error) {
        setError('Ошибка загрузки корзины: ' + (error.response?.data?.message || error.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [setCartCount]);

  const updateQuantity = async (productId, quantity, stock) => {
    if (quantity < 1) return;
    if (quantity > stock) {
      toast.error('Недостаточно товара на складе!', toastOptions);
      return;
    }
    try {
      await updateCartItem(productId, quantity);
      toast.info('Количество обновлено!', toastOptions);
      const response = await getCart();
      const items = response.data.items?.$values || response.data.items || [];
      setCart({ ...response.data, items });
      setCartCount(items.reduce((sum, item) => sum + (item.quantity || 0), 0));
    } catch (error) {
      setError('Ошибка обновления количества: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveFromCart = async (productId, productName) => {
    const removedItem = cart.items.find(item => item.productId === productId);
    if (!removedItem) return;
    try {
      await removeFromCart(productId);
      const response = await getCart();
      const items = response.data.items?.$values || response.data.items || [];
      setCart({ ...response.data, items });
      setCartCount(items.reduce((sum, item) => sum + (item.quantity || 0), 0));
      toast.error(
        <div>
          Товар "{productName}" удалён из корзины!
          <button
            className="btn btn-link p-0 ms-2"
            onClick={async () => {
              await updateCartItem(productId, removedItem.quantity);
              const response = await getCart();
              const items = response.data.items?.$values || response.data.items || [];
              setCart({ ...response.data, items });
              setCartCount(items.reduce((sum, item) => sum + (item.quantity || 0), 0));
              toast.success('Товар восстановлен!', toastOptions);
            }}
          >
            Отменить
          </button>
        </div>,
        { ...toastOptions, autoClose: 10000 }
      );
    } catch (error) {
      setError('Ошибка удаления из корзины: ' + (error.response?.data?.message || error.message));
    }
  };

  const clearCartHandler = async () => {
    try {
      await clearCart();
      toast.success('Корзина очищена!', toastOptions);
      setCart({ items: [] });
      setCartCount(0);
    } catch (error) {
      setError('Ошибка очистки корзины: ' + (error.response?.data?.message || error.message));
    }
  };

  const createOrderHandler = async () => {
    if (!deliveryAddress || !selectedTimeSlot || !selectedDate) {
      toast.error('Выберите адрес, дату и время доставки!', toastOptions);
      return;
    }
    try {
      await createOrder({
        deliveryAddress,
        deliveryLocation: { latitude: deliveryLocation[0], longitude: deliveryLocation[1] },
        deliveryTimeSlot: selectedTimeSlot,
        deliveryDate: selectedDate.toISOString(), // Передаём дату в формате ISO
      });
      toast.success('Заказ создан!', toastOptions);
      setCart({ items: [] });
      setCartCount(0);
      const ordersResponse = await getOrders();
      const orders = ordersResponse.data.$values || ordersResponse.data || [];
      setOrderCount(orders.length);
    } catch (error) {
      setError('Ошибка создания заказа: ' + (error.response?.data?.message || error.message));
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items
      .reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0)
      .toFixed(2);
  };

  const MapEvents = () => {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        setDeliveryLocation([lat, lng]);
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          const data = await response.json();
          setDeliveryAddress(data.display_name || 'Адрес не найден');
          toast.success('Адрес определён!', toastOptions);
        } catch (error) {
          setDeliveryAddress('Адрес не определён');
          toast.error('Ошибка определения адреса!', toastOptions);
        }
      },
    });
    return null;
  };

  const searchAddress = async () => {
    if (!deliveryAddress) {
      toast.error('Введите адрес!', toastOptions);
      return;
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(deliveryAddress)}&format=json&limit=1`);
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setDeliveryLocation([parseFloat(lat), parseFloat(lon)]);
        setDeliveryAddress(data[0].display_name);
      } else {
        toast.error('Адрес не найден!', toastOptions);
      }
    } catch (error) {
      setError('Ошибка поиска адреса: ' + error.message);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setDeliveryLocation([latitude, longitude]);
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            const data = await response.json();
            setDeliveryAddress(data.display_name || 'Адрес не определён');
            toast.success('Местоположение определено!', toastOptions);
          } catch (error) {
            setDeliveryAddress('Адрес не определён');
            toast.error('Ошибка определения адреса!', toastOptions);
          }
        },
        (error) => {
          toast.error('Не удалось определить местоположение: ' + error.message, toastOptions);
        }
      );
    } else {
      toast.error('Геолокация не поддерживается!', toastOptions);
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (isLoading) return <div className="text-center">Загрузка...</div>;
  if (!cart || !cart.items || cart.items.length === 0)
    return <div className="alert alert-warning text-center">Ваша корзина пуста.</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-center mb-4">Ваша корзина</h1>
      {cart.items.map(item => (
        <motion.div
          key={item.id}
          className="cart-item card mb-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title">{item.product?.name || 'Неизвестный продукт'}</h5>
              <p>Цена: <strong>${item.product?.price || 'N/A'}</strong></p>
              <div className="quantity-control">
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.product?.stock)}>
                  <FaMinus />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.product?.stock)}>
                  <FaPlus />
                </button>
              </div>
            </div>
            <button
              className="btn btn-danger d-flex align-items-center"
              onClick={() => handleRemoveFromCart(item.productId, item.product?.name)}
            >
              <FaTrash className="me-2" /> Удалить
            </button>
          </div>
        </motion.div>
      ))}
      <div className="delivery-section mb-4">
        <h3 className="text-center mb-3">Выберите адрес доставки</h3>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
          />
          <button className="btn btn-primary" onClick={searchAddress}>Найти</button>
        </div>
        <button className="btn btn-secondary mb-3" onClick={detectLocation}>Определить местоположение</button>
        <div style={{ height: '300px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          {isClient && (
            <MapContainer center={deliveryLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Marker position={deliveryLocation} icon={customIcon} />
              <MapEvents />
            </MapContainer>
          )}
        </div>
      </div>
      {/* Добавляем выбор даты доставки */}
      <div className="date-section mb-4">
        <h3 className="text-center mb-3">Выберите дату доставки</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            minDate={new Date()} // Нельзя выбрать дату раньше сегодняшней
            dateFormat="dd/MM/yyyy"
            placeholderText="Выберите дату"
            locale="ru"
            showDisabledMonthNavigation
            className="form-control"
            style={{ width: '200px' }}
          />
        </div>
      </div>
      <div className="time-slot-section mb-4">
        <h3 className="text-center mb-3">Выберите время доставки</h3>
        <TimeSlotSelector onSelectTimeSlot={setSelectedTimeSlot} />
      </div>
      <div className="text-center mt-4">
        <h4>Общая сумма: ${calculateTotal()}</h4>
        <button className="btn btn-danger me-2" onClick={clearCartHandler}>Очистить корзину</button>
        <button className="btn btn-success" onClick={createOrderHandler}>Создать заказ</button>
      </div>
      {/* Отображение выбранных даты и времени */}
      {selectedDate && selectedTimeSlot && (
        <p className="text-center mt-3">
          Доставка запланирована на {selectedDate.toLocaleDateString('ru-RU')} в {selectedTimeSlot}
        </p>
      )}
    </motion.div>
  );
};

export default Cart;