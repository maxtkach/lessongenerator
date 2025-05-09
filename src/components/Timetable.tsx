import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Subject, ScheduleItem } from '../App';

interface TimetableProps {
  schedule: ScheduleItem[];
  subjects: Subject[];
  onRemoveItem: (day: number, period: number) => void;
}

// Массив дней недели с цветами для выделения
const DAYS = [
  { name: 'Понеділок', color: 'bg-blue-700' },
  { name: 'Вівторок', color: 'bg-indigo-700' },
  { name: 'Середа', color: 'bg-purple-700' },
  { name: 'Четвер', color: 'bg-pink-700' },
  { name: 'П\'ятниця', color: 'bg-red-700' }
];

// Количество пар в день - ограничено до 5
const PERIODS = [
  { id: 1, time: '08:30 - 10:00' },
  { id: 2, time: '10:10 - 11:40' },
  { id: 3, time: '11:50 - 13:20' },
  { id: 4, time: '13:50 - 15:20' },
  { id: 5, time: '15:30 - 17:00' }
];

const Timetable: React.FC<TimetableProps> = ({ schedule, subjects, onRemoveItem }) => {
  // Функция для получения предмета по его id
  const getSubjectById = (id: string): Subject | undefined => {
    return subjects.find(subject => subject.id === id);
  };

  // Функция для получения предмета из расписания по дню и паре
  const getScheduleItem = (day: number, period: number): ScheduleItem | undefined => {
    return schedule.find(item => item.day === day && item.period === period);
  };

  // Счетчик для отслеживания количества часов по предметам
  const subjectHoursCount = schedule.reduce((acc: Record<string, number>, item) => {
    if (!acc[item.subjectId]) {
      acc[item.subjectId] = 0;
    }
    acc[item.subjectId]++;
    return acc;
  }, {});

  // Проверка, выполнены ли требования по количеству часов
  const getSubjectHoursStatus = (subjectId: string): { 
    hours: number, 
    required: number, 
    isComplete: boolean 
  } => {
    const subject = getSubjectById(subjectId);
    const hours = subjectHoursCount[subjectId] || 0;
    const required = subject?.weeklyHours || 0;
    return {
      hours,
      required,
      isComplete: hours >= required
    };
  };

  // Цвета для разных категорий предметов
  const categoryColors: Record<string, string> = {
    'Точні науки': 'bg-blue-900 border-blue-800',
    'Природничі науки': 'bg-green-900 border-green-800',
    'Гуманітарні науки': 'bg-yellow-900 border-yellow-800',
    'Мови': 'bg-purple-900 border-purple-800',
    'Мистецтво': 'bg-pink-900 border-pink-800',
    'Інше': 'bg-gray-900 border-gray-800',
  };

  return (
    <div className="bg-dark-800 rounded-xl shadow-lg overflow-hidden border border-dark-700">
      <h2 className="text-lg font-bold px-4 py-3 bg-dark-900 text-white border-b border-dark-700">
        Розклад занять
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="py-2 px-2 text-left bg-dark-900 text-white font-semibold sticky left-0 z-10 w-16 text-sm">
                Пара
              </th>
              {DAYS.map((day, index) => (
                <th 
                  key={day.name} 
                  className={`py-2 px-2 text-left text-white font-semibold ${day.color} text-sm`}
                >
                  {day.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {PERIODS.map((period) => (
              <tr key={period.id} className="hover:bg-dark-700">
                <td className="py-2 px-2 border-r border-dark-700 font-medium bg-dark-800 sticky left-0 z-10 text-xs">
                  <div className="text-white">{period.id} пара</div>
                  <div className="text-xs text-dark-400">{period.time}</div>
                </td>
                {DAYS.map((day, dayIndex) => {
                  const scheduleItem = getScheduleItem(dayIndex, period.id);
                  const subject = scheduleItem ? getSubjectById(scheduleItem.subjectId) : undefined;
                  
                  return (
                    <DroppableCell 
                      key={`${dayIndex}-${period.id}`} 
                      id={`${dayIndex}-${period.id}`} 
                      subject={subject} 
                      onRemove={() => onRemoveItem(dayIndex, period.id)} 
                      categoryColor={subject ? categoryColors[subject.category] || '' : ''}
                      hoursStatus={subject ? getSubjectHoursStatus(subject.id) : undefined}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Компонент ячейки, в которую можно перетаскивать предметы
interface DroppableCellProps {
  id: string;
  subject?: Subject;
  onRemove: () => void;
  categoryColor: string;
  hoursStatus?: {
    hours: number;
    required: number;
    isComplete: boolean;
  };
}

const DroppableCell: React.FC<DroppableCellProps> = ({ 
  id, 
  subject, 
  onRemove, 
  categoryColor,
  hoursStatus
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  
  return (
    <td 
      ref={setNodeRef}
      className={`py-1 px-2 border-r border-b border-dark-700 h-16 transition-colors duration-200 ${
        isOver ? 'bg-dark-700' : ''
      }`}
    >
      {subject ? (
        <div className={`flex flex-col h-full relative p-1 rounded-lg ${categoryColor} border shadow-sm`}>
          <div className="flex-grow">
            <div className="font-medium text-white text-sm">{subject.name}</div>
            <div className="text-xs text-dark-300">{subject.teacher}</div>
            
            {hoursStatus && (
              <div className="mt-1 flex items-center">
                <div 
                  className={`text-xs ${hoursStatus.isComplete ? 'text-green-400' : 'text-yellow-400'} flex items-center`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {hoursStatus.hours}/{hoursStatus.required}
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={onRemove}
            className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full text-xs bg-dark-800 text-red-400 hover:bg-dark-700 transition-colors shadow-sm border border-dark-600 opacity-70 hover:opacity-100"
            title="Видалити"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center text-dark-400 text-xs border border-dashed border-dark-600 rounded-lg hover:bg-dark-700 transition-colors duration-200">
          <div className="text-center py-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto mb-0.5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Перетягніть
          </div>
        </div>
      )}
    </td>
  );
};

export default Timetable; 