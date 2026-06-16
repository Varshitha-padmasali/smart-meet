const mongoose = require('mongoose')

const focusScoreSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    attentionScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    isFocused: {
      type: Boolean,
      required: true,
    },
    headOrientation: {
      pitch: { type: Number, default: 0 },
      yaw: { type: Number, default: 0 },
      roll: { type: Number, default: 0 },
    },
    faceDetected: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

focusScoreSchema.index({ meetingId: 1, userId: 1, createdAt: -1 })

module.exports = mongoose.model('FocusScore', focusScoreSchema)
