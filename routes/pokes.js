// routes/pokes.js
const express = require('express');
const Poke = require('../models/Poke');
const router = express.Router();

// poke 생성
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId, pokeType } = req.body;
    const newPoke = new Poke({ senderId, receiverId, pokeType });
    await newPoke.save();
    res.status(201).json(newPoke);
  } catch (error) {
    res.status(500).json({ message: 'Error sending poke', error });
  }
});

// 특정 사용자에게 온 poke 목록 조회
router.get('/:receiverId', async (req, res) => {
  try {
    const pokes = await Poke.find({ receiverId: req.params.receiverId });
    res.json(pokes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pokes', error });
  }
});

// poke 삭제
router.delete('/:pokeId', async (req, res) => {
  try {
    const poke = await Poke.findByIdAndDelete(req.params.pokeId);
    if (!poke) return res.status(404).json({ message: 'Poke not found' });
    res.json({ message: 'Poke deleted', poke });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting poke', error });
  }
});

module.exports = router;
