import mongoose from 'mongoose';

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
    max: 4 // 0-4 для Пн-Пт
  },
  period: {
    type: Number,
    required: true,
    min: 1,
    max: 5 // 1-5 пары
  }
});

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

// Обновляем updatedAt при каждом сохранении
scheduleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Schedule = mongoose.model('Schedule', scheduleSchema); 