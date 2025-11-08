const mongoose = require('mongoose');

const competitionCategorySchema = new mongoose.Schema({
  competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // global hizb
  ageGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgeGroup', required: true },
  gender: { type: String, enum: ['male','female'], required: true },
  // optional friendly label:
  label: { type: String } // auto-generated like "15 - 6-12 - ذكور"
}, { timestamps: true });

competitionCategorySchema.index({ competitionId: 1, categoryId: 1, ageGroupId: 1, gender: 1 }, { unique: true });

module.exports = mongoose.model('CompetitionCategory', competitionCategorySchema);
