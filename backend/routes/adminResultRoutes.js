const express = require('express');
const router = express.Router();
const adminResultsController = require('../controllers/adminResultsController');


// GET /api/admin/results - Get all results with filters
router.get('/', adminResultsController.getAllResults);

// GET /api/admin/results/statistics - Get statistics
router.get('/statistics', adminResultsController.getStatistics);

// GET /api/admin/results/history - Get result history
router.get('/history', adminResultsController.getResultHistory);

// GET /api/admin/results/export - Export multiple results
router.get('/export', adminResultsController.exportResults);

// POST /api/admin/results/compare - Compare results

// GET /api/admin/results/competition/:competitionId - Get by competition
router.get('/competition/:competitionId', adminResultsController.getResultsByCompetition);

// GET /api/admin/results/category/:categoryId - Get by category
router.get('/category/:categoryId', adminResultsController.getResultsByCategory);

// GET /api/admin/results/:id - Get single result
router.get('/:id', adminResultsController.getResultById);

// GET /api/admin/results/:id/export - Export single result
router.get('/:id/export', adminResultsController.exportSingleResult);

// DELETE /api/admin/results/:id - Delete result
router.delete('/:id', adminResultsController.deleteResult);

module.exports = router;