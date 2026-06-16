const mongoose = require('mongoose')

// Message schema stores meeting chat history for replay when users join later.
const messageSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      trim: true,
      default: 'Participant',
    },
    senderUsername: {
      type: String,
      trim: true,
      default: '',
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    moderationStatus: {
      type: String,
      enum: ['clean', 'flagged', 'blocked'],
      default: 'clean',
    },
  },
  {
    timestamps: true,
  },
)

messageSchema.index({ meetingId: 1, createdAt: 1 })

module.exports = mongoose.model('Message', messageSchema)
