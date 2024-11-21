const express = require('express');
const { createBill, getBills, getSalesSummary, getTopOrderedItems} = require('../controllers/billController');
const auth = require('../middleware/auth');
const router = express.Router();
// console.log({ createBill, getBills, getSaleSummary, getTopOrderedItems, auth });

router.post('/bills', auth, createBill);
router.get('/bills', auth, getBills); // Add this line for retrieving bills
router.get('/bills/summary', auth, getSalesSummary);
router.get('/bills/orderlist', auth, getTopOrderedItems);
module.exports = router;
