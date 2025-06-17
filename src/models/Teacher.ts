import mongoose from 'mongoose';

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
      validator: function(v: number[]) {
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

export const Teacher = mongoose.model('Teacher', teacherSchema); 