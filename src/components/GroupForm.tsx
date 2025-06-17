import React, { useState, useEffect } from 'react';
import type { Group } from '../App';

interface GroupFormProps {
  group: Group | null;
  onSave: (group: Group) => void;
  onCancel: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ group, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Group, '_id'> & { _id?: string }>({
    name: '',
    shortName: '',
    faculty: '',
    year: 1
  });

  useEffect(() => {
    if (group) {
      setFormData({
        ...group,
        faculty: group.faculty || '',
        year: group.year || 1
      });
    } else {
      // Сбрасываем форму при создании новой группы
      setFormData({
        name: '',
        shortName: '',
        faculty: '',
        year: 1
      });
    }
  }, [group]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' ? parseInt(value, 10) : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Group);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-dark-300 text-xs mb-1">Назва групи</label>
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
        <label className="block text-dark-300 text-xs mb-1">Коротка назва</label>
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
        <label className="block text-dark-300 text-xs mb-1">Факультет</label>
        <input
          type="text"
          name="faculty"
          value={formData.faculty}
          onChange={handleChange}
          className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
        />
      </div>
      
      <div>
        <label className="block text-dark-300 text-xs mb-1">Курс</label>
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          min="1"
          max="6"
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

export default GroupForm; 