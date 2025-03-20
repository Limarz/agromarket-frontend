import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import UserProfile from './pages/UserProfile';
import UserActivity from './pages/UserActivity';
import AdminPanel from './pages/AdminPanel';
import { checkSession, logout } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [role, setRole] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await checkSession();
        console.log('Ответ от /api/auth/check-session:', response.data);
        setIsAuthenticated(true);
        setUsername(response.data.username);
        setRole(response.data.role?.name || response.data.role || localStorage.getItem('role') || 'Customer');
      } catch (error) {
        console.error('Ошибка проверки сессии:', error);
        setIsAuthenticated(false);
        setUsername('');
        setRole('');
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (username, roleFromResponse) => {
    setIsAuthenticated(true);
    setUsername(username);
    setRole(roleFromResponse?.name || roleFromResponse || 'Customer');
    localStorage.setItem('username', username);
    localStorage.setItem('role', roleFromResponse?.name || roleFromResponse || 'Customer');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      setUsername('');
      setRole('');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <button
              className="navbar-brand btn btn-link"
              onClick={toggleMenu}
              style={{ padding: 0, fontSize: '1.5rem', color: '#f0f0f0', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}
            >
              AgroMarket
            </button>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  className="navbar-collapse"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <ul className="navbar-nav me-auto">
                    <motion.li
                      className="nav-item"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link className="nav-link" to="/" onClick={toggleMenu}>Главная</Link>
                    </motion.li>
                    <motion.li
                      className="nav-item"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link className="nav-link" to="/products" onClick={toggleMenu}>Товары</Link>
                    </motion.li>
                    <motion.li
                      className="nav-item"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Link className="nav-link" to="/cart" onClick={toggleMenu}>Корзина ({cartCount})</Link>
                    </motion.li>
                    <motion.li
                      className="nav-item"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link className="nav-link" to="/orders" onClick={toggleMenu}>Заказы ({orderCount})</Link>
                    </motion.li>
                    {isAuthenticated && (
                      <>
                        <motion.li
                          className="nav-item"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Link className="nav-link" to="/profile" onClick={toggleMenu}>Профиль</Link>
                        </motion.li>
                        <motion.li
                          className="nav-item"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <Link className="nav-link" to="/activity" onClick={toggleMenu}>Активность</Link>
                        </motion.li>
                        {(role === 'Admin' || role?.name === 'Admin') && (
                          <motion.li
                            className="nav-item"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                          >
                            <Link className="nav-link" to="/admin" onClick={toggleMenu}>Админ-панель</Link>
                          </motion.li>
                        )}
                      </>
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="d-flex align-items-center">
              {isAuthenticated ? (
                <>
                  <span className="me-3">Привет, {username}!</span>
                  <button className="btn btn-outline-danger" onClick={handleLogout}>Выйти</button>
                </>
              ) : (
                <Link className="btn btn-outline-primary" to="/login">Войти</Link>
              )}
            </div>
          </div>
        </nav>

        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/products" element={<ProductList setCartCount={setCartCount} />} />
            <Route path="/cart" element={<Cart setCartCount={setCartCount} setOrderCount={setOrderCount} />} />
            <Route path="/orders" element={<Orders setOrderCount={setOrderCount} />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/activity" element={<UserActivity />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>

        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;