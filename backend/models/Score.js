// models/Score.js
const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  participationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Participation", 
    required: true 
  },

  juryMemberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: true 
  },

  hifdhScore: { type: Number, required: true },
  tajweedScore: { type: Number, required: true },
  performanceScore: { type: Number, required: true },
  errors: { type: Number, required: true },

  totalScore: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Score", scoreSchema);
