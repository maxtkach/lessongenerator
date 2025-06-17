import React from 'react';
import type { Teacher } from '../App';

interface TeacherListProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];

const TeacherList: React.FC<TeacherListProps> = ({ teachers, onEdit, onDelete, onAdd }) => {
  return (
    <div className="bg-dark-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-lg font-medium">Викладачі</h2>
        <button
          onClick={onAdd}
          className="bg-secondary-600 text-white px-3 py-1 rounded text-sm hover:bg-secondary-700 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Додати
        </button>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-6 text-dark-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p>Немає доданих викладачів</p>
          <button
            onClick={onAdd}
            className="mt-2 text-secondary-500 hover:text-secondary-400 transition-colors"
          >
            Додати викладача
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {teachers.map(teacher => (
            <div 
              key={teacher._id} 
              className="flex justify-between items-center p-3 rounded-lg bg-dark-700 border border-dark-600 hover:bg-dark-600 transition-colors"
            >
              <div className="flex-grow">
                <div className="font-medium text-white">{teacher.fullName}</div>
                <div className="text-xs text-dark-300 flex items-center space-x-2">
                  <span>{teacher.shortName}</span>
                  {teacher.department && (
                    <>
                      <span className="text-dark-500">•</span>
                      <span>{teacher.department}</span>
                    </>
                  )}
                  {teacher.position && (
                    <>
                      <span className="text-dark-500">•</span>
                      <span>{teacher.position}</span>
                    </>
                  )}
                </div>
                
                {teacher.restrictedDays && teacher.restrictedDays.length > 0 && (
                  <div className="mt-1 text-xs text-red-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Не в: {teacher.restrictedDays.map(day => DAYS_SHORT[day]).join(', ')}
                  </div>
                )}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => onEdit(teacher)}
                  className="p-1.5 text-dark-300 hover:text-white hover:bg-dark-500 rounded transition-colors"
                  title="Редагувати"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Ви впевнені, що хочете видалити цього викладача?')) {
                      onDelete(teacher._id);
                    }
                  }}
                  className="p-1.5 text-dark-300 hover:text-red-500 hover:bg-dark-500 rounded transition-colors"
                  title="Видалити"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherList; 