// models/Competitor.js
const mongoose = require("mongoose");

const competitorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },

  classLevel: { type: String, required: true },
  branch: { type: String, required: true },

  surahRange: {
    from: { type: String, required: true },
    to: { type: String, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model("Competitor", competitorSchema);
