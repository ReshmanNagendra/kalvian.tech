const mongoose = require('mongoose')

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Waitlist', waitlistSchema)
