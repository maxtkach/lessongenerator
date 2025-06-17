import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://user:1234@cluster0.eyxnagh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const subjectSchema = new mongoose.Schema({
  name: String,
  shortName: String,
  hoursPerWeek: Number,
});

const Subject = mongoose.model('Subject', subjectSchema);

const subjects = [
  { name: 'Системи керування базами даних', shortName: 'СКБД', hoursPerWeek: 2 },
  { name: 'Соціологія', shortName: 'Соціологія', hoursPerWeek: 1 },
  { name: 'Бази даних', shortName: 'Бази даних', hoursPerWeek: 3 },
  { name: 'Системи підтримки прийняття економічних рішень', shortName: 'СПЗЕ', hoursPerWeek: 3 },
  { name: 'Фізичне виховання', shortName: 'Фізичне виховання', hoursPerWeek: 1 },
  { name: 'Англійська мова', shortName: 'Англійська мова', hoursPerWeek: 2 },
  { name: 'Німецька мова', shortName: 'Німецька мова', hoursPerWeek: 1 },
  { name: 'Лінійні методи ідентифікації', shortName: 'ЛМІ', hoursPerWeek: 1 },
  { name: 'Апаратне та програмне забезпечення інформаційних систем і мереж', shortName: 'АТПІСМ', hoursPerWeek: 3 },
  { name: 'Теорія масового обслуговування', shortName: 'ТМС', hoursPerWeek: 2 }
];

async function initDb() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Очищаем коллекцию
    await Subject.deleteMany({});
    console.log('Cleared existing subjects');

    // Добавляем новые предметы
    await Subject.insertMany(subjects);
    console.log('Added new subjects');

    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

initDb(); 