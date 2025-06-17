import React, { useState, useEffect, useRef } from 'react';
import { ScheduleItem } from '../App';

interface SavedSchedule {
  _id: string;
  name: string;
  items: ScheduleItem[];
  createdAt: string;
}

interface SavedSchedulesDropdownProps {
  currentSchedule: ScheduleItem[];
  onLoadSchedule: (items: ScheduleItem[]) => void;
}

const SavedSchedulesDropdown: React.FC<SavedSchedulesDropdownProps> = ({ currentSchedule, onLoadSchedule }) => {
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      setIsSaving(false);
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
      setIsOpen(false);
    } catch (error) {
      console.error('Помилка при завантаженні розкладу:', error);
      alert('Помилка при завантаженні розкладу');
    } finally {
      setLoading(false);
    }
  };

  // Удаление сохраненного расписания
  const deleteSchedule = async (scheduleId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события клика
    
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
    } catch (error) {
      console.error('Помилка при видаленні розкладу:', error);
      alert('Помилка при видаленні розкладу');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик кликов вне выпадающего меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSaving(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-xs flex items-center"
        title="Збережені розклади"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <span className="hidden sm:inline">Розклади</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-dark-800 rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200 dark:border-dark-700">
          <div className="p-3 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Збережені розклади
            </h3>
          </div>

          {/* Кнопка сохранения нового расписания */}
          <div className="p-2 border-b border-gray-200 dark:border-dark-700">
            {isSaving ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newScheduleName}
                  onChange={(e) => setNewScheduleName(e.target.value)}
                  placeholder="Назва розкладу"
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-dark-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-dark-700 dark:text-white"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={saveSchedule}
                    disabled={loading}
                    className="flex-1 py-1 px-2 text-xs bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors disabled:opacity-50"
                  >
                    Зберегти
                  </button>
                  <button
                    onClick={() => {
                      setIsSaving(false);
                      setNewScheduleName('');
                    }}
                    className="flex-1 py-1 px-2 text-xs bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors"
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsSaving(true)}
                className="w-full py-1.5 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
              >
                Зберегти поточний розклад
              </button>
            )}
          </div>

          {/* Список сохраненных расписаний */}
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-dark-700">
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : savedSchedules.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                Збережених розкладів немає
              </div>
            ) : (
              savedSchedules.map((schedule) => (
                <div
                  key={schedule._id}
                  onClick={() => loadSchedule(schedule._id)}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-dark-700 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {schedule.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(schedule.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteSchedule(schedule._id, e)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      title="Видалити"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSchedulesDropdown; 