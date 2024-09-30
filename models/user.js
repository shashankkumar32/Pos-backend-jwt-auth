const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const itemSchema = new mongoose.Schema({
  itemName: String,
});

const categorySchema = new mongoose.Schema({
  categoryName: String,
  items: [itemSchema],
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  categories: [categorySchema],
  bills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bill' }], // Add this line
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);