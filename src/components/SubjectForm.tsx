import React, { useState, useEffect } from 'react';
import type { Subject, Teacher, Group } from '../App';

interface SubjectFormProps {
  subject: Subject | null;
  teachers: Teacher[];
  groups: Group[];
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

const DAYS = [
  { id: 0, name: 'Понеділок' },
  { id: 1, name: 'Вівторок' },
  { id: 2, name: 'Середа' },
  { id: 3, name: 'Четвер' },
  { id: 4, name: 'П\'ятниця' }
];

const SubjectForm: React.FC<SubjectFormProps> = ({ subject, teachers, groups, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Subject, '_id'> & { _id?: string }>({
    name: '',
    shortName: '',
    hoursPerWeek: 2,
    teacherId: '',
    groupId: '',
    restrictedDays: []
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        ...subject,
        teacherId: typeof subject.teacherId === 'object' ? subject.teacherId._id : subject.teacherId || '',
        groupId: typeof subject.groupId === 'object' ? subject.groupId._id : subject.groupId || '',
        restrictedDays: subject.restrictedDays || []
      });
    } else {
      // Сбрасываем форму при создании нового предмета
      setFormData({
        name: '',
        shortName: '',
        hoursPerWeek: 2,
        teacherId: '',
        groupId: groups.length > 0 ? groups[0]._id : '',
        restrictedDays: []
      });
    }
  }, [subject, groups]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'hoursPerWeek' ? parseInt(value, 10) : value
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
    onSave(formData as Subject);
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
        <label className="block text-dark-300 text-xs mb-1">Група</label>
        <select
          name="groupId"
          value={formData.groupId}
          onChange={handleChange}
          className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
          required
        >
          <option value="">Виберіть групу</option>
          {groups.map(group => (
            <option key={group._id} value={group._id}>
              {group.name} ({group.shortName})
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-dark-300 text-xs mb-1">Викладач</label>
        <select
          name="teacherId"
          value={formData.teacherId}
          onChange={handleChange}
          className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
        >
          <option value="">Виберіть викладача</option>
          {teachers.map(teacher => (
            <option key={teacher._id} value={teacher._id}>
              {teacher.fullName} ({teacher.shortName})
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-dark-300 text-xs mb-1">Кількість годин на тиждень</label>
        <input
          type="number"
          name="hoursPerWeek"
          value={formData.hoursPerWeek}
          onChange={handleChange}
          min="1"
          max="10"
          className="w-full px-2 py-1.5 bg-dark-700 border border-dark-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
          required
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
          Виберіть дні, коли предмет НЕ може проводитися
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

export default SubjectForm; 