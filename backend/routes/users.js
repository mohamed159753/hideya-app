const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');

const router = express.Router();

// Basic validations can be extended
router.get('/', userController.getAll);

router.post('/', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password too short'),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('role').isIn(['admin','jury'])
], userController.create);

router.put('/:id', userController.update);
router.delete('/:id', userController.remove);

module.exports = router;
