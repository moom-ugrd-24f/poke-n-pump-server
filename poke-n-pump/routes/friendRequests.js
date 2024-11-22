// routes/friendRequests.js
const express = require('express');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const router = express.Router();

// 친구 초대 요청 보내기
router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverInviteCode } = req.body;

    // 초대 코드를 통해 수신자 확인
    const receiver = await User.findOne({ inviteCode: receiverInviteCode });
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // 기존 요청 확인
    const existingRequest = await FriendRequest.findOne({ senderId, receiverId: receiver._id });
    if (existingRequest) {
      return res.status(400).json({ message: 'Request already exists' });
    }

    // 새 친구 요청 생성
    const friendRequest = new FriendRequest({
      senderId,
      receiverId: receiver._id,
      status: 'pending',
    });

    await friendRequest.save();

    // 응답에 수신자의 Expo Push Token 포함
    res.status(201).json({
      message: 'Friend request sent successfully',
      request: friendRequest,
      expoPushToken: receiver.expoPushToken || null, // Push Token 반환 (없을 경우 null)
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Error sending friend request', error });
  }
});


// 친구 초대 요청 수락
router.post('/accept', async (req, res) => {
  try {
    const { requestId } = req.body;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest || friendRequest.status !== 'pending') {
      return res.status(404).json({ message: 'Friend request not found or already accepted' });
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    const sender = await User.findById(friendRequest.senderId);
    const receiver = await User.findById(friendRequest.receiverId);

    sender.friends.push(receiver._id);
    receiver.friends.push(sender._id);

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: 'Friend request accepted', friendRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting friend request', error });
  }
});

// 친구 초대 요청 거절
router.post('/reject', async (req, res) => {
  try {
    const { requestId } = req.body;

    // 요청 ID로 친구 요청 찾기
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest || friendRequest.status !== 'pending') {
      return res.status(404).json({ message: 'Friend request not found or already handled' });
    }

    // 상태를 "rejected"로 변경
    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.status(200).json({ message: 'Friend request rejected', friendRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request', error });
  }
});


// 특정 사용자가 받은 모든 상태의 초대 요청 반환 (sender의 nickname 포함)
router.get('/:userId/received-requests', async (req, res) => {
  const { userId } = req.params;

  try {
    // 현재 사용자가 받은 모든 초대 요청 검색
    const receivedRequests = await FriendRequest.find({ receiverId: userId }).populate('senderId', 'nickname');

    if (!receivedRequests || receivedRequests.length === 0) {
      return res.status(404).json({ message: 'No friend requests found' });
    }

    // 요청 데이터와 함께 sender의 nickname 포함
    const requestsWithSenderNickname = receivedRequests.map(request => ({
      id: request._id,
      senderId: request.senderId._id, // sender의 ID
      senderNickname: request.senderId.nickname, // sender의 nickname
      receiverId: request.receiverId,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    }));

    // 응답 반환
    res.status(200).json(requestsWithSenderNickname);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ message: 'Failed to fetch friend requests', error });
  }
});

  
  module.exports = router;