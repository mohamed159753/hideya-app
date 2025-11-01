const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');

// Validation middleware
const validateCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required')
];

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { isActive } = req.query;
    
    let query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const categories = await Category.find(query).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Public
router.post('/', validateCategory, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const category = new Category(req.body);
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    next(error);
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Public
router.put('/:id', validateCategory, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    next(error);
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Public
router.delete('/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;