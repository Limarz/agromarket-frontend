import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { register } from '../services/api';

const Register = () => {
  const [userData, setUserData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(userData);
      await loginUser({ username: userData.username, password: userData.password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Регистрация</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Имя пользователя</label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={userData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Пароль</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default Register;