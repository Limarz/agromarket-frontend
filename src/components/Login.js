import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login, register } from '../services/api';

const Login = ({ onLogin, setIsAuthenticated }) => {
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [registerCredentials, setRegisterCredentials] = useState({
    username: '',
    password: '',
    email: '',
    requestFarmerRole: false,
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(loginCredentials);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', response.data.role.name);
      setIsAuthenticated(true);
      onLogin(response.data.username);
      toast.success('Вход успешен!');
      navigate('/products');
    } catch (error) {
      toast.error(`Ошибка входа: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await register(registerCredentials);
      toast.success(response.data.message || 'Регистрация успешна!');
      setIsRegistering(false);
    } catch (error) {
      toast.error(`Ошибка регистрации: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="container mt-5">
      {isRegistering ? (
        <form onSubmit={handleRegister}>
          <h2>Регистрация</h2>
          <div className="mb-3">
            <label htmlFor="regUsername" className="form-label">Имя пользователя</label>
            <input
              type="text"
              className="form-control"
              id="regUsername"
              value={registerCredentials.username}
              onChange={(e) => setRegisterCredentials({ ...registerCredentials, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="regPassword" className="form-label">Пароль</label>
            <input
              type="password"
              className="form-control"
              id="regPassword"
              value={registerCredentials.password}
              onChange={(e) => setRegisterCredentials({ ...registerCredentials, password: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="regEmail" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="regEmail"
              value={registerCredentials.email}
              onChange={(e) => setRegisterCredentials({ ...registerCredentials, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="farmerRole"
              checked={registerCredentials.requestFarmerRole}
              onChange={(e) => setRegisterCredentials({ ...registerCredentials, requestFarmerRole: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="farmerRole">
              Запросить роль Farmer
            </label>
          </div>
          <button type="submit" className="btn btn-primary me-2">Зарегистрироваться</button>
          <button type="button" className="btn btn-secondary" onClick={() => setIsRegistering(false)}>
            Вернуться к входу
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin}>
          <h2>Вход</h2>
          <div className="mb-3">
            <label htmlFor="loginUsername" className="form-label">Имя пользователя</label>
            <input
              type="text"
              className="form-control"
              id="loginUsername"
              value={loginCredentials.username}
              onChange={(e) => setLoginCredentials({ ...loginCredentials, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="loginPassword" className="form-label">Пароль</label>
            <input
              type="password"
              className="form-control"
              id="loginPassword"
              value={loginCredentials.password}
              onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary me-2">Войти</button>
          <button type="button" className="btn btn-secondary" onClick={() => setIsRegistering(true)}>
            Зарегистрироваться
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;