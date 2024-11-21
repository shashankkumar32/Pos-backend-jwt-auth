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
    const today = new Date();

    // Define start of day, week, and month
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(moment().startOf('isoWeek')); // Start of the week
    const startOfMonth = new Date(moment().startOf('month')); // Start of the month

    // Aggregate data
    const summary = await Bill.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth, // Consider bills from the start of the current month
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

exports.getTopOrderedItems = async (req, res) => {
  try {
    const topItems = await Bill.aggregate([
      // Unwind cartItems to treat each item as a separate document
      { $unwind: "$cartItems" },
      
      // Group by itemName and sum the quantities
      {
        $group: {
          _id: "$cartItems.itemName", // Group by itemName
          totalQuantity: { $sum: "$cartItems.quantity" },
        },
      },
      
      // Sort by totalQuantity in descending order
      { $sort: { totalQuantity: -1 } },
      
      // Limit to top 5 items
      { $limit: 5 },
    ]);

    res.status(200).json(topItems);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving top ordered items', error: error.message });
  }
};