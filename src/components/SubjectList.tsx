import React, { useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Subject } from '../App';

interface SubjectListProps {
  subjects: Subject[];
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

// Названия дней недели
const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];

// Компонент для отдельного предмета, который можно перетаскивать
const DraggableSubject: React.FC<{ 
  subject: Subject,
  onEdit: () => void,
  onDelete: () => void
}> = ({ subject, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: subject._id,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div className="mb-2 flex items-start">
      {/* Перетаскиваемая часть */}
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="flex-grow p-2 bg-dark-800 rounded-lg shadow-sm hover:shadow-md cursor-move hover:bg-dark-700 transition-all duration-200 border border-dark-700 mr-2"
      >
        <div className="font-medium text-white text-sm">{subject.name}</div>
        <div className="text-xs text-dark-300">{subject.shortName}</div>
        
        {subject.teacher && (
          <div className="text-xs text-dark-400 mt-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {subject.teacher}
          </div>
        )}
        
        <div className="text-xs text-dark-400 mt-1 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {subject.hoursPerWeek} год/тиждень
        </div>
        
        {subject.restrictedDays && subject.restrictedDays.length > 0 && (
          <div className="text-xs text-red-400 mt-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Не в: {subject.restrictedDays.map(day => DAYS_SHORT[day]).join(', ')}
          </div>
        )}
      </div>
      
      {/* Кнопки управления (вне перетаскиваемой области) */}
      <div className="flex flex-col space-y-1">
        <button
          onClick={() => {
            console.log('Кнопка редактирования нажата для предмета:', subject);
            onEdit();
          }}
          className="p-1 bg-dark-700 text-secondary-400 rounded hover:bg-dark-600"
          title="Редагувати"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => {
            console.log('Кнопка удаления нажата для предмета с ID:', subject._id);
            onDelete();
          }}
          className="p-1 bg-dark-700 text-red-400 rounded hover:bg-dark-600"
          title="Видалити"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const SubjectList: React.FC<SubjectListProps> = ({ subjects, onEdit, onDelete, onAdd }) => {
  // Вычисляем общее количество часов в неделю
  const totalHours = useMemo(() => {
    return subjects.reduce((total, subject) => total + subject.hoursPerWeek, 0);
  }, [subjects]);

  return (
    <div className="bg-dark-800 p-3 rounded-xl shadow-lg border border-dark-700">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-white">Предмети</h2>
        <button
          onClick={onAdd}
          className="px-2 py-1 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-xs flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Додати
        </button>
      </div>
      
      <div className="text-xs text-dark-300 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Загальна кількість годин: <span className="font-medium text-white ml-1">{totalHours}</span>
      </div>
      
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="space-y-1">
          {subjects.map((subject) => (
            <DraggableSubject 
              key={subject._id} 
              subject={subject} 
              onEdit={() => onEdit(subject)} 
              onDelete={() => onDelete(subject._id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectList; 