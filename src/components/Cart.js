import React, { useState, useEffect } from 'react';
import { getCart } from '../api';

const Cart = () => {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    getCart()
      .then(response => setCart(response.data))
      .catch(error => console.error("Ошибка загрузки корзины:", error));
  }, []); // Пустой массив — запрос выполняется один раз

  if (!cart) return <div>Загрузка...</div>;

  return (
    <div>
      <h2>Корзина</h2>
      <ul>
        {cart.items && cart.items.map(item => (
          <li key={item.productId}>
            {item.productName} - {item.quantity} шт.
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Cart;