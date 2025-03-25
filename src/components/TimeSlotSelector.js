import React, { useState } from 'react';

// Компонент для выбора временного слота доставки
const TimeSlotSelector = ({ onSelectTimeSlot }) => {
  // Пример временных слотов (можно получать с бэкенда)
  const timeSlots = [
    { id: 1, time: '10:00–12:00', available: true },
    { id: 2, time: '12:00–14:00', available: true },
    { id: 3, time: '14:00–16:00', available: false },
    { id: 4, time: '16:00–18:00', available: true },
  ];

  const [selectedSlot, setSelectedSlot] = useState(null);

  // Обработчик выбора слота
  const handleSelectSlot = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot.time);
      onSelectTimeSlot(slot.time);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
      {timeSlots.map(slot => (
        <button
          key={slot.id}
          onClick={() => handleSelectSlot(slot)}
          disabled={!slot.available}
          style={{
            margin: '5px',
            padding: '10px 15px',
            backgroundColor:
              selectedSlot === slot.time
                ? '#28a745' // Зелёный для выбранного слота
                : slot.available
                ? '#007bff' // Синий для доступных слотов
                : '#d3d3d3', // Серый для занятых
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: slot.available ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.3s', // Плавный переход цвета
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          {slot.time}
          {!slot.available && <span style={{ color: '#ff4d4f', marginLeft: '5px' }}>(Занято)</span>}
        </button>
      ))}
    </div>
  );
};

export default TimeSlotSelector;