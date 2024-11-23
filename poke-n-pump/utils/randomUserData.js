module.exports = () => {
  const randomNickname = `user_${Math.floor(Math.random() * 100000)}`;
  const randomInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6자리 초대 코드
  const randomWorkoutDays = Array.from({ length: 7 }, (_, i) => i).filter(() => Math.random() > 0.5); // 랜덤 요일
  const randomVisibility = Math.random() > 0.5 ? 'global' : 'friend';
  const randomToken = `expoToken_${Math.random().toString(36).substring(2, 12)}`;

  return {
    nickname: randomNickname, // 닉네임
    inviteCode: randomInviteCode, // 초대 코드
    expoPushToken: randomToken, // 푸시 토큰
    workoutPlan: { daysOfWeek: randomWorkoutDays }, // 랜덤 운동 계획
    shamePostSettings: {
      isEnabled: Math.random() > 0.5, // 부끄러움 게시 활성화 여부
      noGymStreakLimit: Math.floor(Math.random() * 10) + 1, // 부끄러움 게시 한계 일수
    },
    profilePicture: 'uploads/default-profile.jpg', // 기본 프로필 사진 경로
    visibility: randomVisibility, // 공개 범위
    todayAttendance: false, // 초기 값
    noGymStreak: 0, // 초기 값
  };
};
