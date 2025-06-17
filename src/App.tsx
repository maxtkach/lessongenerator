import React, { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import SubjectList from './components/SubjectList'
import Timetable from './components/Timetable'
import Header from './components/Header'
import SubjectForm from './components/SubjectForm'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from './components/SortableItem'

// Определение типов
export interface Teacher {
  _id: string
  fullName: string
  shortName: string
  department?: string
  position?: string
  restrictedDays?: number[]
}

export interface Group {
  _id: string
  name: string
  shortName: string
  faculty?: string
  year?: number
}

export interface Subject {
  _id: string
  name: string
  shortName: string
  hoursPerWeek: number
  teacherId?: string | Teacher
  groupId: string | Group
  restrictedDays?: number[]
}

export interface ScheduleItem {
  _id?: string;
  subjectId: string | { 
    _id: string; 
    name: string; 
    shortName: string; 
    hoursPerWeek: number;
    teacherId?: string | Teacher;
    groupId: string | Group;
    restrictedDays?: number[];
  };
  day: number;
  period: number;
}

function App() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchData();
  }, []);
  
  // Загрузка расписания при изменении выбранной группы
  useEffect(() => {
    if (selectedGroupId) {
      fetchScheduleForGroup(selectedGroupId);
    }
  }, [selectedGroupId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Начинаем загрузку данных...');

      // Загружаем предметы, расписание, группы и преподавателей параллельно
      const [subjectsResponse, scheduleResponse, teachersResponse, groupsResponse] = await Promise.all([
        fetch('/api/subjects'),
        fetch('/api/schedule'),
        fetch('/api/teachers'),
        fetch('/api/groups')
      ]);

      if (!subjectsResponse.ok) {
        throw new Error('Ошибка при загрузке предметов');
      }
      if (!scheduleResponse.ok) {
        throw new Error('Ошибка при загрузке расписания');
      }
      if (!teachersResponse.ok) {
        throw new Error('Ошибка при загрузке преподавателей');
      }
      if (!groupsResponse.ok) {
        throw new Error('Ошибка при загрузке групп');
      }

      const [subjectsData, scheduleData, teachersData, groupsData] = await Promise.all([
        subjectsResponse.json(),
        scheduleResponse.json(),
        teachersResponse.json(),
        groupsResponse.json()
      ]);

      console.log('Загруженные предметы:', JSON.stringify(subjectsData, null, 2));
      console.log('Загруженное расписание:', JSON.stringify(scheduleData, null, 2));
      console.log('Загруженные преподаватели:', JSON.stringify(teachersData, null, 2));
      console.log('Загруженные группы:', JSON.stringify(groupsData, null, 2));

      setSubjects(subjectsData);
      setTeachers(teachersData);
      setGroups(groupsData);
      
      // Если есть группы, выбираем первую по умолчанию
      if (groupsData.length > 0) {
        setSelectedGroupId(groupsData[0]._id);
      }

      // Проверяем, что scheduleData - это массив и он не пустой
      if (Array.isArray(scheduleData) && scheduleData.length > 0) {
        // Преобразуем данные расписания в нужный формат
        const formattedSchedule = scheduleData.map(item => ({
          subjectId: item.subjectId, // Оставляем весь объект subjectId
          day: item.day,
          period: item.period,
          _id: item._id
        }));
        
        console.log('Форматированное расписание:', JSON.stringify(formattedSchedule, null, 2));
        setSchedule(formattedSchedule);
      } else {
        console.log('Расписание пустое или имеет неверный формат');
        setSchedule([]);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных';
      setError(errorMessage);
      console.error('Ошибка при загрузке данных:', err);
    } finally {
      setLoading(false);
    }
  };

  // Функция для загрузки расписания для конкретной группы
  const fetchScheduleForGroup = async (groupId: string) => {
    try {
      setLoading(true);
      
      const scheduleResponse = await fetch(`/api/schedule?groupId=${groupId}`);
      
      if (!scheduleResponse.ok) {
        throw new Error('Ошибка при загрузке расписания');
      }
      
      const scheduleData = await scheduleResponse.json();
      
      console.log('Загруженное расписание для группы:', JSON.stringify(scheduleData, null, 2));
      
      // Проверяем, что scheduleData - это массив и он не пустой
      if (Array.isArray(scheduleData) && scheduleData.length > 0) {
        // Преобразуем данные расписания в нужный формат
        const formattedSchedule = scheduleData
          .filter(item => item && item.subjectId) // Фильтруем элементы без subjectId
          .map(item => ({
            subjectId: item.subjectId,
            day: item.day,
            period: item.period,
            _id: item._id
          }));
        
        console.log('Форматированное расписание:', JSON.stringify(formattedSchedule, null, 2));
        setSchedule(formattedSchedule);
      } else {
        console.log('Расписание пустое или имеет неверный формат');
        setSchedule([]);
      }
    } catch (error) {
      console.error('Ошибка при загрузке расписания для группы:', error);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  // Функция для начала перетаскивания
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const subject = subjects.find(s => s._id === active.id)
    if (subject) {
      setActiveSubject(subject)
    }
  }

  // Функция для сохранения расписания
  const handleSaveSchedule = async () => {
    try {
      if (!selectedGroupId) {
        alert('Выберите группу для сохранения расписания');
        return;
      }

      const response = await fetch('/api/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: schedule,
          groupId: selectedGroupId 
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка при сохранении расписания')
      }
      alert('Розклад успішно збережено!')
    } catch (error) {
      console.error('Ошибка при сохранении:', error)
      alert('Помилка при збереженні розкладу')
    }
  }

  // Функция автоматического генерирования расписания
  const handleGenerateSchedule = async () => {
    try {
      if (!selectedGroupId) {
        alert('Выберите группу для генерации расписания');
        return;
      }

      setLoading(true);
      
      // Отправляем запрос на генерацию расписания
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupId: selectedGroupId })
      });

      if (!response.ok) {
        throw new Error('Ошибка при генерации расписания');
      }

      const newScheduleData = await response.json();
      console.log('Сгенерированное расписание:', JSON.stringify(newScheduleData, null, 2));
      
      // Преобразуем данные расписания в нужный формат
      const formattedSchedule = newScheduleData.map((item: any) => ({
        subjectId: item.subjectId,
        day: item.day,
        period: item.period,
        _id: item._id
      }));
      
      setSchedule(formattedSchedule);
      alert('Розклад успішно згенеровано!');
    } catch (error) {
      console.error('Ошибка при генерации:', error);
      alert('Помилка при генерації розкладу');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик события окончания перетаскивания
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveSubject(null);
      return;
    }
    
    if (!selectedGroupId) {
      alert('Выберите группу для редактирования расписания');
      setActiveSubject(null);
      return;
    }
    
    const subjectId = active.id as string;
    const cellId = over.id as string;
    
    // Проверяем формат идентификатора ячейки (должен быть "день-пара")
    if (!cellId.includes('-')) {
      console.error('Invalid cell ID format:', cellId);
      setActiveSubject(null);
      return;
    }

    const [dayStr, periodStr] = cellId.split('-');
    const day = parseInt(dayStr, 10);
    const period = parseInt(periodStr, 10);
    
    // Проверяем валидность day и period
    if (isNaN(day) || isNaN(period) || 
        day < 0 || day > 4 || period < 1 || period > 5) {
      console.error('Invalid day or period values:', { day, period });
      setActiveSubject(null);
      return;
    }

    // Проверяем, не превышено ли количество часов для предмета
    const subject = subjects.find(s => s._id === subjectId);
    if (!subject) {
      console.error('Subject not found:', subjectId);
      setActiveSubject(null);
      return;
    }

    // Проверяем, соответствует ли предмет выбранной группе
    const subjectGroupId = typeof subject.groupId === 'string' ? subject.groupId : subject.groupId._id;
    if (subjectGroupId !== selectedGroupId) {
      alert(`Предмет "${subject.name}" не принадлежит выбранной группе`);
      setActiveSubject(null);
      return;
    }

    // Проверяем, не запрещен ли этот день для данного предмета
    if (subject.restrictedDays && subject.restrictedDays.includes(day)) {
      alert(`Предмет "${subject.name}" не может проводиться в этот день недели`);
      setActiveSubject(null);
      return;
    }

    // Считаем текущее количество использованных часов
    const usedHours = schedule.filter(item => 
      (typeof item.subjectId === 'string' ? 
        item.subjectId === subjectId : 
        item.subjectId._id === subjectId)
    ).length;

    // Если ячейка уже занята этим предметом, разрешаем перетаскивание
    const cellOccupiedByThisSubject = schedule.some(
      item => item.day === day && item.period === period && 
      (typeof item.subjectId === 'string' ? 
        item.subjectId === subjectId : 
        item.subjectId._id === subjectId)
    );

    // Если ячейка не занята этим предметом и все часы использованы, запрещаем перетаскивание
    if (!cellOccupiedByThisSubject && usedHours >= subject.hoursPerWeek) {
      alert(`Для предмета "${subject.name}" уже использованы все ${subject.hoursPerWeek} часа в неделю`);
      setActiveSubject(null);
      return;
    }

    console.log('Добавляем предмет в расписание:', {
      subjectId,
      day,
      period
    });

    const newSchedule = schedule.filter(
      item => !(item.day === day && item.period === period)
    );
    
    newSchedule.push({
      subjectId,
      day,
      period
    });
    
    try {
      console.log('Сохраняем обновленное расписание:', newSchedule);

      const response = await fetch('/api/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: newSchedule,
          groupId: selectedGroupId 
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при сохранении расписания');
      }

      const savedSchedule = await response.json();
      console.log('Расписание успешно сохранено:', savedSchedule);

      setSchedule(newSchedule);
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
    
    setActiveSubject(null);
  };

  // Функция удаления предмета из расписания
  const handleRemoveScheduleItem = async (day: number, period: number) => {
    try {
      if (!selectedGroupId) {
        alert('Выберите группу для редактирования расписания');
        return;
      }
      
      console.log('Удаляем предмет из ячейки:', { day, period });
      
      const newSchedule = schedule.filter(
        item => !(item.day === day && item.period === period)
      );

      // Сначала обновляем состояние
      setSchedule(newSchedule);

      // Затем сохраняем в БД
      const response = await fetch('/api/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: newSchedule,
          groupId: selectedGroupId 
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при сохранении расписания');
      }

      console.log('Предмет успешно удален и расписание сохранено');
    } catch (error) {
      console.error('Ошибка при удалении предмета:', error);
      // Восстанавливаем предыдущее состояние в случае ошибки
      await fetchData();
    }
  };

  const handleClearSchedule = async () => {
    if (confirm('Ви впевнені, що хочете очистити розклад?')) {
      try {
        if (!selectedGroupId) {
          alert('Выберите группу для очистки расписания');
          return;
        }
        
        const response = await fetch('/api/schedule', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            items: [],
            groupId: selectedGroupId 
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка при очистке расписания');
        }

        setSchedule([]);
        alert('Розклад успішно очищено!');
      } catch (error) {
        console.error('Ошибка при очистке:', error);
        alert('Помилка при очищенні розкладу');
      }
    }
  };

  const handleExportSchedule = () => {
    const scheduleData = JSON.stringify(schedule, null, 2);
    const blob = new Blob([scheduleData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSchedule = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedSchedule = JSON.parse(text);

      const response = await fetch('/api/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: importedSchedule }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при импорте расписания');
      }

      setSchedule(importedSchedule);
      alert('Розклад успішно імпортовано!');
    } catch (error) {
      console.error('Ошибка при импорте:', error);
      alert('Помилка при імпорті розкладу');
    }
  };

  // Функция для добавления нового предмета
  const handleAddSubject = () => {
    console.log('handleAddSubject вызван');
    setEditingSubject(null);
    setIsFormOpen(true);
  };

  // Функция для редактирования предмета
  const handleEditSubject = (subject: Subject) => {
    console.log('handleEditSubject вызван с предметом:', subject);
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  // Функция для сохранения предмета (добавление или редактирование)
  const handleSaveSubject = async (subject: Subject) => {
    console.log('handleSaveSubject вызван с предметом:', subject);
    try {
      let response;
      
      if (subject._id) {
        console.log('Редактирование существующего предмета с ID:', subject._id);
        // Редактирование существующего предмета
        response = await fetch(`/api/subjects/${subject._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subject),
        });
      } else {
        console.log('Добавление нового предмета');
        // Добавление нового предмета
        response = await fetch('/api/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subject),
        });
      }

      if (!response.ok) {
        throw new Error('Ошибка при сохранении предмета');
      }

      const savedSubject = await response.json();
      console.log('Предмет успешно сохранен:', savedSubject);
      
      // Обновляем список предметов
      if (subject._id) {
        setSubjects(subjects.map(s => s._id === subject._id ? savedSubject : s));
      } else {
        setSubjects([...subjects, savedSubject]);
      }
      
      setIsFormOpen(false);
      
    } catch (error) {
      console.error('Ошибка при сохранении предмета:', error);
      alert('Помилка при збереженні предмета');
    }
  };

  // Функция для удаления предмета
  const handleDeleteSubject = async (id: string) => {
    console.log('handleDeleteSubject вызван с ID:', id);
    if (confirm('Ви впевнені, що хочете видалити цей предмет?')) {
      try {
        // Проверяем, используется ли предмет в расписании
        const subjectInSchedule = schedule.some(item => 
          (typeof item.subjectId === 'string' ? 
            item.subjectId === id : 
            item.subjectId._id === id)
        );
        
        if (subjectInSchedule) {
          if (!confirm('Цей предмет використовується в розкладі. Видалення предмета також видалить його з розкладу. Продовжити?')) {
            return;
          }
          
          // Удаляем предмет из расписания
          const newSchedule = schedule.filter(item => 
            !(typeof item.subjectId === 'string' ? 
              item.subjectId === id : 
              item.subjectId._id === id)
          );
          
          // Сохраняем обновленное расписание
          await fetch('/api/schedule', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: newSchedule }),
          });
          
          setSchedule(newSchedule);
        }
        
        // Удаляем предмет
        const response = await fetch(`/api/subjects/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Ошибка при удалении предмета');
        }

        // Обновляем список предметов
        setSubjects(subjects.filter(s => s._id !== id));
        
      } catch (error) {
        console.error('Ошибка при удалении предмета:', error);
        alert('Помилка при видаленні предмета');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">
      {error}
    </div>
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-dark-900">
      <Header 
        onSave={handleSaveSchedule}
        onClear={handleClearSchedule}
        onExport={handleExportSchedule}
        onImport={handleImportSchedule}
        onGenerate={handleGenerateSchedule}
        currentSchedule={schedule}
        onLoadSchedule={(items) => {
          // Обновляем состояние расписания
          setSchedule(items);
          
          // Сохраняем в БД
          fetch('/api/schedule', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items, groupId: selectedGroupId }),
          }).catch(error => {
            console.error('Ошибка при сохранении расписания:', error);
          });
        }}
        groups={groups}
        selectedGroupId={selectedGroupId}
        onGroupSelect={(groupId) => setSelectedGroupId(groupId)}
      />
      <main className="flex-grow p-4 md:p-6 container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
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
              <SubjectList
                subjects={subjects.filter(s => 
                  !selectedGroupId || 
                  (typeof s.groupId === 'string' ? s.groupId === selectedGroupId : s.groupId._id === selectedGroupId)
                )}
                onEdit={handleEditSubject}
                onDelete={handleDeleteSubject}
                onAdd={handleAddSubject}
              />
            </div>
            
            <DragOverlay>
              {activeSubject ? (
                <div className="p-3 rounded-lg bg-white dark:bg-dark-800 shadow-lg border border-gray-200 dark:border-dark-600 w-48">
                  <div className="font-medium">{activeSubject.name}</div>
                  <div className="text-sm text-gray-500">{activeSubject.shortName}</div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
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
                teachers={teachers}
                groups={groups}
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
