import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const port = 3001;

// Подключение к MongoDB
const MONGODB_URI = 'mongodb+srv://user:1234@cluster0.eyxnagh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Схемы
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  shortName: {
    type: String,
    required: true,
    unique: true,
  },
  faculty: {
    type: String,
    default: '',
  },
  year: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const teacherSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  shortName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: '',
  },
  restrictedDays: {
    type: [Number],
    default: [],
    validate: {
      validator: function(v) {
        return v.every(day => day >= 0 && day <= 4);
      },
      message: 'Ограниченные дни должны быть числами от 0 до 4'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const subjectSchema = new mongoose.Schema({
  name: String,
  shortName: String,
  hoursPerWeek: Number,
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  restrictedDays: [Number],
});

const scheduleItemSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  day: {
    type: Number,
    required: true,
    min: 0,
    max: 4
  },
  period: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
});

// Схема для расписаний
const scheduleSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  items: [scheduleItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    default: 'Основной'
  }
});

// Схема для сохраненных расписаний
const savedScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  items: [scheduleItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Group = mongoose.model('Group', groupSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const Schedule = mongoose.model('Schedule', scheduleSchema, 'schedules'); // Явно указываем имя коллекции
const SavedSchedule = mongoose.model('SavedSchedule', savedScheduleSchema, 'schedules'); // Используем ту же коллекцию

app.use(cors());
app.use(express.json());

// API для групп
app.get('/api/groups', async (req, res) => {
  try {
    console.log('Получен запрос на получение списка групп');
    
    const groups = await Group.find().sort({ name: 1 });
    console.log('Найденные группы:', JSON.stringify(groups, null, 2));
    
    res.json(groups);
  } catch (error) {
    console.error('Ошибка при получении групп:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    console.log('Получен запрос на добавление новой группы');
    console.log('Данные для создания:', req.body);
    
    const group = await Group.create(req.body);
    console.log('Созданная группа:', group);
    
    res.status(201).json(group);
  } catch (error) {
    console.error('Ошибка при добавлении группы:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Получен запрос на редактирование группы с ID:', id);
    console.log('Данные для обновления:', req.body);
    
    const group = await Group.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    
    console.log('Обновленная группа:', group);
    res.json(group);
  } catch (error) {
    console.error('Ошибка при редактировании группы:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Получен запрос на удаление группы с ID:', id);
    
    // Проверяем, есть ли предметы, связанные с этой группой
    const subjectsCount = await Subject.countDocuments({ groupId: id });
    if (subjectsCount > 0) {
      return res.status(400).json({ 
        error: 'Невозможно удалить группу, так как с ней связаны предметы. Сначала удалите все предметы этой группы.' 
      });
    }
    
    // Проверяем, есть ли расписания для этой группы
    const schedulesCount = await Schedule.countDocuments({ groupId: id });
    if (schedulesCount > 0) {
      return res.status(400).json({ 
        error: 'Невозможно удалить группу, так как для нее существуют расписания. Сначала удалите все расписания этой группы.' 
      });
    }
    
    const deletedGroup = await Group.findByIdAndDelete(id);
    console.log('Результат удаления:', deletedGroup);
    
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении группы:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API для преподавателей
app.get('/api/teachers', async (req, res) => {
  try {
    console.log('Получен запрос на получение списка преподавателей');
    
    const teachers = await Teacher.find().sort({ fullName: 1 });
    console.log('Найденные преподаватели:', JSON.stringify(teachers, null, 2));
    
    res.json(teachers);
  } catch (error) {
    console.error('Ошибка при получении преподавателей:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/teachers', async (req, res) => {
  try {
    console.log('Получен запрос на добавление нового преподавателя');
    console.log('Данные для создания:', req.body);
    
    const teacher = await Teacher.create(req.body);
    console.log('Созданный преподаватель:', teacher);
    
    res.status(201).json(teacher);
  } catch (error) {
    console.error('Ошибка при добавлении преподавателя:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Получен запрос на редактирование преподавателя с ID:', id);
    console.log('Данные для обновления:', req.body);
    
    const teacher = await Teacher.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    
    console.log('Обновленный преподаватель:', teacher);
    res.json(teacher);
  } catch (error) {
    console.error('Ошибка при редактировании преподавателя:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Получен запрос на удаление преподавателя с ID:', id);
    
    // Проверяем, есть ли предметы, связанные с этим преподавателем
    const subjectsCount = await Subject.countDocuments({ teacherId: id });
    if (subjectsCount > 0) {
      return res.status(400).json({ 
        error: 'Невозможно удалить преподавателя, так как с ним связаны предметы. Сначала удалите все предметы этого преподавателя.' 
      });
    }
    
    const deletedTeacher = await Teacher.findByIdAndDelete(id);
    console.log('Результат удаления:', deletedTeacher);
    
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении преподавателя:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API для предметов
app.get('/api/subjects', async (req, res) => {
  try {
    console.log('Получен запрос на получение списка предметов');
    
    // Если указана группа, фильтруем предметы по группе
    const filter = req.query.groupId ? { groupId: req.query.groupId } : {};
    
    const subjects = await Subject.find(filter)
      .populate('teacherId')
      .populate('groupId');
      
    console.log('Найденные предметы:', JSON.stringify(subjects, null, 2));
    
    res.json(subjects);
  } catch (error) {
    console.error('Ошибка при получении предметов:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    console.log('Получен запрос на добавление нового предмета');
    console.log('Данные для создания:', req.body);
    
    const subject = await Subject.create(req.body);
    const populatedSubject = await Subject.findById(subject._id)
      .populate('teacherId')
      .populate('groupId');
      
    console.log('Созданный предмет:', populatedSubject);
    
    res.status(201).json(populatedSubject);
  } catch (error) {
    console.error('Ошибка при добавлении предмета:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Получен запрос на редактирование предмета с ID:', id);
    console.log('Данные для обновления:', req.body);
    
    const subject = await Subject.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    ).populate('teacherId').populate('groupId');
    
    console.log('Обновленный предмет:', subject);
    res.json(subject);
  } catch (error) {
    console.error('Ошибка при редактировании предмета:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Получен запрос на удаление предмета с ID:', id);
    
    const deletedSubject = await Subject.findByIdAndDelete(id);
    console.log('Результат удаления:', deletedSubject);
    
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении предмета:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API для расписания
app.get('/api/schedule', async (req, res) => {
  try {
    console.log('Получаем расписание из БД...');
    
    // Если указана группа, фильтруем расписание по группе
    const filter = req.query.groupId ? { groupId: req.query.groupId } : {};
    
    // Получаем основное расписание (самое последнее)
    const schedule = await Schedule.findOne(filter)
      .sort({ updatedAt: -1 })
      .populate({
        path: 'items.subjectId',
        model: 'Subject',
        populate: [
          { path: 'teacherId', model: 'Teacher' },
          { path: 'groupId', model: 'Group' }
        ]
      });

    console.log('Найденное расписание:', schedule);

    if (!schedule) {
      console.log('Расписание не найдено, возвращаем пустой массив');
      return res.json([]);
    }

    console.log('Возвращаем элементы расписания:', schedule.items);
    res.json(schedule.items);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/schedule', async (req, res) => {
  try {
    const { groupId } = req.body;
    
    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }
    
    // Получаем все предметы для указанной группы
    const subjects = await Subject.find({ groupId }).populate('teacherId');
    const schedule = { groupId, items: [] };
    
    // Создаем массив для отслеживания часов каждого предмета
    const subjectHours = {};
    subjects.forEach(subject => {
      subjectHours[subject._id.toString()] = 0;
    });

    const daysInWeek = 5;
    const periodsPerDay = 5;

    // Сортируем предметы по количеству часов (по убыванию)
    const sortedSubjects = [...subjects].sort((a, b) => b.hoursPerWeek - a.hoursPerWeek);

    // Создаем массив для отслеживания количества пар в каждый день
    const lessonsPerDay = Array(daysInWeek).fill(0);
    
    // Создаем структуру для отслеживания занятости преподавателей
    // { teacherId: { day: { period: true } } }
    const teacherSchedule = {};
    
    // Первый проход: распределяем предметы равномерно по дням
    for (const subject of sortedSubjects) {
      const subjectId = subject._id.toString();
      let hoursNeeded = subject.hoursPerWeek;

      while (hoursNeeded > 0) {
        // Находим день с наименьшим количеством пар, учитывая ограничения предмета и преподавателя
        const availableDays = Array.from({ length: daysInWeek }, (_, i) => i)
          .filter(day => {
            // Проверяем ограничения предмета
            if (subject.restrictedDays && subject.restrictedDays.includes(day)) {
              return false;
            }
            
            // Проверяем ограничения преподавателя
            if (subject.teacherId && subject.teacherId.restrictedDays && 
                subject.teacherId.restrictedDays.includes(day)) {
              return false;
            }
            
            return true;
          });
        
        if (availableDays.length === 0) {
          console.warn(`Предмет "${subject.name}" имеет ограничения на все дни недели, невозможно составить расписание`);
          break;
        }
        
        const dayWithLeastLessons = availableDays
          .map(day => ({ count: lessonsPerDay[day], day }))
          .sort((a, b) => a.count - b.count)[0].day;

        // Ищем свободный слот в этом дне, начиная с первой пары
        let slotFound = false;
        for (let period = 1; period <= periodsPerDay; period++) {
          const isSlotFree = !schedule.items.some(
            item => item.day === dayWithLeastLessons && item.period === period
          );
          
          // Проверяем, свободен ли преподаватель в это время
          let isTeacherFree = true;
          if (subject.teacherId) {
            const teacherId = subject.teacherId._id.toString();
            if (!teacherSchedule[teacherId]) {
              teacherSchedule[teacherId] = {};
            }
            if (!teacherSchedule[teacherId][dayWithLeastLessons]) {
              teacherSchedule[teacherId][dayWithLeastLessons] = {};
            }
            isTeacherFree = !teacherSchedule[teacherId][dayWithLeastLessons][period];
          }

          if (isSlotFree && isTeacherFree) {
            schedule.items.push({
              subjectId: subject._id,
              day: dayWithLeastLessons,
              period
            });
            
            // Отмечаем, что преподаватель занят в это время
            if (subject.teacherId) {
              const teacherId = subject.teacherId._id.toString();
              teacherSchedule[teacherId][dayWithLeastLessons][period] = true;
            }
            
            subjectHours[subjectId]++;
            lessonsPerDay[dayWithLeastLessons]++;
            hoursNeeded--;
            slotFound = true;
            break;
          }
        }

        // Если не нашли свободный слот в этом дне, пробуем следующий
        if (!slotFound) {
          lessonsPerDay[dayWithLeastLessons] = Infinity; // Временно исключаем этот день
          // Проверяем, остались ли доступные дни
          if (lessonsPerDay.every(count => count === Infinity)) {
            // Сбрасываем счетчики, если все дни заполнены
            for (let i = 0; i < daysInWeek; i++) {
              if (schedule.items.filter(item => item.day === i).length < periodsPerDay) {
                lessonsPerDay[i] = schedule.items.filter(item => item.day === i).length;
              }
            }
          }
        }

        // Если все слоты заняты, прерываем цикл
        if (lessonsPerDay.every(count => count >= periodsPerDay)) {
          break;
        }
      }
    }

    // Второй проход: пытаемся заполнить оставшиеся часы
    for (const subject of sortedSubjects) {
      const subjectId = subject._id.toString();
      while (subjectHours[subjectId] < subject.hoursPerWeek) {
        let slotFound = false;
        
        // Ищем любой свободный слот
        for (let day = 0; day < daysInWeek; day++) {
          // Пропускаем дни с ограничениями для предмета или преподавателя
          if ((subject.restrictedDays && subject.restrictedDays.includes(day)) ||
              (subject.teacherId && subject.teacherId.restrictedDays && 
               subject.teacherId.restrictedDays.includes(day))) {
            continue;
          }
          
          for (let period = 1; period <= periodsPerDay; period++) {
            const isSlotFree = !schedule.items.some(
              item => item.day === day && item.period === period
            );
            
            // Проверяем, свободен ли преподаватель в это время
            let isTeacherFree = true;
            if (subject.teacherId) {
              const teacherId = subject.teacherId._id.toString();
              if (teacherSchedule[teacherId] && 
                  teacherSchedule[teacherId][day] && 
                  teacherSchedule[teacherId][day][period]) {
                isTeacherFree = false;
              }
            }

            // Проверяем, нет ли уже этого предмета в этот день
            const subjectInDay = schedule.items.some(
              item => item.day === day && item.subjectId.toString() === subjectId
            );

            if (isSlotFree && isTeacherFree && !subjectInDay) {
              schedule.items.push({
                subjectId: subject._id,
                day,
                period
              });
              
              // Отмечаем, что преподаватель занят в это время
              if (subject.teacherId) {
                const teacherId = subject.teacherId._id.toString();
                if (!teacherSchedule[teacherId]) {
                  teacherSchedule[teacherId] = {};
                }
                if (!teacherSchedule[teacherId][day]) {
                  teacherSchedule[teacherId][day] = {};
                }
                teacherSchedule[teacherId][day][period] = true;
              }
              
              subjectHours[subjectId]++;
              slotFound = true;
              break;
            }
          }
          if (slotFound) break;
        }
        
        // Если не нашли свободный слот, прерываем цикл
        if (!slotFound) break;
      }
    }

    // Сортируем расписание для удобства
    schedule.items.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.period - b.period;
    });

    // Сохраняем расписание в базу данных
    const newSchedule = await Schedule.create(schedule);
    const populatedSchedule = await Schedule.findById(newSchedule._id)
      .populate({
        path: 'items.subjectId',
        populate: [
          { path: 'teacherId' },
          { path: 'groupId' }
        ]
      });
    
    res.status(201).json(populatedSchedule.items);
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/schedule', async (req, res) => {
  try {
    console.log('Обновляем расписание, полученные данные:', req.body);
    
    const { groupId, items } = req.body;
    
    if (!groupId) {
      return res.status(400).json({ error: 'Group ID is required' });
    }
    
    const schedule = await Schedule.findOne({ groupId }).sort({ updatedAt: -1 });
    if (!schedule) {
      console.log('Создаем новое расписание');
      const newSchedule = await Schedule.create({ 
        groupId,
        items,
        updatedAt: new Date()
      });
      
      // Получаем расписание с заполненными данными о предметах
      const populatedSchedule = await Schedule.findById(newSchedule._id)
        .populate({
          path: 'items.subjectId',
          populate: [
            { path: 'teacherId' },
            { path: 'groupId' }
          ]
        });
      
      console.log('Новое расписание создано:', populatedSchedule);
      return res.json(populatedSchedule.items);
    } else {
      console.log('Обновляем существующее расписание');
      schedule.items = items;
      schedule.updatedAt = new Date();
      await schedule.save();
      
      // Получаем расписание с заполненными данными о предметах
      const populatedSchedule = await Schedule.findById(schedule._id)
        .populate({
          path: 'items.subjectId',
          populate: [
            { path: 'teacherId' },
            { path: 'groupId' }
          ]
        });
      
      console.log('Расписание обновлено:', populatedSchedule);
      res.json(populatedSchedule.items);
    }
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API для сохраненных расписаний
app.get('/api/saved-schedules', async (req, res) => {
  try {
    // Если указана группа, фильтруем расписания по группе
    const filter = req.query.groupId 
      ? { groupId: req.query.groupId, name: { $exists: true, $ne: 'Основной' } }
      : { name: { $exists: true, $ne: 'Основной' } };
    
    // Получаем все расписания с полем name, кроме основного
    const savedSchedules = await SavedSchedule.find(filter)
      .populate('groupId')
      .sort({ createdAt: -1 });
    
    res.json(savedSchedules);
  } catch (error) {
    console.error('Error fetching saved schedules:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/saved-schedules', async (req, res) => {
  try {
    const { name, groupId, items } = req.body;
    
    if (!name || !items || !groupId) {
      return res.status(400).json({ error: 'Name, group ID and items are required' });
    }
    
    const savedSchedule = await SavedSchedule.create({
      name,
      groupId,
      items,
      createdAt: new Date()
    });
    
    const populatedSchedule = await SavedSchedule.findById(savedSchedule._id)
      .populate('groupId');
    
    res.status(201).json(populatedSchedule);
  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/saved-schedules/:id', async (req, res) => {
  try {
    const savedSchedule = await SavedSchedule.findById(req.params.id)
      .populate('groupId')
      .populate({
        path: 'items.subjectId',
        populate: [
          { path: 'teacherId' },
          { path: 'groupId' }
        ]
      });
    
    if (!savedSchedule) {
      return res.status(404).json({ error: 'Saved schedule not found' });
    }
    
    res.json(savedSchedule);
  } catch (error) {
    console.error('Error fetching saved schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/saved-schedules/:id', async (req, res) => {
  try {
    const result = await SavedSchedule.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: 'Saved schedule not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting saved schedule:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 