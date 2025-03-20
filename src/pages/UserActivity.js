import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Accordion } from 'react-bootstrap';
import { getUserActivities } from '../services/api';

const UserActivity = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await getUserActivities();
        console.log('Ответ от /api/useractivity:', response.data);
        setActivities(response.data.$values || response.data || []);
      } catch (error) {
        console.error('Ошибка загрузки активности:', error);
      }
    };
    fetchActivities();
  }, []);

  // Группировка по дням
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  // Сортировка дней (сначала новые)
  const sortedDates = Object.keys(groupedActivities).sort((a, b) => {
    const dateA = new Date(a.split('.').reverse().join('-'));
    const dateB = new Date(b.split('.').reverse().join('-'));
    return dateB - dateA;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-center mb-4">Активность пользователя</h1>
      <Accordion defaultActiveKey="">
        {sortedDates.map((date, index) => (
          <Accordion.Item eventKey={index.toString()} key={date}>
            <Accordion.Header>{date}</Accordion.Header>
            <Accordion.Body>
              <ul className="list-group">
                {groupedActivities[date].map(activity => (
                  <li key={activity.id} className="list-group-item">
                    <p><strong>Пользователь:</strong> {activity.username || 'Неизвестный'}</p>
                    <p><strong>Действие:</strong> {activity.action}</p>
                    <p><strong>Дата:</strong> {new Date(activity.timestamp).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </motion.div>
  );
};

export default UserActivity;