// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    unique: true,
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
  },
  xp: {
    type: Number,
    default: 0,
  },
  profilePicture: {
    type: String,
    default: 'uploads/default-profile.jpg', // 프로필 사진 기본값 설정
  },
  shamePostSettings: {
    isEnabled: {
      type: Boolean,
      default: false,
      required: true,
    },
    noGymStreakLimit: {
      type: Number,
      default: 5,
    },
  },
  visibility: {
    type: String,
    required: true,
    enum: ['global', 'friend'], // 'global' 또는 'friend'만 허용
    default: 'friend',
  },
  workoutPlan: {
    daysOfWeek: {
      type: [Number], 
      default: [],
      required: true, 
    },
  },
  todayAttendance: {
    type: Boolean,
    default: false,
  },
  noGymStreak: {
    type: Number,
    default: 0,
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  expoPushToken: { 
    required: true,
    type: String, 
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
