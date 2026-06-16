const Message = require('../models/Message')

// Returns recent chat history for a meeting room.
async function getMeetingMessages(req, res) {
  try {
    const { meetingId } = req.params

    if (!meetingId) {
      return res.status(400).json({ message: 'Meeting id is required' })
    }

    const messages = await Message.find({ meetingId })
      .sort({ createdAt: 1 })
      .limit(100)

    return res.json({ messages })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Unable to load messages',
    })
  }
}

module.exports = {
  getMeetingMessages,
}
