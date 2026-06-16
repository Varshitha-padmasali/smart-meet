const Invitation = require('../models/Invitation')
const Meeting = require('../models/Meeting')
const User = require('../models/User')

// Allows a meeting host to invite a registered user by username.
async function inviteUserByUsername(req, res) {
  try {
    const { meetingId, username } = req.body

    if (!meetingId || !username) {
      return res.status(400).json({
        message: 'Meeting id and username are required',
      })
    }

    const meeting = await Meeting.findById(meetingId)

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' })
    }

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the meeting host can invite participants',
      })
    }

    const normalizedUsername = username.trim().toLowerCase()
    const invitee = await User.findOne({ username: normalizedUsername })

    if (!invitee) {
      return res.status(404).json({
        message: 'No registered user found with that username',
      })
    }

    if (invitee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'Host is already part of the meeting',
      })
    }

    const invitation = await Invitation.create({
      invitedBy: req.user._id,
      invitee: invitee._id,
      meeting: meeting._id,
    })

    return res.status(201).json({
      invitation,
      message: 'Invitation sent successfully',
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This user has already been invited to the meeting',
      })
    }

    return res.status(500).json({
      error: error.message,
      message: 'Invitation failed',
    })
  }
}

// Lists pending invitations for the authenticated user.
async function getMyInvitations(req, res) {
  try {
    const invitations = await Invitation.find({
      invitee: req.user._id,
      status: 'pending',
    })
      .populate('meeting', 'title description scheduledAt status')
      .populate('invitedBy', 'name username email')
      .sort({ createdAt: -1 })

    return res.json({ invitations })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Unable to load invitations',
    })
  }
}

module.exports = {
  getMyInvitations,
  inviteUserByUsername,
}
