import React from 'react';
import type { Group } from '../App';

interface GroupListProps {
  groups: Group[];
  onEdit: (group: Group) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSelect: (group: Group) => void;
  selectedGroupId?: string;
}

const GroupList: React.FC<GroupListProps> = ({ 
  groups, 
  onEdit, 
  onDelete, 
  onAdd, 
  onSelect,
  selectedGroupId 
}) => {
  return (
    <div className="bg-dark-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-lg font-medium">Групи</h2>
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

      {groups.length === 0 ? (
        <div className="text-center py-6 text-dark-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>Немає доданих груп</p>
          <button
            onClick={onAdd}
            className="mt-2 text-secondary-500 hover:text-secondary-400 transition-colors"
          >
            Додати групу
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(group => (
            <div 
              key={group._id} 
              className={`flex justify-between items-center p-3 rounded-lg border ${
                selectedGroupId === group._id 
                  ? 'bg-secondary-900/20 border-secondary-700' 
                  : 'bg-dark-700 border-dark-600 hover:bg-dark-600'
              } transition-colors cursor-pointer`}
              onClick={() => onSelect(group)}
            >
              <div className="flex-grow">
                <div className="font-medium text-white">{group.name}</div>
                <div className="text-xs text-dark-300 flex items-center space-x-2">
                  <span>{group.shortName}</span>
                  {group.faculty && (
                    <>
                      <span className="text-dark-500">•</span>
                      <span>{group.faculty}</span>
                    </>
                  )}
                  {group.year && (
                    <>
                      <span className="text-dark-500">•</span>
                      <span>{group.year} курс</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(group);
                  }}
                  className="p-1.5 text-dark-300 hover:text-white hover:bg-dark-500 rounded transition-colors"
                  title="Редагувати"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Ви впевнені, що хочете видалити цю групу?')) {
                      onDelete(group._id);
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

export default GroupList; 