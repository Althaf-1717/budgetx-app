const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  budgetLimits: {
    Food: { type: Number, default: 0 },
    Travel: { type: Number, default: 0 },
    Shopping: { type: Number, default: 0 },
    Health: { type: Number, default: 0 },
    Entertainment: { type: Number, default: 0 },
    Utilities: { type: Number, default: 0 },
    Other: { type: Number, default: 0 },
    Total: { type: Number, default: 1000 } // Global budget default
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
