import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { getProfile, updateProfile } from '../services/api';

const toastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
};

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await getProfile();
      const userData = response.data;
      console.log('Profile response:', userData); // Логируем для отладки
      setUser(userData);
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        password: '',
      });
    } catch (error) {
      setError('Ошибка загрузки профиля: ' + (error.response?.data?.message || error.message));
      console.error('Ошибка профиля:', error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      await updateProfile(updateData);
      toast.success('Профиль обновлён!', toastOptions);
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      setError('Ошибка обновления профиля: ' + (error.response?.data?.message || error.message));
      console.error('Ошибка обновления:', error.response?.data || error);
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (isLoading) return <div className="text-center">Загрузка...</div>;
  if (!user) return <div className="alert alert-warning text-center">Профиль не найден.</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-center mb-4">Профиль пользователя</h1>
      {editMode ? (
        <form onSubmit={handleSubmit} className="card p-4 mx-auto" style={{ maxWidth: '500px' }}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Имя пользователя</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Новый пароль (оставьте пустым, чтобы не менять)</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-primary">Сохранить</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Отмена</button>
          </div>
        </form>
      ) : (
        <div className="card p-4 mx-auto" style={{ maxWidth: '500px' }}>
          <h5>Имя пользователя: {user.username}</h5>
          <p>Email: {user.email}</p>
          <p>Роль: {user.role || 'Не указана'}</p> {/* Убрали .name, так как role теперь строка */}
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>Редактировать</button>
        </div>
      )}
    </motion.div>
  );
};

export default UserProfile;