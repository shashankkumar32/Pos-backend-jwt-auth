const User = require('../models/user');

// Add a new category for the user
exports.addCategory = async (req, res) => {
  const { categoryName } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    
    // Check if the category already exists
    const existingCategory = user.categories.find(cat => cat.categoryName === categoryName);
    if (existingCategory) return res.status(400).json({ msg: 'Category already exists' });

    user.categories.push({ categoryName, items: [] });
    await user.save();

    res.json(user.categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Add a new item to a category
exports.addItemToCategory = async (req, res) => {
  const { categoryName, itemName } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    
    const category = user.categories.find(cat => cat.categoryName === categoryName);
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    // Add item to category
    category.items.push({ itemName });
    await user.save();

    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  const { categoryName } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    
    // Remove category
    user.categories = user.categories.filter(cat => cat.categoryName !== categoryName);
    await user.save();

    res.json(user.categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete an item from a category
exports.deleteItemFromCategory = async (req, res) => {
  const { categoryName, itemName } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    
    const category = user.categories.find(cat => cat.categoryName === categoryName);
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    // Remove item from category
    category.items = category.items.filter(item => item.itemName !== itemName);
    await user.save();

    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
