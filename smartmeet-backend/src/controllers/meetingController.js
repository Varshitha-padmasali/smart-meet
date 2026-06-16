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

// Returns the full details of a single meeting including participants.
async function getMeetingById(req, res) {
  try {
    const meeting = await Meeting.findById(req.params.meetingId)
      .populate('host', 'name username email')
      .populate('participants.user', 'name username email')

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' })
    }

    const isHostOrParticipant =
      meeting.host._id.toString() === req.user._id.toString() ||
      meeting.participants.some((p) => p.user._id.toString() === req.user._id.toString())

    if (!isHostOrParticipant) {
      return res.status(403).json({ message: 'Access denied' })
    }

    return res.json({ meeting })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Unable to load meeting',
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
          joinedAt: null,
          leftAt: null,
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

// Sets meeting status to live when the host starts the meeting.
async function startMeeting(req, res) {
  try {
    const meeting = await Meeting.findById(req.params.meetingId)

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' })
    }

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can start the meeting' })
    }

    meeting.status = 'live'
    await meeting.save()

    return res.json({ meeting, message: 'Meeting started' })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Unable to start meeting',
    })
  }
}

// Ends an active meeting.
async function endMeeting(req, res) {
  try {
    const meeting = await Meeting.findById(req.params.meetingId)

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' })
    }

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can end the meeting' })
    }

    meeting.status = 'ended'
    await meeting.save()

    return res.json({ meeting, message: 'Meeting ended' })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Unable to end meeting',
    })
  }
}

// Removes a participant from a meeting (host only).
async function removeParticipant(req, res) {
  try {
    const { meetingId } = req.params
    const { userId } = req.body

    const meeting = await Meeting.findById(meetingId)

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' })
    }

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can remove participants' })
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Host cannot remove themselves' })
    }

    meeting.participants = meeting.participants.filter(
      (p) => p.user.toString() !== userId,
    )
    await meeting.save()

    return res.json({ meeting, message: 'Participant removed' })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Unable to remove participant',
    })
  }
}

module.exports = {
  createMeeting,
  endMeeting,
  getMeetingById,
  getMyMeetings,
  removeParticipant,
  startMeeting,
}
