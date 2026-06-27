const Meeting = require('../models/Meeting')
const FocusScore = require('../models/FocusScore')
const Invitation = require('../models/Invitation')
const Message = require('../models/Message')
const User = require('../models/User')
const Violation = require('../models/Violation')

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
    const { description = '', inviteeUsernames = [], scheduledAt, title } = req.body

    if (!title || !scheduledAt) {
      return res.status(400).json({
        message: 'Meeting title and scheduled date are required',
      })
    }

    if (!Array.isArray(inviteeUsernames)) {
      return res.status(400).json({ message: 'Invitees must be provided as a list of usernames' })
    }

    const scheduledDate = new Date(scheduledAt)

    if (Number.isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        message: 'Scheduled date must be a valid date',
      })
    }

    const normalizedUsernames = [...new Set(
      inviteeUsernames.map((username) => username.trim().toLowerCase()).filter(Boolean),
    )]
    const invitees = normalizedUsernames.length
      ? await User.find({ username: { $in: normalizedUsernames }, _id: { $ne: req.user._id } })
      : []

    if (invitees.length !== normalizedUsernames.length) {
      return res.status(400).json({
        message: 'One or more selected users no longer exist. Refresh the invite list and try again.',
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

    try {
      if (invitees.length) {
        await Invitation.insertMany(
          invitees.map((invitee) => ({
            invitedBy: req.user._id,
            invitee: invitee._id,
            meeting: meeting._id,
          })),
        )
      }
    } catch (invitationError) {
      await Meeting.findByIdAndDelete(meeting._id)
      throw invitationError
    }

    return res.status(201).json({
      meeting,
      message: invitees.length
        ? `Meeting created and ${invitees.length} invitation${invitees.length === 1 ? '' : 's'} sent`
        : 'Meeting created successfully',
    })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Meeting creation failed',
    })
  }
}

// Deletes a host-owned meeting and all data that belongs exclusively to it.
async function deleteMeeting(req, res) {
  try {
    const meeting = await Meeting.findById(req.params.meetingId)
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' })
    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can delete this meeting' })
    }

    await Promise.all([
      FocusScore.deleteMany({ meetingId: meeting._id }),
      Invitation.deleteMany({ meeting: meeting._id }),
      Message.deleteMany({ meetingId: meeting._id }),
      Violation.deleteMany({ meetingId: meeting._id }),
    ])
    await meeting.deleteOne()

    return res.json({ message: 'Meeting deleted successfully' })
  } catch (error) {
    return res.status(500).json({ error: error.message, message: 'Unable to delete meeting' })
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
  deleteMeeting,
  endMeeting,
  getMeetingById,
  getMyMeetings,
  removeParticipant,
  startMeeting,
}
