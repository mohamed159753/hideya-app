// models/Competitor.js
const mongoose = require("mongoose");

const competitorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },

  gender: { type: String, enum: ["ذكر", "أنثى"], required: true },



  branch: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Branch",
  required: true
},

  surahRange: {
    from: { type: String, required: true },
    to: { type: String, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model("Competitor", competitorSchema);
