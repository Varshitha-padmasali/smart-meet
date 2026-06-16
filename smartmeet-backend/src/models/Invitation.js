const mongoose = require('mongoose')

// Invitation schema controls which registered users are allowed into meetings.
const invitationSchema = new mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      index: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'revoked'],
      default: 'pending',
      index: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Prevents duplicate invitations for the same user and meeting.
invitationSchema.index({ meeting: 1, invitee: 1 }, { unique: true })

module.exports = mongoose.model('Invitation', invitationSchema)
