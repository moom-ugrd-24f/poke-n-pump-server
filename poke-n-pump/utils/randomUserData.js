module.exports = () => {
  const randomNickname = `user_${Math.floor(Math.random() * 100000)}`;
  const randomInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const randomVisibility = Math.random() > 0.5 ? 'global' : 'friend';
  const randomToken = `expoToken_${Math.random().toString(36).substring(2, 12)}`;

  // 오늘 요일 계산 (0: 일요일, 1: 월요일, ..., 6: 토요일)
  const today = new Date().getDay();

  // 랜덤 운동 요일 생성, 오늘 요일 포함 보장
  const randomWorkoutDays = Array.from({ length: 7 }, (_, i) => i)
    .filter(() => Math.random() > 0.5);
  if (!randomWorkoutDays.includes(today)) {
    randomWorkoutDays.push(today);
  }

  // shamePostSettings 생성
  const noGymStreakLimit = Math.floor(Math.random() * 10) + 1; // 1~10 사이 값
  const noGymStreak =
    Math.random() > 0.7 // 70% 확률로 noGymStreakLimit보다 높은 값 생성
      ? Math.floor(Math.random() * 10) + noGymStreakLimit
      : Math.floor(Math.random() * noGymStreakLimit);
  const randomXp = Math.floor(Math.random() * 11) * 10;

  return {
    nickname: randomNickname,
    inviteCode: randomInviteCode,
    xp: randomXp,
    shamePostSettings: {
      isEnabled: Math.random() > 0.5,
      noGymStreakLimit: noGymStreakLimit,
    },
    visibility: randomVisibility,
    workoutPlan: { daysOfWeek: randomWorkoutDays },
    todayAttendance: false,
    noGymStreak: noGymStreak,
    profilePicture: 'uploads/default-profile.jpg',
    expoPushToken: randomToken,
  };
};
