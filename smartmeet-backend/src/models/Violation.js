const mongoose = require('mongoose')

const violationSchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    senderName: {
      type: String,
      trim: true,
      default: 'Participant',
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    originalText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    violationType: {
      type: String,
      enum: ['toxic', 'profanity', 'harassment', 'spam'],
      default: 'toxic',
    },
    toxicityScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    action: {
      type: String,
      enum: ['warned', 'blocked', 'removed'],
      default: 'warned',
    },
  },
  {
    timestamps: true,
  },
)

violationSchema.index({ meetingId: 1, createdAt: -1 })

module.exports = mongoose.model('Violation', violationSchema)
