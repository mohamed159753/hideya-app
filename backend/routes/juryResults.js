const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/juryResultsController');
const auth = require('../middleware/authMiddleware');

// check permission (no strict auth required, but will use req.user if present)
router.get('/can-show-results', auth.optional, ctrl.canShowResults);

// compute final results (read-only)
router.get('/final-results', auth.optional, ctrl.finalResults);

// save final results (require auth)
router.post('/save-final-results', auth.required, ctrl.saveFinalResults);

// get saved final result by id
router.get('/:id', auth.optional, ctrl.getById);

module.exports = router;
