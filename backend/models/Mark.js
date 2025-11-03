const mongoose = require('mongoose');

/**
 * Mark schema designed to capture per-question counters for memorization and tajweed
 * and an overall performance level. The model computes derived scores before save:
 * - memorizationTotal (out of 70)
 * - tajweedTotal (out of 25)
 * - performanceScore (out of 5)
 * - total (sum of above)
 */
const questionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  memorization: {
    tanbih: { type: Number, default: 0 }, // 0.5 deduction
    fath: { type: Number, default: 0 },   // 1.5 deduction
    taradud: { type: Number, default: 0 } // 3.0 deduction
  },
  tajweed: {
    ghunna: { type: Number, default: 0 },
    mad: { type: Number, default: 0 },
    makharij: { type: Number, default: 0 },
    sifat: { type: Number, default: 0 },
    usul: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  }
}, { _id: false });

const markSchema = new mongoose.Schema({
  juryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participation', required: true },
  // array of questions (flexible length)
  questions: { type: [questionSchema], default: [] },
  // performance level stored as string (متوسط, حسن, ممتاز) OR numeric; we map to score on save
  performanceLevel: { type: String, enum: ['متوسط','حسن','ممتاز','average','good','excellent'], default: 'متوسط' },

  // derived/summary fields
  memorizationTotal: { type: Number, default: 0 }, // out of 70
  tajweedTotal: { type: Number, default: 0 }, // out of 25
  performanceScore: { type: Number, default: 0 }, // out of 5
  total: { type: Number, default: 0 },
  confirmed: { type: Boolean, default: false }
}, { timestamps: true });

// deduction values (constants)
const DEDUCTIONS = {
  memorization: {
    tanbih: 0.5,
    fath: 1.5,
    taradud: 3.0
  },
  tajweedUnit: 0.25 // per mistake for tajweed counters
};

// Map performance level to score
function performanceToScore(level) {
  if (!level) return 3; // default متوسط
  const map = {
    'متوسط': 3, 'average': 3,
    'حسن': 4, 'good': 4,
    'ممتاز': 5, 'excellent': 5
  };
  return map[level] ?? 3;
}

// compute totals before save
markSchema.pre('save', function(next) {
  const doc = this;

  // compute memorization deductions
  let memDeductions = 0;
  let tajweedDeductions = 0;
  if (Array.isArray(doc.questions)) {
    for (const q of doc.questions) {
      const m = q.memorization || {};
      memDeductions += (m.tanbih || 0) * DEDUCTIONS.memorization.tanbih;
      memDeductions += (m.fath || 0) * DEDUCTIONS.memorization.fath;
      memDeductions += (m.taradud || 0) * DEDUCTIONS.memorization.taradud;

      const t = q.tajweed || {};
      // each tajweed counter uses tajweedUnit deduction
      tajweedDeductions += (t.ghunna || 0) * DEDUCTIONS.tajweedUnit;
      tajweedDeductions += (t.mad || 0) * DEDUCTIONS.tajweedUnit;
      tajweedDeductions += (t.makharij || 0) * DEDUCTIONS.tajweedUnit;
      tajweedDeductions += (t.sifat || 0) * DEDUCTIONS.tajweedUnit;
      tajweedDeductions += (t.usul || 0) * DEDUCTIONS.tajweedUnit;
      tajweedDeductions += (t.other || 0) * DEDUCTIONS.tajweedUnit;
    }
  }

  // base max scores
  const MEM_MAX = 70;
  const TAJ_MAX = 25;

  doc.memorizationTotal = Math.max(0, MEM_MAX - memDeductions);
  doc.tajweedTotal = Math.max(0, TAJ_MAX - tajweedDeductions);

  // performance
  doc.performanceScore = performanceToScore(doc.performanceLevel);

  doc.total = Math.round((doc.memorizationTotal + doc.tajweedTotal + doc.performanceScore) * 100) / 100;

  next();
});

module.exports = mongoose.model('Mark', markSchema);
