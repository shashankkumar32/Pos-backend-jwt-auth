const Bill = require('../models/bill');
const User = require('../models/user');

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
