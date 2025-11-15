const Mark = require('../models/Mark');
const Participation = require('../models/Participation');
const JuryAssignment = require('../models/JuryAssignment');
const mongoose = require('mongoose');

/**
 * Gather participations for a competition + category with competitor snapshot
 */
async function gatherParticipations(competitionId, categoryId, subCategory) {
  return Participation.find({ competitionId, categoryId, subCategory }).populate('competitorId');
}

/**
 * Compute aggregated entries for the given participations.
 * Returns entries with per-jury mark details and averages.
 */
async function computeEntries(participations) {
  const entries = [];
  for (const p of participations) {
    const marks = await Mark.find({ participationId: p._id });
    const count = marks.length;
    const totals = marks.reduce((acc, m) => {
      acc.memorization = (acc.memorization || 0) + (m.memorizationTotal || 0);
      acc.tajweed = (acc.tajweed || 0) + (m.tajweedTotal || 0);
      acc.performance = (acc.performance || 0) + (m.performanceScore || 0);
      acc.total = (acc.total || 0) + (m.total || 0);
      return acc;
    }, {});

    const avg = count
      ? {
          memorization: totals.memorization / count,
          tajweed: totals.tajweed / count,
          performance: totals.performance / count,
          total: totals.total / count,
        }
      : { memorization: 0, tajweed: 0, performance: 0, total: 0 };

    const markDetails = marks.map(m => ({
      juryId: m.juryId,
      memorizationTotal: m.memorizationTotal,
      tajweedTotal: m.tajweedTotal,
      performanceScore: m.performanceScore,
      total: m.total,
      confirmed: m.confirmed
    }));

    entries.push({
      participationId: p._id,
      competitorSnapshot: {
        firstName: p.competitorId?.firstName,
        lastName: p.competitorId?.lastName,
        competitorId: p.competitorId?._id
      },
      marks: markDetails,
      count,
      avg
    });
  }

  // sort descending by avg.total
  entries.sort((a, b) => (b.avg?.total || 0) - (a.avg?.total || 0));
  return entries;
}

/**
 * Check whether results can be shown: all jury members submitted marks
 * or requester is president (override).
 * Returns { allowed: boolean, reason: string }
 */
async function canShowResults(competitionId, categoryId, requesterId) {
  if (!mongoose.Types.ObjectId.isValid(competitionId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
    return { allowed: false, reason: 'Invalid competitionId or categoryId' };
  }

  const participations = await gatherParticipations(competitionId, categoryId);
  const ja = await JuryAssignment.findOne({ competitionId, categoryId });
  if (!ja) return { allowed: false, reason: 'No jury assignment found for this category' };

  const juryCount = (ja.juryMembers || []).length;
  // if no jury members, cannot show
  if (juryCount === 0) return { allowed: false, reason: 'No jury members assigned' };

  // ensure each participation has marks from all jury members
  for (const p of participations) {
    const marks = await Mark.find({ participationId: p._id });
    if (marks.length < juryCount) {
      // if requester is president allow override
      const presidentEntry = (ja.juryMembers || []).find(m => m.role === 'president');
      const presidentId = presidentEntry ? String(presidentEntry.userId) : null;
      if (requesterId && presidentId && String(requesterId) === presidentId) {
        return { allowed: true, reason: 'Allowed by president override' };
      }
      return { allowed: false, reason: 'Not all marks submitted' };
    }
  }

  return { allowed: true, reason: 'All jury members submitted marks' };
}

module.exports = {
  gatherParticipations,
  computeEntries,
  canShowResults
};
