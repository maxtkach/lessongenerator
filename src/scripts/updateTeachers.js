import mongoose from 'mongoose';

// Подключение к MongoDB
const MONGODB_URI = 'mongodb+srv://user:1234@cluster0.eyxnagh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Определение схемы Subject
const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  shortName: {
    type: String,
    required: true,
  },
  hoursPerWeek: {
    type: Number,
    required: true,
  },
  teacher: {
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
  }
});

const Subject = mongoose.model('Subject', subjectSchema);

const teacherData = {
  'СКБД': 'Петренко О.В.',
  'Соціологія': 'Іваненко М.П.',
  'Бази даних': 'Коваленко І.С.',
  'СПЗЕ': 'Сидоренко В.М.',
  'Фізичне виховання': 'Бондаренко Т.Р.',
  'Англійська мова': 'Шевченко Л.О.',
  'Німецька мова': 'Мельник Н.І.',
  'ЛМІ': 'Ткаченко Ю.В.',
  'АТПІСМ': 'Кравченко О.Д.',
  'ТМС': 'Савченко Р.С.'
};

const updateTeachers = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Получаем все предметы
    const subjects = await Subject.find();
    console.log(`Найдено ${subjects.length} предметов`);
    
    // Обновляем каждый предмет
    for (const subject of subjects) {
      const teacher = teacherData[subject.shortName] || '';
      
      if (teacher) {
        console.log(`Обновляем предмет ${subject.name} (${subject.shortName}): добавляем преподавателя ${teacher}`);
        
        subject.teacher = teacher;
        await subject.save();
      } else {
        console.log(`Для предмета ${subject.name} (${subject.shortName}) не найден преподаватель`);
      }
    }
    
    console.log('Все предметы успешно обновлены');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при обновлении предметов:', error);
    process.exit(1);
  }
};

updateTeachers(); 