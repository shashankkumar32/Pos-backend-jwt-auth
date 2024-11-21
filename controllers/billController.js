const Bill = require('../models/bill');
const User = require('../models/user');
const mongoose = require('mongoose');
const moment = require('moment'); // Ensure you have moment.js installed and imported

// Create a bill
exports.createBill = async (req, res) => {
  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'No cart items provided' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalAmount = cartItems.reduce((total, item) => total + item.totalAmount, 0);

    const bill = new Bill({
      user: user._id,
      cartItems,
    });

    await bill.save();
    await User.findByIdAndUpdate(req.userId, { $push: { bills: bill._id } });

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Error creating bill', error: error.message });
  }
};

// Retrieve bills for a user
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.userId });
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving bills', error: error.message });
  }
};

// Get sales summary


exports.getSalesSummary = async (req, res) => {
  try {
    const today = new Date();
    const userId = mongoose.Types.ObjectId(req.userId); // Ensure userId is extracted properly

    // Define start of day, week, and month
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(moment().startOf('isoWeek').toDate());
    const startOfMonth = new Date(moment().startOf('month').toDate());

    // Aggregate data
    const summary = await Bill.aggregate([
      {
        $match: {
          user: userId, // Match bills for the specific user
          createdAt: {
            $gte: startOfMonth, // Filter bills from the start of the current month
          },
        },
      },
      {
        $facet: {
          day: [
            {
              $match: {
                createdAt: { $gte: startOfDay }, // Filter today's bills
              },
            },
            {
              $unwind: '$cartItems', // Unwind cart items
            },
            {
              $group: {
                _id: null,
                totalSales: { $sum: '$cartItems.quantity' }, // Total quantity of items sold
                totalEarnings: { $sum: '$cartItems.totalAmount' }, // Total earnings from cart items
              },
            },
          ],
          week: [
            {
              $match: {
                createdAt: { $gte: startOfWeek }, // Filter this week's bills
              },
            },
            {
              $unwind: '$cartItems', // Unwind cart items
            },
            {
              $group: {
                _id: null,
                totalSales: { $sum: '$cartItems.quantity' }, // Total quantity of items sold
                totalEarnings: { $sum: '$cartItems.totalAmount' }, // Total earnings from cart items
              },
            },
          ],
          month: [
            {
              $unwind: '$cartItems', // Unwind cart items
            },
            {
              $group: {
                _id: null,
                totalSales: { $sum: '$cartItems.quantity' }, // Total quantity of items sold
                totalEarnings: { $sum: '$cartItems.totalAmount' }, // Total earnings from cart items
              },
            },
          ],
        },
      },
    ]);

    // Handle empty results for facets
    const todaySummary = summary[0]?.day[0] || { totalSales: 0, totalEarnings: 0 };
    const weekSummary = summary[0]?.week[0] || { totalSales: 0, totalEarnings: 0 };
    const monthSummary = summary[0]?.month[0] || { totalSales: 0, totalEarnings: 0 };

    res.status(200).json({
      today: todaySummary,
      thisWeek: weekSummary,
      thisMonth: monthSummary,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving sales summary', error: error.message });
  }
};


// Get top ordered items
exports.getTopOrderedItems = async (req, res) => {
  try {
    const topItems = await Bill.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.userId) } },
      { $unwind: '$cartItems' },
      {
        $group: {
          _id: '$cartItems.itemName',
          totalQuantity: { $sum: '$cartItems.quantity' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    if (!topItems.length) {
      return res.status(404).json({ message: 'No top items data found for this user.' });
    }

    res.status(200).json(topItems);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
