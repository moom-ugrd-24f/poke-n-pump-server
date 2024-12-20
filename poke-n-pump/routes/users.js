// routes/users.js
const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const generateInviteCode = require('../utils/generateInviteCode');
const router = express.Router();
const Poke = require('../models/Poke');
const generateRandomUserData = require('../utils/randomUserData');

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
    const { nickname, workoutPlan, shamePostSettings, visibility, expoPushToken } = req.body;

    // 고유한 inviteCode 생성
    const inviteCode = await generateInviteCode();

    // 새 사용자 데이터 생성
    const newUser = new User({
      nickname,
      inviteCode,
      expoPushToken,
      workoutPlan: workoutPlan ? JSON.parse(workoutPlan) : { daysOfWeek: [] },
      shamePostSettings: shamePostSettings
        ? JSON.parse(shamePostSettings)
        : { isEnabled: false, noGymStreakLimit: 5 },
      profilePicture: req.file ? req.file.path : 'uploads/default-profile.jpg', // 기본 프로필 사진
      visibility,
      todayAttendance: false, // 초기 값
      noGymStreak: 0, // 초기 값
    });

    // 유저 저장
    const savedUser = await newUser.save();

    // 자기 자신을 friends에 추가
    savedUser.friends.push(savedUser._id);
    await savedUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// 랜덤 유저 생성
router.post('/random', async (req, res) => {
  try {
    const randomUserData = generateRandomUserData();

    // 새로운 User 인스턴스 생성
    const newUser = new User(randomUserData);

     // 유저 저장
     const savedUser = await newUser.save();

     // 자기 자신을 friends에 추가
     savedUser.friends.push(savedUser._id);
     await savedUser.save();

    res.status(201).json({
      message: '랜덤 유저가 성공적으로 생성되었습니다!',
      user: savedUser,
    });
  } catch (error) {
    console.error('랜덤 유저 생성 오류:', JSON.stringify(error, null, 2));
    res.status(500).json({ message: '랜덤 유저 생성에 실패했습니다.', error: error.message || error });
  }
});


