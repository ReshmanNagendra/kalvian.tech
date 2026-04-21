const express = require('express')
const router = express.Router()
const Waitlist = require('../models/Waitlist')

// POST /api/waitlist — Add email to waitlist
router.post('/', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    // Check if email already exists
    const existing = await Waitlist.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ message: 'This email is already on the waitlist!' })
    }

    const entry = new Waitlist({ email })
    await entry.save()

    const count = await Waitlist.countDocuments()

    res.status(201).json({
      message: `You're in! #${count} on the waitlist.`,
      position: count,
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This email is already on the waitlist!' })
    }
    console.error('Waitlist error:', err)
    res.status(500).json({ message: 'Something went wrong. Try again.' })
  }
})

// GET /api/waitlist — Get all waitlist entries (admin)
router.get('/', async (req, res) => {
  try {
    const entries = await Waitlist.find().sort({ joinedAt: -1 }).lean()
    res.json({
      total: entries.length,
      entries,
    })
  } catch (err) {
    console.error('Waitlist fetch error:', err)
    res.status(500).json({ message: 'Could not fetch waitlist.' })
  }
})

module.exports = router
