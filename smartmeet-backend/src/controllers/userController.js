const User = require('../models/User')

// Returns a small, safe set of registered users for the meeting invite picker.
async function searchUsers(req, res) {
  try {
    const query = req.query.q?.trim()
    if (!query || query.length < 2) return res.json({ users: [] })

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: escapedQuery, $options: 'i' } },
        { name: { $regex: escapedQuery, $options: 'i' } },
        { email: { $regex: escapedQuery, $options: 'i' } },
      ],
    })
      .select('name username email')
      .limit(8)
      .lean()

    return res.json({ users })
  } catch (error) {
    return res.status(500).json({ error: error.message, message: 'Unable to search users' })
  }
}

module.exports = { searchUsers }
