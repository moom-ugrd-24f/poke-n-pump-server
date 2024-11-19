// cronJobs/updateNoGymStreak.js
const cron = require('node-cron');
const User = require('../models/User'); // User 모델 가져오기

// 자정에 noGymStreak 업데이트
const scheduleNoGymStreakUpdate = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      // todayAttendance가 false인 사용자들만 선택하여 noGymStreak 증가
      await User.updateMany(
        { todayAttendance: false },
        { $inc: { noGymStreak: 1 } }
      );

      // 모든 사용자의 todayAttendance를 자정에 false로 초기화
      await User.updateMany({}, { todayAttendance: false });
      console.log('noGymStreak 및 todayAttendance 업데이트 완료');
    } catch (error) {
      console.error('자정 업데이트 실패:', error);
    }
  });
};

module.exports = scheduleNoGymStreakUpdate;
