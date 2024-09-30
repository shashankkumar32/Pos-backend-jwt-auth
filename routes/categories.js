const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = express.Router();

// Create Category
router.post('/categories', auth, async (req, res) => {
  const { categoryName } = req.body;
  try {
    const user = await User.findById(req.userId);
    user.categories.push({ categoryName });
    await user.save();
    res.status(201).json(user.categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/categories/:categoryId/items', auth, async (req, res) => {
  const { categoryId } = req.params;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const category = user.categories.id(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category.items); // Return the items in the specified category
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// Get Categories
router.get('/categories', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('categories');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/categories/:categoryId', auth, async (req, res) => {
  const { categoryId } = req.params;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const category = user.categories.id(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Use pull to remove the category from the categories array
    user.categories.pull(categoryId);
    await user.save();
    res.status(200).json(user.categories);
  } catch (err) {
    console.error(err);  // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
});



router.post('/categories/:categoryId/items', auth, async (req, res) => {
  const { categoryId } = req.params;
  const { itemName } = req.body;
  try {
    const user = await User.findById(req.userId);
    const category = user.categories.id(categoryId);
    category.items.push({ itemName });
    await user.save();
    res.status(201).json(category.items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/categories/:categoryId/items/:itemId', auth, async (req, res) => { 
  const { categoryId, itemId } = req.params;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const category = user.categories.id(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if the item exists
    const item = category.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Remove the item from the category's items array
    category.items.pull(itemId);
    await user.save();
    
    res.status(200).json({ message: 'Item deleted successfully', items: category.items });
  } catch (err) {
    console.error('Server error:', err); 
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
