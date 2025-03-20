import React, { useState, useEffect } from 'react';
import { getUserActivities } from '../api';

const UserActivity = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    getUserActivities()
      .then(response => setActivities(response.data))
      .catch(error => console.error("Ошибка загрузки активности:", error));
  }, []);

  return (
    <div>
      <h2>Активность пользователя</h2>
      <ul>
        {activities.map(activity => (
          <li key={activity.id}>
            {activity.action} - {new Date(activity.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserActivity;