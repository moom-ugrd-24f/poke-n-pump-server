// models/Poke.js
const mongoose = require('mongoose');

const pokeSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pokeType: {
    type: String,
    enum: ['Just Poke', 'Join Me', 'Trash Talk'], // 3가지 predefined 메시지 타입
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Poke = mongoose.model('Poke', pokeSchema);

module.exports = Poke;
