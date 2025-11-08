const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');

router.get('/check', resultsController.check);
router.post('/generate', resultsController.generate);
router.get('/:id', resultsController.getById);
router.get('/', resultsController.list);

module.exports = router;
