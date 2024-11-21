const express = require('express');
const { createBill, getBills,getSalesSummary  } = require('../controllers/billController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/bills', auth, createBill);
router.get('/bills', auth, getBills); // Add this line for retrieving bills
router.get('/bills/summary', auth, getSalesSummary);
module.exports = router;
