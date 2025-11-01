const express = require('express');
const router = express.Router();
const controller = require('../controllers/juryAssignmentController');

// GET assignments for a competition
router.get('/', controller.getByCompetition);

// GET assignments for a user
router.get('/user/:userId', controller.getByUser);

// POST create
router.post('/', controller.create);

// PUT update
router.put('/:id', controller.update);

// DELETE
router.delete('/:id', controller.remove);

module.exports = router;
