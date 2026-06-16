const Meeting = require('../models/Meeting')

// Lists meetings owned by or joined by the authenticated user.
async function getMyMeetings(req, res) {
  try {
    const meetings = await Meeting.find({
      $or: [
        { host: req.user._id },
        { 'participants.user': req.user._id },
      ],
    })
      .populate('host', 'name username email')
      .sort({ scheduledAt: 1 })

    return res.json({ meetings })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Unable to load meetings',
    })
  }
}

// Creates a meeting owned by the authenticated user.
async function createMeeting(req, res) {
  try {
    const { description = '', scheduledAt, title } = req.body

    if (!title || !scheduledAt) {
      return res.status(400).json({
        message: 'Meeting title and scheduled date are required',
      })
    }

    const scheduledDate = new Date(scheduledAt)

    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        message: 'Scheduled date must be a valid date',
      })
    }

    const meeting = await Meeting.create({
      description,
      host: req.user._id,
      participants: [
        {
          role: 'host',
          user: req.user._id,
        },
      ],
      scheduledAt: scheduledDate,
      title,
    })

    return res.status(201).json({
      meeting,
      message: 'Meeting created successfully',
    })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Meeting creation failed',
    })
  }
}

module.exports = {
  createMeeting,
  getMyMeetings,
}
