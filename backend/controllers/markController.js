const Mark = require("../models/Mark");
const Participation = require("../models/Participation");

// Create or update a mark for a jury and participation
exports.upsert = async (req, res) => {
  try {
    const { juryId, participationId, questions, performanceLevel, confirmed } =
      req.body;
    if (!juryId || !participationId)
      return res
        .status(400)
        .json({ message: "juryId and participationId required" });

    // Load participation to determine competition/category
    const participation = await Participation.findById(participationId);
    if (!participation)
      return res.status(404).json({ message: "Participation not found" });

    // If the request attempts to modify memorization counters, ensure the juryId belongs to the president for that category
    const triesToModifyMemorization =
      Array.isArray(questions) &&
      questions.some(
        (q) => q && q.memorization && Object.keys(q.memorization).length > 0
      );
      /*
    if (triesToModifyMemorization) {
      // Lazy-load JuryAssignment to check roles
      const JuryAssignment = require("../models/JuryAssignment");
      const ja = await JuryAssignment.findOne({
        competitionId: participation.competitionId,
        categoryId: participation.categoryId,
      });
      // If there's no assignment or no president, prevent non-president edits
      if (!ja)
        return res
          .status(409)
          .json({ message: "No jury assignment for this category" });
      const presidentEntry = (ja.juryMembers || []).find(
        (m) => m.role === "president"
      );
      if (!presidentEntry)
        return res
          .status(409)
          .json({ message: "No president assigned for this jury" });
      const presidentId = String(presidentEntry.userId);
      if (String(juryId) !== presidentId) {
        return res
          .status(403)
          .json({ message: "تقييم الحفظ محصور برئيس اللجنة فقط" });
      }
    } */

    let mark = await Mark.findOne({ juryId, participationId });
    if (mark) {
      if (mark.confirmed)
        return res
          .status(409)
          .json({ message: "Mark already confirmed and locked" });
      // update fields
      if (Array.isArray(questions)) mark.questions = questions;
      if (performanceLevel) mark.performanceLevel = performanceLevel;
      if (typeof confirmed === "boolean") mark.confirmed = confirmed;
      await mark.save();
    } else {
      mark = new Mark({
        juryId,
        participationId,
        questions: Array.isArray(questions) ? questions : [],
        performanceLevel,
        confirmed: !!confirmed,
      });
      await mark.save();
    }

    const populated = await Mark.findById(mark._id)
      .populate("juryId", "firstName lastName email")
      .populate("participationId");
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get marks for a participation
exports.getByParticipation = async (req, res) => {
  try {
    const participationId = req.params.participationId;
    const marks = await Mark.find({ participationId }).populate(
      "juryId",
      "firstName lastName role"
    );
    res.json(marks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get mark by jury & participation
exports.getByJuryAndParticipation = async (req, res) => {
  try {
    const { juryId, participationId } = req.query;
    if (!juryId || !participationId)
      return res
        .status(400)
        .json({ message: "juryId and participationId required" });
    const mark = await Mark.findOne({ juryId, participationId });
    res.json(mark);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Aggregation: get averaged scores per participation in a category (competitionId + categoryId)
exports.aggregateByCategory = async (req, res) => {
  try {
    const { competitionId, categoryId } = req.query;
    if (!competitionId || !categoryId)
      return res
        .status(400)
        .json({ message: "competitionId and categoryId required" });

    // Find participations
    const parts = await Participation.find({
      competitionId,
      categoryId,
    }).populate("competitorId");
    const result = [];

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
      result.push({ participation: p, count, avg });
    }

    // Sort by avg.total desc
    result.sort((a, b) => b.avg.total - a.avg.total);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
