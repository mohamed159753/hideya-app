const { gatherParticipations, computeEntries, canShowResults } = require('../utils/resultsUtils');
const FinalResult = require('../models/FinalResult');
const mongoose = require('mongoose');

// GET /api/jury-results/can-show-results
exports.canShowResults = async (req, res) => {
  try {
    const { competitionId, categoryId } = req.query;
    const requesterId = req.user?.id || req.query.requestedBy;
    if (!competitionId || !categoryId) return res.status(400).json({ message: 'competitionId and categoryId required' });
    const result = await canShowResults(competitionId, categoryId, requesterId);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/jury-results/final-results
// compute averages (but do not save)
exports.finalResults = async (req, res) => {
  try {
    const { competitionId, categoryId } = req.query;
    if (!competitionId || !categoryId) return res.status(400).json({ message: 'competitionId and categoryId required' });
    const participations = await gatherParticipations(competitionId, categoryId);
    const entries = await computeEntries(participations);
    return res.json({ competitionId, categoryId, entries });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/jury-results/save-final-results
// Save computed final results to DB for audit trail
exports.saveFinalResults = async (req, res) => {
  try {
    const { competitionId, categoryId, note } = req.body;
    const requestedBy = req.user?.id || req.body.requestedBy;
    if (!competitionId || !categoryId) return res.status(400).json({ message: 'competitionId and categoryId required' });

    // Check permission
    const canShow = await canShowResults(competitionId, categoryId, requestedBy);
    if (!canShow.allowed) return res.status(403).json({ message: canShow.reason || 'Not allowed to save results' });

    const participations = await gatherParticipations(competitionId, categoryId);
    const entries = await computeEntries(participations);

    const fr = new FinalResult({ competitionId, categoryId, generatedBy: requestedBy, entries, note });
    await fr.save();
    return res.json(fr);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/jury-results/:id
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const doc = await FinalResult.findById(id).populate('generatedBy', 'firstName lastName');
    if (!doc) return res.status(404).json({ message: 'Result not found' });
    return res.json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
