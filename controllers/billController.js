const Bill = require('../models/bill');
const User = require('../models/user');

// const Bill = require('../models/bill');
const moment = require('moment'); // Optional for date calculations

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

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => total + item.totalAmount, 0);

    const bill = new Bill({
      user: user._id, // Use user ID
      cartItems,
    });

    await bill.save();

    // Update user with the new bill reference
    await User.findByIdAndUpdate(req.userId, { $push: { bills: bill._id } });

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Error creating bill', error: error.message });
  }
};

// Add a method to retrieve bills for a user
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.userId }); // Find bills associated with the user
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving bills', error: error.message });
  }
};


// Function to get sales summary
exports.getSalesSummary = async (req, res) => {
  try {
    // Current date
    const today = new Date();

    // Define start of day, week, and month
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(moment().startOf('isoWeek')); // Monday as the start of the week
    const startOfMonth = new Date(moment().startOf('month'));

    // Aggregate data
    const summary = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth, // Only consider bills from the start of the current month
          },
        },
      },
      {
        $facet: {
          day: [
            {
              $match: {
                createdAt: { $gte: startOfDay },
              },
            },
            {
              $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalEarnings: { $sum: { $sum: "$cartItems.totalAmount" } },
              },
            },
          ],
          week: [
            {
              $match: {
                createdAt: { $gte: startOfWeek },
              },
            },
            {
              $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalEarnings: { $sum: { $sum: "$cartItems.totalAmount" } },
              },
            },
          ],
          month: [
            {
              $group: {
                _id: null,
                totalSales: { $sum: 1 },
                totalEarnings: { $sum: { $sum: "$cartItems.totalAmount" } },
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      today: summary.day[0] || { totalSales: 0, totalEarnings: 0 },
      thisWeek: summary.week[0] || { totalSales: 0, totalEarnings: 0 },
      thisMonth: summary.month[0] || { totalSales: 0, totalEarnings: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving sales summary', error: error.message });
  }
};