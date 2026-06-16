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

// Accepts or declines a pending invitation and adds the user to meeting participants.
async function respondToInvitation(req, res) {
  try {
    const { invitationId } = req.params
    const { response } = req.body

    if (!['accepted', 'declined'].includes(response)) {
      return res.status(400).json({ message: 'Response must be accepted or declined' })
    }

    const invitation = await Invitation.findOne({
      _id: invitationId,
      invitee: req.user._id,
      status: 'pending',
    })

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or already responded' })
    }

    invitation.status = response
    invitation.respondedAt = new Date()
    await invitation.save()

    if (response === 'accepted') {
      await Meeting.findByIdAndUpdate(invitation.meeting, {
        $addToSet: {
          participants: {
            joinedAt: null,
            leftAt: null,
            role: 'participant',
            user: req.user._id,
          },
        },
      })
    }

    return res.json({ invitation, message: `Invitation ${response}` })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Unable to respond to invitation',
    })
  }
}

// Revokes a previously sent invitation (host only).
async function revokeInvitation(req, res) {
  try {
    const { invitationId } = req.params

    const invitation = await Invitation.findById(invitationId).populate('meeting', 'host')

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' })
    }

    if (invitation.meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can revoke invitations' })
    }

    invitation.status = 'revoked'
    await invitation.save()

    return res.json({ invitation, message: 'Invitation revoked' })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Unable to revoke invitation',
    })
  }
}

module.exports = {
  getMyInvitations,
  inviteUserByUsername,
  respondToInvitation,
  revokeInvitation,
}
