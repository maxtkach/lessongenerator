import React, { useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import SavedSchedulesDropdown from './SavedSchedulesDropdown';
import { ScheduleItem, Group } from '../App';

interface HeaderProps {
  onSave: () => void;
  onClear: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  currentSchedule: ScheduleItem[];
  onLoadSchedule: (items: ScheduleItem[]) => void;
  groups?: Group[];
  selectedGroupId?: string;
  onGroupSelect?: (groupId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSave, 
  onClear, 
  onExport, 
  onImport, 
  onGenerate,
  currentSchedule,
  onLoadSchedule,
  groups = [],
  selectedGroupId,
  onGroupSelect
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const currentDate = new Date().toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 shadow-lg">
      <div className="container mx-auto p-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0 bg-white dark:bg-dark-800 p-1.5 rounded-lg shadow-sm">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-blue-600 dark:text-blue-400" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Розклад занять</h1>
            <p className="text-blue-100 text-xs">{currentDate}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {groups.length > 0 && onGroupSelect && (
            <select
              value={selectedGroupId || ''}
              onChange={(e) => onGroupSelect(e.target.value)}
              className="px-2 py-1 bg-white/20 dark:bg-dark-800/30 text-white rounded text-xs mr-2"
            >
              {groups.map(group => (
                <option key={group._id} value={group._id}>
                  {group.shortName}
                </option>
              ))}
            </select>
          )}
          
          {onGenerate && (
            <button
              onClick={onGenerate}
              className="px-2 py-1 bg-secondary-600 text-white rounded hover:bg-secondary-700 transition-colors text-xs flex items-center"
              title="Згенерувати розклад"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="hidden sm:inline">Згенерувати</span>
            </button>
          )}
          
          {onClear && (
            <button
              onClick={onClear}
              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs flex items-center"
              title="Очистити розклад"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Очистити</span>
            </button>
          )}
          
           {/* {onExport && (
            <button
              onClick={onExport}
              className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs flex items-center"
              title="Експортувати розклад"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Експорт</span>
            </button>
          )} */}
          
          {onImport && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".json"
                onChange={onImport}
              />
              <button
                onClick={handleImportClick}
                className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs flex items-center"
                title="Імпортувати розклад"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v-1a3 3 0 013-3h10a3 3 0 013 3v1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">Імпорт</span>
              </button>
            </>
          )} 
          
          <SavedSchedulesDropdown 
            currentSchedule={currentSchedule}
            onLoadSchedule={onLoadSchedule}
          />
          
          {/* <button
            onClick={onSave}
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs flex items-center"
            title="Зберегти розклад"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span className="hidden sm:inline">Зберегти</span>
          </button> */}
          
          <div className="ml-1 bg-white/20 dark:bg-dark-800/30 backdrop-blur-sm p-1 rounded shadow-sm">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 