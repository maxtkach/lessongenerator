import React, { useState, useEffect } from 'react';
import type { Teacher } from '../App';

interface TeacherFormProps {
  teacher: Teacher | null;
  onSave: (teacher: Teacher) => void;
  onCancel: () => void;
}

const DAYS = [
  { id: 0, name: 'Понеділок' },
  { id: 1, name: 'Вівторок' },
  { id: 2, name: 'Середа' },
  { id: 3, name: 'Четвер' },
  { id: 4, name: 'П\'ятниця' }
];

const TeacherForm: React.FC<TeacherFormProps> = ({ teacher, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Teacher, '_id'> & { _id?: string }>({
    fullName: '',
    shortName: '',
    department: '',
    position: '',
    restrictedDays: []
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        ...teacher,
        department: teacher.department || '',
        position: teacher.position || '',
        restrictedDays: teacher.restrictedDays || []
      });
    } else {
      // Сбрасываем форму при создании нового преподавателя
      setFormData({
        fullName: '',
        shortName: '',
        department: '',
        position: '',
        restrictedDays: []
      });
    }
  }, [teacher]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDayToggle = (dayId: number) => {
    const restrictedDays = [...(formData.restrictedDays || [])];
    const index = restrictedDays.indexOf(dayId);
    
    if (index === -1) {
      restrictedDays.push(dayId);
    } else {
      restrictedDays.splice(index, 1);
    }
    
    setFormData({
      ...formData,
      restrictedDays
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Teacher);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-dark-300 text-xs mb-1">ПІБ викладача</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-dark-300 text-xs mb-1">Коротке ім'я</label>
        <input
          type="text"
          name="shortName"
          value={formData.shortName}
          onChange={handleChange}
          className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-dark-300 text-xs mb-1">Кафедра</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
        />
      </div>
      
      <div>
        <label className="block text-dark-300 text-xs mb-1">Посада</label>
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
        />
      </div>
      
      <div>
        <label className="block text-dark-300 text-xs mb-1">Обмеження по днях</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {DAYS.map(day => (
            <button
              key={day.id}
              type="button"
              onClick={() => handleDayToggle(day.id)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                formData.restrictedDays?.includes(day.id)
                  ? 'bg-red-700 text-white'
                  : 'bg-dark-600 text-dark-300 hover:bg-dark-500'
              }`}
            >
              {day.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-dark-400 mt-1">
          Виберіть дні, коли викладач НЕ може проводити заняття
        </p>
      </div>
      
      <div className="flex justify-end space-x-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-dark-600 text-white rounded text-xs hover:bg-dark-500 transition-colors"
        >
          Скасувати
        </button>
        <button
          type="submit"
          className="px-3 py-1 bg-secondary-600 text-white rounded text-xs hover:bg-secondary-700 transition-colors"
        >
          Зберегти
        </button>
      </div>
    </form>
  );
};

export default TeacherForm; 