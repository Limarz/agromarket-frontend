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
    <div className="time-slot-container d-flex justify-content-center flex-wrap gap-3">
      {timeSlots.map(slot => (
        <button
          key={slot.id}
          className={`time-slot btn ${
            slot.available ? 'btn-outline-primary' : 'btn-outline-secondary disabled'
          } ${selectedSlot === slot.time ? 'selected' : ''}`}
          onClick={() => handleSelectSlot(slot)}
          disabled={!slot.available}
        >
          {slot.time}
          {!slot.available && <span className="ms-2 text-danger">(Занято)</span>}
        </button>
      ))}
    </div>
  );
};

export default TimeSlotSelector;