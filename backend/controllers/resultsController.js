const Result = require('../models/Result');
const Participation = require('../models/Participation');
const Mark = require('../models/Mark');
const JuryAssignment = require('../models/JuryAssignment');

// Check if results can be generated/shown
exports.check = async (req, res) => {
  try {
    const { competitionId, categoryId, requestedBy } = req.query;
    if (!competitionId || !categoryId) return res.status(400).json({ message: 'competitionId and categoryId required' });

    const parts = await Participation.find({ competitionId, categoryId });
    const ja = await JuryAssignment.findOne({ competitionId, categoryId });
    const juryCount = (ja?.juryMembers || []).length;

    // if no jury assignment, disallow
    if (!ja) return res.status(409).json({ message: 'No jury assignment for this category' });

    // compute whether every participation has marks from all jury members
    let allMarked = true;
    for (const p of parts) {
      const marks = await Mark.find({ participationId: p._id });
      if (marks.length < juryCount) {
        allMarked = false;
        break;
      }
    }

    // if fully marked, allow
    if (allMarked) return res.json({ allowed: true, reason: 'All jury members submitted marks' });

    // otherwise, allow only if requestedBy is president
    const presidentEntry = (ja.juryMembers || []).find(m => m.role === 'president');
    const presidentId = presidentEntry ? String(presidentEntry.userId) : null;
    if (requestedBy && presidentId && String(requestedBy) === presidentId) {
      return res.json({ allowed: true, reason: 'Allowed by president' });
    }

    return res.json({ allowed: false, reason: 'Not all marks submitted and you are not the president' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate and save results (if allowed)
exports.generate = async (req, res) => {
  try {
    const { competitionId, categoryId, requestedBy } = req.body;
    if (!competitionId || !categoryId) return res.status(400).json({ message: 'competitionId and categoryId required' });

    // reuse check logic
    const checkReq = { query: { competitionId, categoryId, requestedBy } };
    // NOTE: calling internal check logic by loading same code would be possible, but for clarity repeat minimal logic
    const parts = await Participation.find({ competitionId, categoryId }).populate('competitorId');
    const ja = await JuryAssignment.findOne({ competitionId, categoryId });
    if (!ja) return res.status(409).json({ message: 'No jury assignment for this category' });
    const juryCount = (ja.juryMembers || []).length;

    let allMarked = true;
    for (const p of parts) {
      const marks = await Mark.find({ participationId: p._id });
      if (marks.length < juryCount) {
        allMarked = false;
        break;
      }
    }

    const presidentEntry = (ja.juryMembers || []).find(m => m.role === 'president');
    const presidentId = presidentEntry ? String(presidentEntry.userId) : null;
    if (!allMarked && !(requestedBy && presidentId && String(requestedBy) === presidentId)) {
      return res.status(403).json({ message: 'Not allowed. All marks are not submitted and you are not the president' });
    }

    // compute aggregated entries and include per-jury mark details
    const entries = [];
    for (const p of parts) {
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

    // sort by avg.total desc
    entries.sort((a, b) => b.avg.total - a.avg.total);

    const result = new Result({ competitionId, categoryId, generatedBy: requestedBy, entries });
    await result.save();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get result by id
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const r = await Result.findById(id).populate('generatedBy', 'firstName lastName');
    if (!r) return res.status(404).json({ message: 'Result not found' });
    res.json(r);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// List results for competition/category (latest first)
exports.list = async (req, res) => {
  try {
    const { competitionId, categoryId } = req.query;
    const filter = {};
    if (competitionId) filter.competitionId = competitionId;
    if (categoryId) filter.categoryId = categoryId;
    const list = await Result.find(filter).sort({ createdAt: -1 }).limit(10);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
