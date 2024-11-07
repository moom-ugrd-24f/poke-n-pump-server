// routes/friendRequests.js
const express = require('express');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const router = express.Router();

// 친구 초대 요청 보내기
router.post('/send', async (req, res) => {
  try {
    const { senderId, receiverInviteCode } = req.body;

    const receiver = await User.findOne({ inviteCode: receiverInviteCode });
    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

    //const existingRequest = await FriendRequest.findOne({ senderId, receiverId: receiver._id });
    //if (existingRequest) return res.status(400).json({ message: 'Request already exists' });

    const friendRequest = new FriendRequest({ senderId, receiverId: receiver._id });
    await friendRequest.save();
    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request', error });
  }
});

// 친구 초대 요청 수락
router.post('/accept', async (req, res) => {
  try {
    const { requestId } = req.body;

    const friendRequest = await FriendRequest.findById(requestId);
    //if (!friendRequest || friendRequest.status !== 'pending') {
    //  return res.status(404).json({ message: 'Friend request not found or already accepted' });
    //}

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
  
  module.exports = router;