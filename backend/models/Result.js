const mongoose = require('mongoose');

const resultEntrySchema = new mongoose.Schema({
  participationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participation', required: true },
  competitorSnapshot: {
    firstName: String,
    lastName: String,
    competitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competitor' }
  },
  marks: [
    {
      juryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      memorizationTotal: Number,
      tajweedTotal: Number,
      performanceScore: Number,
      total: Number,
      confirmed: { type: Boolean, default: false }
    }
  ],
  count: { type: Number, default: 0 },
  avg: {
    memorization: { type: Number, default: 0 },
    tajweed: { type: Number, default: 0 },
    performance: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  }
}, { _id: false });

const resultSchema = new mongoose.Schema({
  competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  entries: { type: [resultEntrySchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
