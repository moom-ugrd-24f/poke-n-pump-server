const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// 모델 (참조용으로 추가, 필요에 따라 특정 라우터 파일에서 직접 require할 수도 있음)
const User = require('./models/User');
const Poke = require('./models/Poke');
const FriendRequest = require('./models/FriendRequest');
const scheduleNoGymStreakUpdate = require('./cronJobs/updateNoGymStreak');


// 라우터
const userRoutes = require('./routes/users');
const pokeRoutes = require('./routes/pokes');
const friendRequestRoutes = require('./routes/friendRequests');

// Express 앱 초기화
const app = express();
const PORT = process.env.PORT || 3000;

// JSON 요청 본문을 처리하기 위한 미들웨어 설정
app.use(express.json());

// MongoDB 연결 URL (로컬 MongoDB 서버에 연결)
const mongoURI = process.env.MONGODB_URI;

// MongoDB 연결 설정
mongoose.connect(mongoURI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB...', err));

// 스케줄링 작업 실행
scheduleNoGymStreakUpdate(); // 자정 업데이트 스케줄링 시작

// 각 라우터 연결
app.use('/api/users', userRoutes);                 // 사용자 관련 API
app.use('/api/pokes', pokeRoutes);                 // poke 관련 API
app.use('/api/friend-requests', friendRequestRoutes); // 친구 요청 관련 API
app.use('/uploads', express.static('uploads'));

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello, Local Server is running!');
});

const os = require('os');

app.listen(PORT, () => {
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];

  for (const iface of Object.values(networkInterfaces)) {
    iface.forEach((details) => {
      if (details.family === 'IPv4' && !details.internal) {
        addresses.push(details.address);
      }
    });
  }

  console.log(`Server is running on:`);
  addresses.forEach((addr) => console.log(`  - http://${addr}:${PORT}`));
});

