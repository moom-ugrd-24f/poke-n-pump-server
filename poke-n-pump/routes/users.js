// routes/users.js
const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const generateInviteCode = require('../utils/generateInviteCode');
const router = express.Router();

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 사용자 생성
router.post('/', upload.single('profilePicture'), async (req, res) => {
  try {
    const { nickname, workoutPlan, shamePostSettings } = req.body;

    // 고유한 inviteCode 생성
    const inviteCode = await generateInviteCode();

    const newUser = new User({
      nickname,
      inviteCode,
      workoutPlan: JSON.parse(workoutPlan),
      shamePostSettings: JSON.parse(shamePostSettings),
      profilePicture: req.file ? req.file.path : 'uploads/default-profile.jpg' // Set default if no file
    });

    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// 사용자 조회
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
});

// 사용자 업데이트
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// 사용자 삭제
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted', deletedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

// 사용자 설정 업데이트
router.put('/:id/settings', async (req, res) => {
  try {
    const { workoutPlan, shamePostSettings } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { workoutPlan, shamePostSettings },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error });
  }
});

// 친구 목록 조회
router.get('/:id/friends', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('friends', 'nickname');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.friends); // 친구 목록만 반환
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends list', error });
  }
});

// 친구 삭제
router.post('/:userId/remove-friend', async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = await User.findById(req.params.userId);
    const friend = await User.findById(friendId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!friend) return res.status(404).json({ message: 'Friend not found' });

    // user의 친구 목록에서 friend 제거
    user.friends = user.friends.filter(id => !id.equals(friend._id));
    await user.save();

    // friend의 친구 목록에서 user 제거
    friend.friends = friend.friends.filter(id => !id.equals(user._id));
    await friend.save();

    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {    
    res.status(500).json({ message: 'Error removing friend', error });
  }
});

// poke 가능한 사용자 목록 가져오기
router.get('/:userId/poke-list', async (req, res) => {
  try {
    const { userId } = req.params;

    // 사용자 조회 및 친구 목록 가져오기
    const user = await User.findById(userId).populate('friends');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 오늘이 운동하는 날이고, 아직 gym에 가지 않은 친구들 찾기
    const pokeList = user.friends
      .filter(friend => {
        // 조건: workoutPlan에 오늘이 포함되어 있고, todayAttendance가 false인 경우
        const today = new Date().getDay();
        return (
          friend.workoutPlan.daysOfWeek.includes(today) &&
          !friend.todayAttendance
        );
      })
      .slice(0, 10) // 최대 10명만 표시

    // shamePostSettings 조건을 만족하는 사용자들만 별도로 표시
    const shamePostUsers = pokeList
      .filter(friend =>
          friend.shamePostSettings.isEnabled &&
          friend.shamePostSettings.noGymStreakLimit < friend.noGymStreak
      )
      .slice(0, 10); // 최대 10명만 표시
    
    // nickname만 포함하도록 최종 변환
    const formattedPokeList = pokeList.map(friend => ({ id: friend._id, nickname: friend.nickname }));
    const formattedShamePostUsers = shamePostUsers.map(friend => ({ id: friend._id, nickname: friend.nickname }));

    res.status(200).json({
      pokeList: formattedPokeList,
      shamePostUsers: formattedShamePostUsers, // 추가로 표시할 사용자 목록
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching poke list', error });
  }
});

// 운동 실행
router.post('/:id/complete-workout', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { noGymStreak: 0, todayAttendance: true },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Workout completed', user });
  } catch (error) {
    res.status(500).json({ message: 'Error completing workout', error });
  }
});

// 주간 랭킹 조회
router.get('/weekly-ranking', async (req, res) => {
  try {
    // 모든 사용자 데이터를 가져와 xp 기준으로 정렬
    const users = await User.find({}, 'nickname xp profilePicture') // 필요한 필드만 가져옴
      .sort({ xp: -1 }) // xp 내림차순으로 정렬
      .limit(10); // 상위 10명만 반환

    // 랭킹 데이터 형식화
    const ranking = users.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      nickname: user.nickname,
      xp: user.xp,
      profilePicture: user.profilePicture, // 프로필 사진 경로 포함
    }));

    res.status(200).json({ weeklyRanking: ranking });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weekly ranking', error });
  }
});


module.exports = router;