// 주간 랭킹 조회
router.get('/weekly-ranking/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 모든 사용자 데이터를 가져와 xp 기준으로 정렬
    const users = await User.find({}, 'nickname xp profilePicture') // 필요한 필드만 가져옴
      .sort({ xp: -1 }) // xp 내림차순으로 정렬
      .limit(10); // 상위 10명만 반환

    // 요청한 사용자의 정보 가져오기
    const currentUser = await User.findById(userId, 'nickname xp profilePicture');
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 랭킹 데이터 형식화
    const ranking = users.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      nickname: user.nickname,
      xp: user.xp,
      profilePicture: user.profilePicture, // 프로필 사진 경로 포함
    }));

    // 요청한 사용자의 현재 랭킹 확인
    const allUsers = await User.find({}, 'xp').sort({ xp: -1 }); // 모든 유저 xp로 정렬
    const userRank = allUsers.findIndex(user => user._id.toString() === userId) + 1;

    const userInfo = {
      rank: userRank,
      _id: currentUser._id,
      nickname: currentUser.nickname,
      xp: currentUser.xp,
      profilePicture: currentUser.profilePicture,
    };

    res.status(200).json({ weeklyRanking: ranking, currentUser: userInfo });
  } catch (error) {
    console.error('Error fetching weekly ranking:', error);
    res.status(500).json({ message: 'Error fetching weekly ranking', error });
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

// 닉네임으로 사용자 존재 여부 확인
router.get('/exists/:nickname', async (req, res) => {
  try {
    const { nickname } = req.params;

    // 사용자 검색
    const user = await User.findOne({ nickname });

    return res.status(200).json({ exists: !!user, userId: user?._id });
  } catch (error) {
    console.error('Error checking user existence:', error);
    res.status(500).json({ message: 'Error checking user existence', error });
  }
});


// 사용자 업데이트
router.put('/:id', async (req, res) => {
  try {
    const { nickname, workoutPlan, shamePostSettings, visibility, profilePicture, xp, shamePostCount } = req.body;

    // 업데이트 데이터 생성
    const updateData = {};
    if (nickname) updateData.nickname = nickname;
    if (workoutPlan) updateData.workoutPlan = workoutPlan;
    if (shamePostSettings) updateData.shamePostSettings = shamePostSettings;
    if (visibility) updateData.visibility = visibility;
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (xp) updateData.xp = xp;
    if (shamePostCount) updateData.shamePostCount = shamePostCount;

    // 사용자 업데이트
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
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

router.get('/:userId/poke-list', async (req, res) => {
  try {
    const { userId } = req.params;
    const BASE_URL = `${req.protocol}://${req.get('host')}`;

    // 1. 사용자 조회 및 친구 목록 가져오기
    const user = await User.findById(userId).populate('friends');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date().getDay();

    // 친구 데이터를 lean 형태로 변환
    const friends = user.friends.map(friend => friend.toObject());

    // 2. 전체 유저 중 visibility가 global인 사용자 가져오기
    const globalUsers = await User.find({ visibility: 'global' }).lean();

    // 친구와 global 사용자 통합
    const allPotentialUsers = [...friends, ...globalUsers];

    // 친구 ID 목록을 배열로 생성
    const friendIds = friends.map(friend => friend._id.toString());

    // 3. poke 조건 만족하는 사용자 찾기
    const pokeCandidates = allPotentialUsers.filter(candidate => {
      return (
        candidate.workoutPlan.daysOfWeek.includes(today) &&
        !candidate.todayAttendance
      );
    });

    // 4. shamePost 조건 만족하는 사용자 찾기
    const shamePostCandidates = allPotentialUsers.filter(candidate => {
      return (
        candidate.shamePostSettings.isEnabled &&
        candidate.noGymStreak > candidate.shamePostSettings.noGymStreakLimit
      );
    });

    // 5. 오늘 사용자가 poke를 보낸 사용자 제외
    const sentPokes = await Poke.find({
      senderId: userId,
      timestamp: {
        $gte: new Date().setHours(0, 0, 0, 0), // 오늘 0시부터
        $lte: new Date().setHours(23, 59, 59, 999), // 오늘 23시 59분까지
      },
    }).select('receiverId');

    const sentPokeIds = sentPokes.map(poke => poke.receiverId.toString());

    const filteredCandidates = pokeCandidates.filter(candidate => !sentPokeIds.includes(candidate._id.toString()));
    
    // 최종 후보군 중복 제거
    const sortedCandidates = filteredCandidates.filter(
      (user, index, self) => self.findIndex(u => u._id.toString() === user._id.toString()) === index
    );
    // // 6. 친구와 비친구로 분리
    // const friendCandidates = filteredCandidates.filter(candidate => friendIds.includes(candidate._id.toString()));
    // const globalCandidates = filteredCandidates.filter(candidate => !friendIds.includes(candidate._id.toString()));

    // // 7. 친구를 최대 10명까지 추출
    // const getRandomSubset = (array, count) => {
    //   const shuffled = array.sort(() => 0.5 - Math.random());
    //   return shuffled.slice(0, count);
    // };

    // const selectedFriends = getRandomSubset(friendCandidates, 10);

    // // 8. 친구가 10명 미만인 경우 global 사용자로 채우기
    // const additionalGlobalUsers = getRandomSubset(globalCandidates, 10 - selectedFriends.length);
    // const sortedCandidates = [...selectedFriends, ...additionalGlobalUsers];
    // 6. 최종 결과 반환 (isShamePostCandidate 및 isFriend 속성 추가)
    const finalCandidates = sortedCandidates.map(candidate => ({
      id: candidate._id,
      nickname: candidate.nickname,
      profilePicture: `${BASE_URL}/${candidate.profilePicture}`,
      expoPushToken: candidate.expoPushToken,
      isShamePostCandidate: shamePostCandidates.some(shameCandidate => shameCandidate._id.toString() === candidate._id.toString()),
      isFriend: friendIds.includes(candidate._id.toString()), // 친구 여부
    }));

    res.status(200).json(finalCandidates);
  } catch (error) {
    console.error('Error fetching poke list:', error);
    res.status(500).json({ message: 'Error fetching poke list', error });
  }
});



// 운동 실행
router.post('/:id/complete-workout', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date().getDay();
    let update = { noGymStreak: 0, todayAttendance: true };

    // Check if today is part of the user's workout plan and update gymStreak if it is
    if (user.workoutPlan.daysOfWeek.includes(today)) {
      update.gymStreak = user.gymStreak + 1;
    }

    // Update the user with either incremented gymStreak or just resetting noGymStreak and marking attendance
    const updatedUser = await User.findByIdAndUpdate(req.params.id, update, { new: true });

    res.json({ message: 'Workout completed', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error completing workout', error });
  }
});


module.exports = router;