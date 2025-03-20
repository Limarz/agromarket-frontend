import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { OverlayTrigger, Popover, Button, Accordion } from 'react-bootstrap';
import { getProducts, addToCart, getCart } from '../services/api';

const toastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
};

const ProductList = ({ setCartCount }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await getProducts();
        const data = response.data.$values || response.data;
        console.log('Products:', data); // Логируем для отладки
        setProducts(data);
        setFilteredProducts(data);
        const initialQuantities = {};
        data.forEach(product => {
          initialQuantities[product.id] = 1;
        });
        setQuantities(initialQuantities);
      } catch (error) {
        setError('Ошибка загрузки продуктов: ' + (error.response?.data?.message || error.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Фильтрация товаров
  useEffect(() => {
    let result = products;
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStock) {
      result = result.filter(product => product.stock > 0);
    }
    setFilteredProducts(result);
  }, [searchTerm, filterStock, products]);

  // Группировка товаров по категориям
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = product.category || 'Без категории'; // Если category null, то "Без категории"
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  // Сортировка категорий (чтобы "Без категории" была в конце)
  const sortedCategories = Object.keys(groupedProducts).sort((a, b) => {
    if (a === 'Без категории') return 1;
    if (b === 'Без категории') return -1;
    return a.localeCompare(b);
  });

  const addToCartHandler = async (productId, stock, quantity) => {
    if (stock === 0) {
      toast.error('Товара нет в наличии!', toastOptions);
      return;
    }
    if (quantity > stock) {
      toast.error(`В наличии только ${stock} шт.!`, toastOptions);
      return;
    }
    try {
      await addToCart(productId, quantity);
      toast.success(`Добавлено ${quantity} шт. в корзину!`, toastOptions);
      const response = await getCart();
      const items = response.data.items?.$values || response.data.items || [];
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      setError('Ошибка добавления в корзину: ' + (error.response?.data?.message || error.message));
    }
  };

  const updateQuantity = (productId, delta, stock) => {
    setQuantities(prev => {
      const newQuantity = Math.max(1, Math.min(stock, (prev[productId] || 1) + delta));
      return { ...prev, [productId]: newQuantity };
    });
  };

  const renderPopover = (product) => (
    <Popover id={`popover-${product.id}`} style={{ maxWidth: '300px' }}>
      <Popover.Header as="h3">{product.name}</Popover.Header>
      <Popover.Body>
        <p><strong>Цена:</strong> ${product.price}</p>
        <p><strong>В наличии:</strong> {product.stock} шт.</p>
        <p><strong>Категория:</strong> {product.category || 'Не указана'}</p>
        <p><strong>Описание:</strong> {product.description || 'Описание отсутствует'}</p>
      </Popover.Body>
    </Popover>
  );

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (isLoading) return <div className="text-center">Загрузка...</div>;

  return (
    <div>
      <h1 className="text-center mb-4">Список товаров</h1>
      <div className="mb-4">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Поиск по названию..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="stockFilter"
            checked={filterStock}
            onChange={e => setFilterStock(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="stockFilter">
            Показать только товары в наличии
          </label>
        </div>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="alert alert-warning text-center">Товары не найдены.</div>
      ) : (
        <Accordion defaultActiveKey="0">
          {sortedCategories.map((category, index) => (
            <Accordion.Item eventKey={index.toString()} key={category}>
              <Accordion.Header>{category}</Accordion.Header>
              <Accordion.Body>
                <div className="row">
                  {groupedProducts[category].map((product, productIndex) => (
                    <motion.div
                      key={product.id}
                      className="col-md-4 mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: productIndex * 0.1 }}
                    >
                      <div className="card h-100">
                        <div className="card-body d-flex flex-column">
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
                          <p className="card-text">Цена: ${product.price}</p>
                          <p className="card-text">В наличии: {product.stock} шт.</p>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <OverlayTrigger
                                trigger="click"
                                placement="right"
                                overlay={renderPopover(product)}
                                rootClose
                              >
                                <Button variant="primary">Подробнее</Button>
                              </OverlayTrigger>
                              <div className="d-flex align-items-center">
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => updateQuantity(product.id, -1, product.stock)}
                                  disabled={quantities[product.id] <= 1}
                                >
                                  <FaMinus />
                                </Button>
                                <span className="mx-2">{quantities[product.id]}</span>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => updateQuantity(product.id, 1, product.stock)}
                                  disabled={quantities[product.id] >= product.stock}
                                >
                                  <FaPlus />
                                </Button>
                              </div>
                            </div>
                            <Button
                              variant="success"
                              className="w-100"
                              onClick={() => addToCartHandler(product.id, product.stock, quantities[product.id])}
                              disabled={product.stock === 0}
                            >
                              <FaShoppingCart className="me-2" /> Добавить
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default ProductList;