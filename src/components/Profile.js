import React, { useState, useEffect } from 'react';
import { getUser, updateUser, getUserActivities } from '../services/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Предполагаем, что ID пользователя доступен после логина (например, из сессии)
        const userId = 1; // Замените на реальный ID
        const userResponse = await getUser(userId);
        const activitiesResponse = await getUserActivities();
        setUser(userResponse.data);
        setActivities(activitiesResponse.data);
        setUsername(userResponse.data.username);
        setEmail(userResponse.data.email);
      } catch (err) {
        setError(err.response?.data?.Message || 'Ошибка загрузки профиля');
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const userId = 1; // Замените на реальный ID
      await updateUser(userId, { username, email, password });
      const response = await getUser(userId);
      setUser(response.data);
      alert('Профиль обновлен!');
    } catch (err) {
      setError(err.response?.data || 'Ошибка обновления профиля');
    }
  };

  if (!user) return <p>Загрузка...</p>;

  return (
    <div>
      <h2>Профиль</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Имя пользователя:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Новый пароль:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleUpdate}>Обновить</button>
      <h3>Активность</h3>
      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            {activity.action} - {new Date(activity.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Profile;