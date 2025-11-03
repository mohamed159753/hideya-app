const express = require('express');
const router = express.Router();
const markController = require('../controllers/markController');

router.post('/upsert', markController.upsert);
router.get('/participation/:participationId', markController.getByParticipation);
router.get('/', markController.getByJuryAndParticipation);
router.get('/aggregate', markController.aggregateByCategory);

module.exports = router;
