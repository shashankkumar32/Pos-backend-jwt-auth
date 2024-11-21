const Bill = require('../models/bill');
const User = require('../models/user');
const mongoose = require('mongoose');

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
exports.getSaleSummary = async (req, res) => {
  try {
    const summary = await Bill.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.userId) } },
      { $unwind: '$cartItems' },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$cartItems.totalAmount' },
          totalQuantity: { $sum: '$cartItems.quantity' },
        },
      },
    ]);

    if (!summary.length) {
      return res.status(404).json({ message: 'No sales data found for this user.' });
    }

    res.status(200).json(summary[0]);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
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
