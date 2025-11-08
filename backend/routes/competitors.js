const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Competitor = require('../models/Competitor');
const Branch = require('../models/Branch');

// ✅ Validation for competitor personal info
const validateCompetitor = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('age').isInt({ min: 5, max: 100 }).withMessage('Age must be between 5 and 100'),
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required')
    .custom(async (value) => {
      const branchExists = await Branch.findById(value);
      if (!branchExists) throw new Error('Branch does not exist');
      return true;
    }),
];

// ✅ GET all competitors
router.get('/', async (req, res, next) => {
  try {
    const { branch } = req.query;
    const query = branch ? { branch } : {};

    // Populate branch name
    const competitors = await Competitor.find(query)
      .populate('branch', 'name') // <--- populate branch name only
      .sort({ createdAt: -1 });

    res.json(competitors);
  } catch (error) {
    next(error);
  }
});

// ✅ GET one competitor
router.get('/:id', async (req, res, next) => {
  try {
    const competitor = await Competitor.findById(req.params.id).populate('branch', 'name');
    if (!competitor) return res.status(404).json({ message: 'Competitor not found' });
    res.json(competitor);
  } catch (error) {
    next(error);
  }
});

// ✅ POST new competitor
router.post('/', validateCompetitor, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const competitor = new Competitor(req.body);
    await competitor.save();

    // Populate branch before returning
    const populated = await competitor.populate('branch', 'name');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

// ✅ PUT update competitor
router.put('/:id', validateCompetitor, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const updated = await Competitor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('branch', 'name'); // populate branch name

    if (!updated) return res.status(404).json({ message: 'Competitor not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// ✅ DELETE competitor
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Competitor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Competitor not found' });
    res.json({ message: 'Competitor deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
