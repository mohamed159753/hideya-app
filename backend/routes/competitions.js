const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Competition = require('../models/competition');

// Validation middleware
const validateCompetition = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['local', 'regional', 'national']).withMessage('Invalid competition type'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
];

// ✅ GET all competitions (populated with categories)
router.get('/', async (req, res, next) => {
  try {
    const { status, type } = req.query;
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    // 👇 Populate categoryIds to send name + _id to frontend
    const competitions = await Competition.find(query)
      .populate('categoryIds', 'name _id')
      .sort({ startDate: -1 });

    res.json(competitions);
  } catch (error) {
    next(error);
  }
});

// ✅ GET competition by ID (populated)
router.get('/:id', async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('categoryIds', 'name _id');

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    res.json(competition);
  } catch (error) {
    next(error);
  }
});

// POST new competition
router.post('/', validateCompetition, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const competition = new Competition(req.body);
    await competition.save();
    res.status(201).json(competition);
  } catch (error) {
    next(error);
  }
});

// PUT update competition
router.put('/:id', validateCompetition, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const competition = await Competition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    res.json(competition);
  } catch (error) {
    next(error);
  }
});

// DELETE competition
router.delete('/:id', async (req, res, next) => {
  try {
    const competition = await Competition.findByIdAndDelete(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    res.json({ message: 'Competition deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
