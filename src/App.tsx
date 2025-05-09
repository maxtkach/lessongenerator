import React, { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import SubjectList from './components/SubjectList'
import Timetable from './components/Timetable'
import Header from './components/Header'
import SubjectForm from './components/SubjectForm'

// Определение типов
export interface Subject {
  id: string
  name: string
  category: string
  teacher: string
  weeklyHours: number // Количество часов в неделю
}

export interface ScheduleItem {
  id: string
  subjectId: string
  day: number
  period: number
}

function App() {
  // Список доступных предметов
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 'math', name: 'Математика', category: 'Точні науки', teacher: 'Петренко О.В.', weeklyHours: 4 },
    { id: 'physics', name: 'Фізика', category: 'Точні науки', teacher: 'Коваленко М.І.', weeklyHours: 3 },
    { id: 'chemistry', name: 'Хімія', category: 'Природничі науки', teacher: 'Шевченко Н.П.', weeklyHours: 2 },
    { id: 'biology', name: 'Біологія', category: 'Природничі науки', teacher: 'Бондаренко І.С.', weeklyHours: 2 },
    { id: 'history', name: 'Історія', category: 'Гуманітарні науки', teacher: 'Мельник Т.В.', weeklyHours: 3 },
    { id: 'literature', name: 'Література', category: 'Гуманітарні науки', teacher: 'Ковальчук О.М.', weeklyHours: 2 },
    { id: 'english', name: 'Англійська мова', category: 'Мови', teacher: 'Іваненко С.Р.', weeklyHours: 3 },
    { id: 'ukrainian', name: 'Українська мова', category: 'Мови', teacher: 'Литвиненко В.О.', weeklyHours: 3 },
    { id: 'art', name: 'Мистецтво', category: 'Мистецтво', teacher: 'Савченко Д.А.', weeklyHours: 1 },
    { id: 'pe', name: 'Фізкультура', category: 'Інше', teacher: 'Кравчук Р.М.', weeklyHours: 2 },
  ])

  // Расписание занятий
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])

  // State для перетаскиваемого предмета
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);

  // State для модального окна редактирования предмета
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Загрузка сохраненного расписания при запуске приложения
  useEffect(() => {
    const savedSchedule = localStorage.getItem('timetable')
    const savedSubjects = localStorage.getItem('subjects')
    
    if (savedSchedule) {
      try {
        const parsedSchedule = JSON.parse(savedSchedule)
        setSchedule(parsedSchedule)
      } catch (error) {
        console.error('Ошибка при загрузке расписания:', error)
      }
    }
    
    if (savedSubjects) {
      try {
        const parsedSubjects = JSON.parse(savedSubjects)
        setSubjects(parsedSubjects)
      } catch (error) {
        console.error('Ошибка при загрузке предметов:', error)
      }
    }
  }, [])

  // Сохранение данных в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('schedule', JSON.stringify(schedule));
  }, [subjects, schedule]);

  // Функция для начала перетаскивания
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const subjectId = active.id as string;
    const subject = subjects.find(s => s.id === subjectId);
    
    if (subject) {
      setActiveSubject(subject);
    }
  };

  // Обработчик события окончания перетаскивания
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) {
      setActiveSubject(null);
      return;
    }
    
    const subjectId = active.id as string
    const [day, period] = (over.id as string).split('-').map(Number)
    
    // Проверяем, есть ли уже предмет в этой ячейке
    const existingItemIndex = schedule.findIndex(
      item => item.day === day && item.period === period
    )
    
    if (existingItemIndex >= 0) {
      // Заменяем существующий предмет
      const newSchedule = [...schedule]
      newSchedule[existingItemIndex] = {
        id: `${day}-${period}-${subjectId}`,
        subjectId,
        day,
        period
      }
      setSchedule(newSchedule)
    } else {
      // Добавляем новый предмет в расписание
      setSchedule([
        ...schedule,
        {
          id: `${day}-${period}-${subjectId}`,
          subjectId,
          day,
          period
        }
      ])
    }
    
    setActiveSubject(null);
  }

  // Функция удаления предмета из расписания
  const handleRemoveScheduleItem = (day: number, period: number) => {
    setSchedule(schedule.filter(item => !(item.day === day && item.period === period)))
  }

  // Функция сохранения расписания
  const handleSaveSchedule = () => {
    const scheduleData = JSON.stringify(schedule)
    localStorage.setItem('timetable', scheduleData)
    localStorage.setItem('subjects', JSON.stringify(subjects));
    alert('Розклад успішно збережено!')
  }

  // Функция очистки расписания
  const handleClearSchedule = () => {
    if (confirm('Ви впевнені, що хочете очистити розклад?')) {
      setSchedule([]);
      localStorage.removeItem('timetable');
    }
  };

  // Функция экспорта расписания в файл
  const handleExportSchedule = () => {
    const data = {
      subjects,
      schedule
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable.json';
    document.body.appendChild(a);
    a.click();
    
    // Очищаем созданные объекты
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Функция импорта расписания из файла
  const handleImportSchedule = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.subjects && data.schedule) {
          setSubjects(data.subjects);
          setSchedule(data.schedule);
          localStorage.setItem('timetable', JSON.stringify(data.schedule));
          localStorage.setItem('subjects', JSON.stringify(data.subjects));
          alert('Розклад успішно імпортовано!');
        } else {
          throw new Error('Неправильний формат даних');
        }
      } catch (error) {
        console.error('Помилка імпорту розкладу:', error);
        alert('Помилка при імпорті розкладу. Перевірте формат файлу.');
      }
    };
    
    reader.readAsText(file);
  };

  // Функция автоматического генерирования расписания
  const handleGenerateSchedule = () => {
    if (schedule.length > 0 && !confirm('Поточний розклад буде замінено. Продовжити?')) {
      return;
    }
    
    // Очищаем текущее расписание
    const newSchedule: ScheduleItem[] = [];
    
    // Распределяем предметы по расписанию согласно требованиям weeklyHours
    const daysInWeek = 5;  // Количество дней в неделе (Пн-Пт)
    const periodsPerDay = 5;  // Количество пар в день (ограничено до 5)
    
    // Расписание учителей (для предотвращения накладок)
    const teacherSchedule: Record<string, Array<{ day: number, period: number }>> = {};
    
    // Инициализируем расписание учителей
    subjects.forEach(subject => {
      teacherSchedule[subject.teacher] = [];
    });
    
    // Распределяем каждый предмет
    subjects.forEach(subject => {
      let assignedHours = 0;
      
      // Распределяем предмет до тех пор, пока не достигнем требуемого количества часов
      while (assignedHours < subject.weeklyHours) {
        // Выбираем случайный день и пару (от 1 до 5)
        const day = Math.floor(Math.random() * daysInWeek);
        const period = Math.floor(Math.random() * periodsPerDay) + 1;
        
        // Проверяем, свободен ли этот слот
        const isSlotTaken = newSchedule.some(item => 
          item.day === day && item.period === period
        );
        
        // Проверяем, свободен ли учитель в это время
        const isTeacherBusy = teacherSchedule[subject.teacher].some(slot => 
          slot.day === day && slot.period === period
        );
        
        // Если слот свободен и учитель не занят, назначаем предмет
        if (!isSlotTaken && !isTeacherBusy) {
          const newItem = {
            id: `${day}-${period}-${subject.id}`,
            subjectId: subject.id,
            day,
            period
          };
          
          newSchedule.push(newItem);
          
          // Обновляем расписание учителя
          teacherSchedule[subject.teacher].push({ day, period });
          
          assignedHours++;
        }
        
        // Предотвращаем бесконечный цикл, если нет доступных слотов
        // Максимальное количество ячеек в расписании: 5 дней * 5 пар = 25
        if (newSchedule.length >= daysInWeek * periodsPerDay) {
          break;
        }
      }
    });
    
    setSchedule(newSchedule);
    localStorage.setItem('timetable', JSON.stringify(newSchedule));
    alert('Розклад успішно згенеровано!');
  };

  // Функция для добавления нового предмета
  const handleAddSubject = () => {
    setEditingSubject(null);
    setIsFormOpen(true);
  };

  // Функция для редактирования предмета
  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  // Функция для удаления предмета
  const handleDeleteSubject = (id: string) => {
    if (confirm('Ви впевнені, що хочете видалити цей предмет?')) {
      setSubjects(subjects.filter(s => s.id !== id));
      // Также удаляем этот предмет из расписания
      setSchedule(schedule.filter(item => item.subjectId !== id));
    }
  };

  // Функция для сохранения предмета после редактирования/добавления
  const handleSaveSubject = (subject: Subject) => {
    if (editingSubject) {
      // Обновляем существующий предмет
      setSubjects(prevSubjects => 
        prevSubjects.map(s => 
          s.id === subject.id ? subject : s
        )
      );
    } else {
      // Добавляем новый предмет с уникальным ID
      const newSubject = {
        ...subject,
        id: `subject-${Date.now()}`
      };
      setSubjects(prevSubjects => [...prevSubjects, newSubject]);
    }
    
    setIsFormOpen(false);
    setEditingSubject(null);
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-dark-900">
      <Header 
        onSave={handleSaveSchedule} 
        onClear={handleClearSchedule} 
        onExport={handleExportSchedule}
        onImport={handleImportSchedule}
        onGenerate={handleGenerateSchedule}
      />
      <main className="flex-grow p-4 md:p-6 container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Основной контент (расписание) - 8 колонок */}
          <div className="lg:col-span-8 space-y-6">
            <Timetable 
              schedule={schedule} 
              subjects={subjects} 
              onRemoveItem={handleRemoveScheduleItem} 
            />
          </div>
          
          {/* Боковая панель (список предметов) - 4 колонки */}
          <div className="lg:col-span-4 space-y-6">
            <DndContext
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              collisionDetection={closestCenter}
            >
              <SubjectList 
                subjects={subjects} 
                onEdit={handleEditSubject}
                onDelete={handleDeleteSubject}
                onAdd={handleAddSubject}
              />
              
              <DragOverlay>
                {activeSubject ? (
                  <div className="p-3 rounded-lg bg-white dark:bg-dark-800 shadow-lg border border-gray-200 dark:border-dark-600 w-48">
                    <div className="font-medium">{activeSubject.name}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{activeSubject.teacher}</div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </main>
      
      {/* Модальное окно для редактирования предмета */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-lg shadow-xl max-w-sm w-full overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-700">
              <h2 className="text-base font-bold text-white">
                {editingSubject ? 'Редагувати предмет' : 'Додати новий предмет'}
              </h2>
            </div>
            <div className="p-4">
              <SubjectForm 
                subject={editingSubject}
                onSave={handleSaveSubject}
                onCancel={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
      
      <footer className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 py-4">
        <div className="container mx-auto px-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Генератор Розкладу — Розроблено з ❤️ для зручного планування занять
        </div>
      </footer>
    </div>
  )
}

export default App
