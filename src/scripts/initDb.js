import mongoose from 'mongoose';

// Подключение к MongoDB
const MONGODB_URI = 'mongodb+srv://user:1234@cluster0.eyxnagh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Определение схем
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

// Создаем модели
const Group = mongoose.model('Group', groupSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Subject = mongoose.model('Subject', subjectSchema);

const initDb = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Создаем группы
    console.log('Создаем группы...');
    await Group.deleteMany({});
    
    const groups = [
      {
        name: 'Інформаційні системи та технології, 4 курс',
        shortName: 'З-41',
        faculty: 'Інформаційних технологій',
        year: 4
      },
      {
        name: 'Комп\'ютерні науки, 3 курс',
        shortName: 'КН-31',
        faculty: 'Інформаційних технологій',
        year: 3
      },
      {
        name: 'Кібербезпека, 2 курс',
        shortName: 'КБ-21',
        faculty: 'Інформаційних технологій',
        year: 2
      }
    ];
    
    const createdGroups = await Group.insertMany(groups);
    console.log(`Создано ${createdGroups.length} групп`);
    
    // Создаем преподавателей
    console.log('Создаем преподавателей...');
    await Teacher.deleteMany({});
    
    const teachers = [
      {
        fullName: 'Петренко Олександр Васильович',
        shortName: 'Петренко О.В.',
        department: 'Кафедра інформаційних систем',
        position: 'Доцент',
        restrictedDays: [4] // Пятница
      },
      {
        fullName: 'Іваненко Марія Петрівна',
        shortName: 'Іваненко М.П.',
        department: 'Кафедра соціології',
        position: 'Доцент',
        restrictedDays: [0, 1] // Понедельник, вторник
      },
      {
        fullName: 'Коваленко Ігор Сергійович',
        shortName: 'Коваленко І.С.',
        department: 'Кафедра інформаційних систем',
        position: 'Професор',
        restrictedDays: []
      },
      {
        fullName: 'Сидоренко Валентина Миколаївна',
        shortName: 'Сидоренко В.М.',
        department: 'Кафедра економіки',
        position: 'Старший викладач',
        restrictedDays: [3] // Четверг
      },
      {
        fullName: 'Бондаренко Тарас Романович',
        shortName: 'Бондаренко Т.Р.',
        department: 'Кафедра фізичного виховання',
        position: 'Викладач',
        restrictedDays: []
      },
      {
        fullName: 'Шевченко Людмила Олексіївна',
        shortName: 'Шевченко Л.О.',
        department: 'Кафедра іноземних мов',
        position: 'Доцент',
        restrictedDays: [2] // Среда
      },
      {
        fullName: 'Мельник Наталія Іванівна',
        shortName: 'Мельник Н.І.',
        department: 'Кафедра іноземних мов',
        position: 'Старший викладач',
        restrictedDays: []
      },
      {
        fullName: 'Ткаченко Юрій Володимирович',
        shortName: 'Ткаченко Ю.В.',
        department: 'Кафедра інформаційних систем',
        position: 'Доцент',
        restrictedDays: [0] // Понедельник
      },
      {
        fullName: 'Кравченко Олена Дмитрівна',
        shortName: 'Кравченко О.Д.',
        department: 'Кафедра інформаційних систем',
        position: 'Доцент',
        restrictedDays: []
      },
      {
        fullName: 'Савченко Роман Степанович',
        shortName: 'Савченко Р.С.',
        department: 'Кафедра математики',
        position: 'Професор',
        restrictedDays: [4] // Пятница
      }
    ];
    
    const createdTeachers = await Teacher.insertMany(teachers);
    console.log(`Создано ${createdTeachers.length} преподавателей`);
    
    // Создаем предметы для каждой группы
    console.log('Создаем предметы...');
    await Subject.deleteMany({});
    
    // Предметы для группы З-41
    const z41Group = createdGroups.find(g => g.shortName === 'З-41');
    if (!z41Group) {
      throw new Error('Группа З-41 не найдена');
    }
    
    // Находим преподавателей по shortName
    const findTeacher = (shortName) => {
      const teacher = createdTeachers.find(t => t.shortName === shortName);
      if (!teacher) {
        throw new Error(`Преподаватель ${shortName} не найден`);
      }
      return teacher;
    };
    
    const z41Subjects = [
      {
        name: 'Системи керування базами даних',
        shortName: 'СКБД',
        hoursPerWeek: 4,
        teacherId: findTeacher('Петренко О.В.')._id,
        groupId: z41Group._id,
        restrictedDays: []
      },
      {
        name: 'Соціологія',
        shortName: 'Соціологія',
        hoursPerWeek: 2,
        teacherId: findTeacher('Іваненко М.П.')._id,
        groupId: z41Group._id,
        restrictedDays: []
      },
      {
        name: 'Бази даних',
        shortName: 'Бази даних',
        hoursPerWeek: 4,
        teacherId: findTeacher('Коваленко І.С.')._id,
        groupId: z41Group._id,
        restrictedDays: []
      },
      {
        name: 'Системи підтримки прийняття економічних рішень',
        shortName: 'СПЗЕ',
        hoursPerWeek: 2,
        teacherId: findTeacher('Сидоренко В.М.')._id,
        groupId: z41Group._id,
        restrictedDays: []
      },
      {
        name: 'Фізичне виховання',
        shortName: 'Фізичне виховання',
        hoursPerWeek: 2,
        teacherId: findTeacher('Бондаренко Т.Р.')._id,
        groupId: z41Group._id,
        restrictedDays: []
      },
      {
        name: 'Англійська мова',
        shortName: 'Англійська мова',
        hoursPerWeek: 3,
        teacherId: findTeacher('Шевченко Л.О.')._id,
        groupId: z41Group._id,
        restrictedDays: []
      },
      {
        name: 'Німецька мова',
        shortName: 'Німецька мова',
        hoursPerWeek: 2,
        teacherId: findTeacher('Мельник Н.І.')._id,
        groupId: z41Group._id,
        restrictedDays: []
      },
      {
        name: 'Лінійні методи ідентифікації',
        shortName: 'ЛМІ',
        hoursPerWeek: 3,
        teacherId: findTeacher('Ткаченко Ю.В.')._id,
        groupId: z41Group._id,
        restrictedDays: []
      },
      {
        name: 'Апаратне та програмне забезпечення інформаційних систем і мереж',
        shortName: 'АТПІСМ',
        hoursPerWeek: 4,
        teacherId: findTeacher('Кравченко О.Д.')._id,
        groupId: z41Group._id,
        restrictedDays: []
      },
      {
        name: 'Теорія масового обслуговування',
        shortName: 'ТМС',
        hoursPerWeek: 3,
        teacherId: findTeacher('Савченко Р.С.')._id,
        groupId: z41Group._id,
        restrictedDays: []
      }
    ];
    
    // Предметы для группы КН-31
    const kn31Group = createdGroups.find(g => g.shortName === 'КН-31');
    if (!kn31Group) {
      throw new Error('Группа КН-31 не найдена');
    }
    
    const kn31Subjects = [
      {
        name: 'Алгоритми і структури даних',
        shortName: 'АСД',
        hoursPerWeek: 4,
        teacherId: findTeacher('Коваленко І.С.')._id,
        groupId: kn31Group._id,
        restrictedDays: []
      },
      {
        name: 'Об\'єктно-орієнтоване програмування',
        shortName: 'ООП',
        hoursPerWeek: 4,
        teacherId: findTeacher('Кравченко О.Д.')._id,
        groupId: kn31Group._id,
        restrictedDays: []
      },
      {
        name: 'Англійська мова',
        shortName: 'Англійська мова',
        hoursPerWeek: 3,
        teacherId: findTeacher('Шевченко Л.О.')._id,
        groupId: kn31Group._id,
        restrictedDays: []
      },
      {
        name: 'Фізичне виховання',
        shortName: 'Фізичне виховання',
        hoursPerWeek: 2,
        teacherId: findTeacher('Бондаренко Т.Р.')._id,
        groupId: kn31Group._id,
        restrictedDays: []
      },
      {
        name: 'Веб-програмування',
        shortName: 'Веб-програмування',
        hoursPerWeek: 3,
        teacherId: findTeacher('Петренко О.В.')._id,
        groupId: kn31Group._id,
        restrictedDays: []
      }
    ];
    
    // Предметы для группы КБ-21
    const kb21Group = createdGroups.find(g => g.shortName === 'КБ-21');
    if (!kb21Group) {
      throw new Error('Группа КБ-21 не найдена');
    }
    
    const kb21Subjects = [
      {
        name: 'Основи криптографії',
        shortName: 'Криптографія',
        hoursPerWeek: 3,
        teacherId: findTeacher('Савченко Р.С.')._id,
        groupId: kb21Group._id,
        restrictedDays: []
      },
      {
        name: 'Захист інформації',
        shortName: 'Захист інформації',
        hoursPerWeek: 4,
        teacherId: findTeacher('Ткаченко Ю.В.')._id,
        groupId: kb21Group._id,
        restrictedDays: []
      },
      {
        name: 'Англійська мова',
        shortName: 'Англійська мова',
        hoursPerWeek: 3,
        teacherId: findTeacher('Шевченко Л.О.')._id,
        groupId: kb21Group._id,
        restrictedDays: []
      },
      {
        name: 'Фізичне виховання',
        shortName: 'Фізичне виховання',
        hoursPerWeek: 2,
        teacherId: findTeacher('Бондаренко Т.Р.')._id,
        groupId: kb21Group._id,
        restrictedDays: []
      },
      {
        name: 'Операційні системи',
        shortName: 'ОС',
        hoursPerWeek: 3,
        teacherId: findTeacher('Кравченко О.Д.')._id,
        groupId: kb21Group._id,
        restrictedDays: []
      }
    ];
    
    // Объединяем все предметы
    const allSubjects = [...z41Subjects, ...kn31Subjects, ...kb21Subjects];
    
    // Сохраняем предметы
    await Subject.insertMany(allSubjects);
    console.log(`Создано ${allSubjects.length} предметов`);
    
    console.log('База данных успешно инициализирована');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDb(); 