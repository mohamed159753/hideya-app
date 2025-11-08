const mongoose = require('mongoose');

const ageGroupSchema = new mongoose.Schema({
  name: { type: String, required: true }, // "6-12", "13-16", "أطفال"
  from: { type: Number, required: false }, // inclusive
  to: { type: Number, required: false } // inclusive
}, { timestamps: true });

module.exports = mongoose.model('AgeGroup', ageGroupSchema);