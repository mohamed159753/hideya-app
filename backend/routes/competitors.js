const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Competitor = require('../models/competitor');

// ✅ 1. Validation for competitor personal info
const validateCompetitor = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('age').isInt({ min: 5, max: 100 }).withMessage('Age must be between 5 and 100'),
  body('classLevel').notEmpty().withMessage('Class level is required'),
  body('branch').trim().notEmpty().withMessage('Branch is required'),
];

// ✅ 2. GET all competitors
router.get('/', async (req, res, next) => {
  try {
    const { branch } = req.query;
    const query = branch ? { branch } : {};

    const competitors = await Competitor.find(query).sort({ createdAt: -1 });
    res.json(competitors);
  } catch (error) {
    next(error);
  }
});

// ✅ 3. GET one competitor
router.get('/:id', async (req, res, next) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    if (!competitor) return res.status(404).json({ message: 'Competitor not found' });
    res.json(competitor);
  } catch (error) {
    next(error);
  }
});

// ✅ 4. POST new competitor
router.post('/', validateCompetitor, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const competitor = new Competitor(req.body);
    await competitor.save();
    res.status(201).json(competitor);
  } catch (error) {
    next(error);
  }
});

// ✅ 5. PUT update competitor
router.put('/:id', validateCompetitor, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const updated = await Competitor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: 'Competitor not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// ✅ 6. DELETE competitor
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