const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  competitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Competitor", required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  juryMemberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hifdhScore: { type: Number, required: true },
  tajweedScore: { type: Number, required: true },
  performanceScore: { type: Number, required: true },
  errors: { type: Number, required: true },
  totalScore: { type: Number, required: true }
});

module.exports = mongoose.model("Score", scoreSchema);
