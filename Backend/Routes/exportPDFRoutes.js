const express = require('express');
const { exportPDF } = require('../Controllers/exportPDFController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/export-pdf', protect, exportPDF);

module.exports = router;