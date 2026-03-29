const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const User = require('../models/User');

// @route   GET api/expenses
// @desc    Get all active user's expenses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', auth, async (req, res) => {
  const { amount, currency, category, description, date } = req.body;

  try {
    const newExpense = new Expense({
      userId: req.user.id,
      amount,
      currency,
      category,
      description,
      date: date || Date.now()
    });

    const expense = await newExpense.save();
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Ensure user owns expense
    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await expense.deleteOne();
    res.json({ success: true, message: 'Expense removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/budget
// @desc    Get user budget limits
// @access  Private
router.get('/budget', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('budgetLimits -_id');
    res.json({ success: true, data: user.budgetLimits });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/budget
// @desc    Update budget limits
// @access  Private
router.put('/budget', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Update the limits, merge with existing
    user.budgetLimits = { ...user.budgetLimits, ...req.body };
    await user.save();

    res.json({ success: true, data: user.budgetLimits });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/rates
// @desc    Return mock exchange rates
// @access  Public
router.get('/rates', (req, res) => {
  // Mock exchange rates using USD as base for demo purposes
  const mockRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.15,
    JPY: 151.20,
    AED: 3.67,
    CAD: 1.35,
    SGD: 1.34,
    AUD: 1.53,
    CHF: 0.89
  };

  res.json({
    success: true,
    base: 'USD',
    timestamp: new Date().toISOString(),
    rates: mockRates
  });
});

module.exports = router;
