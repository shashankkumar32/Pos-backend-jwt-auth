const express = require('express');
const { createBill, getBills } = require('../controllers/billController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/bills', auth, createBill);
router.get('/bills', auth, getBills); // Add this line for retrieving bills

module.exports = router;
