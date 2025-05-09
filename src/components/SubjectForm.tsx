import React, { useState, useEffect } from 'react';
import type { Subject } from '../App';

interface SubjectFormProps {
  subject: Subject | null;
  onSave: (subject: Subject) => void;
  onCancel: () => void;
}

const categories = [
  'Точні науки',
  'Природничі науки',
  'Гуманітарні науки',
  'Мови',
  'Мистецтво',
  'Інше'
];

const SubjectForm: React.FC<SubjectFormProps> = ({ subject, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Subject>({
    id: '',
    name: '',
    category: 'Інше',
    teacher: '',
    weeklyHours: 2
  });

  useEffect(() => {
    if (subject) {
      setFormData(subject);
    }
  }, [subject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'weeklyHours' ? parseInt(value, 10) : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-dark-300 text-xs mb-1">Назва предмету</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-dark-300 text-xs mb-1">Категорія</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-dark-300 text-xs mb-1">Викладач</label>
        <input
          type="text"
          name="teacher"
          value={formData.teacher}
          onChange={handleChange}
          className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-dark-300 text-xs mb-1">Кількість годин на тиждень</label>
        <input
          type="number"
          name="weeklyHours"
          value={formData.weeklyHours}
          onChange={handleChange}
          min="1"
          max="10"
          className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
          required
        />
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

export default SubjectForm; 