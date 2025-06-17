import React, { useState, useEffect } from 'react';
import { ScheduleItem } from '../App';

interface SavedSchedule {
  _id: string;
  name: string;
  items: ScheduleItem[];
  createdAt: string;
}

interface SavedSchedulesProps {
  currentSchedule: ScheduleItem[];
  onLoadSchedule: (items: ScheduleItem[]) => void;
}

const SavedSchedules: React.FC<SavedSchedulesProps> = ({ currentSchedule, onLoadSchedule }) => {
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Загрузка списка сохраненных расписаний
  const fetchSavedSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/saved-schedules');
      if (!response.ok) {
        throw new Error('Помилка при завантаженні розкладів');
      }
      const data = await response.json();
      setSavedSchedules(data);
    } catch (error) {
      console.error('Помилка при завантаженні розкладів:', error);
    } finally {
      setLoading(false);
    }
  };

  // Создание нового сохраненного расписания
  const saveSchedule = async () => {
    if (!newScheduleName.trim()) {
      alert('Введіть назву для розкладу');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/saved-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newScheduleName,
          items: currentSchedule,
        }),
      });

      if (!response.ok) {
        throw new Error('Помилка при збереженні розкладу');
      }

      setNewScheduleName('');
      setIsCreating(false);
      await fetchSavedSchedules();
      alert('Розклад успішно збережено');
    } catch (error) {
      console.error('Помилка при збереженні розкладу:', error);
      alert('Помилка при збереженні розкладу');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка сохраненного расписания
  const loadSchedule = async (scheduleId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/saved-schedules/${scheduleId}`);
      if (!response.ok) {
        throw new Error('Помилка при завантаженні розкладу');
      }
      const data = await response.json();
      onLoadSchedule(data.items);
      alert('Розклад успішно завантажено');
    } catch (error) {
      console.error('Помилка при завантаженні розкладу:', error);
      alert('Помилка при завантаженні розкладу');
    } finally {
      setLoading(false);
    }
  };

  // Удаление сохраненного расписания
  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей розклад?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/saved-schedules/${scheduleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Помилка при видаленні розкладу');
      }
      await fetchSavedSchedules();
      alert('Розклад успішно видалено');
    } catch (error) {
      console.error('Помилка при видаленні розкладу:', error);
      alert('Помилка при видаленні розкладу');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка сохраненных расписаний при монтировании компонента
  useEffect(() => {
    fetchSavedSchedules();
  }, []);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md border border-gray-200 dark:border-dark-700 p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Збережені розклади</h2>
      
      {/* Кнопка создания нового расписания */}
      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full mb-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Зберегти поточний розклад
        </button>
      ) : (
        <div className="mb-4 space-y-2">
          <input
            type="text"
            value={newScheduleName}
            onChange={(e) => setNewScheduleName(e.target.value)}
            placeholder="Назва розкладу"
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-700 dark:text-white"
          />
          <div className="flex space-x-2">
            <button
              onClick={saveSchedule}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Зберегти
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewScheduleName('');
              }}
              className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Список сохраненных расписаний */}
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : savedSchedules.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          Збережених розкладів немає
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {savedSchedules.map((schedule) => (
            <div
              key={schedule._id}
              className="p-3 bg-gray-100 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {schedule.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(schedule.createdAt)}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => loadSchedule(schedule._id)}
                    className="p-1 text-blue-500 hover:text-blue-700"
                    title="Завантажити"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule._id)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Видалити"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSchedules; 