const JuryAssignment = require('../models/JuryAssignment');
const User = require('../models/User');

exports.getByCompetition = async (req, res) => {
  try {
    const competitionId = req.query.competitionId || req.params.competitionId;
    if (!competitionId) return res.status(400).json({ message: 'competitionId required' });

    const assignments = await JuryAssignment.find({ competitionId })
      .populate('categoryId', 'name _id')
      .populate('juryMembers.userId', 'firstName lastName email role');

    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const assignments = await JuryAssignment.find({ 'juryMembers.userId': userId })
      .populate('competitionId', 'title _id')
      .populate('categoryId', 'name _id')
      .populate('juryMembers.userId', 'firstName lastName email role');

    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { competitionId, categoryId, classRoom, juryMembers } = req.body;
    if (!competitionId || !categoryId || !Array.isArray(juryMembers)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Ensure there's exactly one president
    const presidents = juryMembers.filter(m => m.role === 'president');
    if (presidents.length !== 1) {
      return res.status(400).json({ message: 'There must be exactly one president' });
    }

    const assignment = new JuryAssignment({ competitionId, categoryId, classRoom, juryMembers });
    await assignment.save();
    // populate via a fresh query to avoid issues with document.populate chaining
    const out = await JuryAssignment.findById(assignment._id)
      .populate('categoryId', 'name _id')
      .populate('juryMembers.userId', 'firstName lastName email role');
    res.status(201).json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    if (updates.juryMembers) {
      const presidents = updates.juryMembers.filter(m => m.role === 'president');
      if (presidents.length !== 1) {
        return res.status(400).json({ message: 'There must be exactly one president' });
      }
    }

    const assignment = await JuryAssignment.findByIdAndUpdate(id, updates, { new: true }).populate('categoryId', 'name _id').populate('juryMembers.userId', 'firstName lastName email role');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const a = await JuryAssignment.findByIdAndDelete(id);
    if (!a) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
