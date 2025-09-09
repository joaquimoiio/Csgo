const express = require('express');
const EarningsController = require('../controllers/earningsController');

const router = express.Router();

// Rotas para ganhos
router.post('/', EarningsController.addEarning);
router.get('/', EarningsController.getAllEarnings);
router.get('/type/:type', EarningsController.getEarningsByType);
router.get('/totals', EarningsController.getTotals);
router.delete('/:id', EarningsController.deleteEarning);

module.exports = router;