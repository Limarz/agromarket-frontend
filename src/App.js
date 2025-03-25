import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import UserProfile from './pages/UserProfile';
import UserActivity from './pages/UserActivity';
import AdminPanel from './pages/AdminPanel';
import { checkSession, logout } from './services/api';
import './index.css'; // Убедитесь, что CSS импортируется

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [role, setRole] = useState('');

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

  return (
    <Router>
      <div>
        <nav className="navbar">
          <div className="container-fluid">
            <Link
              className="navbar-brand"
              to="/"
              style={{
                fontSize: '1.5rem',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              AgroMarket
            </Link>
            <div className="d-flex flex-wrap align-items-center">
              <ul className="nav-links">
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Главная
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/products">
                    Товары
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/cart">
                    Корзина ({cartCount})
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/orders">
                    Заказы ({orderCount})
                  </Link>
                </li>
                {isAuthenticated && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/profile">
                        Профиль
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/activity">
                        Активность
                      </Link>
                    </li>
                    {(role === 'Admin' || role?.name === 'Admin') && (
                      <li className="nav-item">
                        <Link className="nav-link" to="/admin">
                          Админ-панель
                        </Link>
                      </li>
                    )}
                  </>
                )}
              </ul>
              <div className="d-flex align-items-center">
                {isAuthenticated ? (
                  <>
                    <span className="me-3">Привет, {username}!</span>
                    <button className="btn btn-danger" onClick={handleLogout}>
                      Выйти
                    </button>
                  </>
                ) : (
                  <Link className="btn btn-outline-light" to="/login">
                    Войти
                  </Link>
                )}
              </div>
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