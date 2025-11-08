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
  categoryId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  // NEW: subcategory to match jury assignments
  subCategory: { 
    type: String, 
    required: true 
  }, // e.g., 'male', 'female', 'children_<ageGroupId>'
  
  // Optional fields
  score: { type: Number },
  rank: { type: Number },
  notes: { type: String }
}, { timestamps: true });

// Ensure a competitor can only participate once per competition+subcategory
participationSchema.index(
  { competitorId: 1, competitionId: 1, subCategory: 1 },
  { unique: true }
);

module.exports = mongoose.model("Participation", participationSchema);