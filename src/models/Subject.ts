import mongoose from 'mongoose';

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
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
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
  }
});

export const Subject = mongoose.model('Subject', subjectSchema); 