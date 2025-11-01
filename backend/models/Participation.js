// models/Participation.js
const mongoose = require("mongoose");

const participationSchema = new mongoose.Schema({
  competitorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Competitor", 
    required: true 
  },
  competitionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Competition", 
    required: true 
  },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }, // single category

  // Optional fields
  score: { type: Number },
  rank: { type: Number },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Participation", participationSchema);
