const FocusScore = require('../models/FocusScore')
const Violation = require('../models/Violation')
const mongoose = require('mongoose')

// Records a focus data point from a meeting participant.
async function submitFocusScore(req, res) {
  try {
    const { meetingId } = req.params
    const { attentionScore, faceDetected, headOrientation, isFocused } = req.body

    if (!mongoose.isValidObjectId(meetingId)) {
      return res.status(400).json({ message: 'Focus tracking requires a valid saved meeting ID' })
    }

    if (typeof attentionScore !== 'number') {
      return res.status(400).json({ message: 'attentionScore is required' })
    }

    const record = await FocusScore.create({
      attentionScore,
      faceDetected: faceDetected ?? true,
      headOrientation: headOrientation || { pitch: 0, roll: 0, yaw: 0 },
      isFocused: isFocused ?? attentionScore >= 60,
      meetingId,
      userId: req.user._id,
    })

    return res.status(201).json({ focusScore: record })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Failed to save focus score',
    })
  }
}

// Returns aggregated focus analytics for all participants in a meeting.
async function getMeetingAnalytics(req, res) {
  try {
    const { meetingId } = req.params

    if (!mongoose.isValidObjectId(meetingId)) {
      return res.status(400).json({ message: 'Analytics require a valid saved meeting ID' })
    }

    // A populated query is compatible with all supported MongoDB Atlas tiers and avoids
    // relying on version-specific $lookup pipeline behavior.
    const scoreRecords = await FocusScore.find({ meetingId })
      .sort({ createdAt: -1 })
      .limit(2000)
      .populate('userId', 'name username')
      .lean()

    const seenUsers = new Set()
    const latestScores = scoreRecords.reduce((scores, record) => {
      const userId = record.userId?._id?.toString() || record.userId?.toString()
      if (!userId || seenUsers.has(userId)) return scores
      seenUsers.add(userId)
      scores.push({
        attentionScore: record.attentionScore,
        faceDetected: record.faceDetected,
        isFocused: record.isFocused,
        user: record.userId,
        userId,
      })
      return scores
    }, [])

    const totalParticipants = latestScores.length
    const focusedCount = latestScores.filter((s) => s.isFocused).length
    const avgAttention =
      totalParticipants > 0
        ? Math.round(latestScores.reduce((sum, s) => sum + s.attentionScore, 0) / totalParticipants)
        : 0
    const engagementPercentage =
      totalParticipants > 0 ? Math.round((focusedCount / totalParticipants) * 100) : 0

    const violations = await Violation.find({ meetingId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    return res.json({
      analytics: {
        avgAttentionScore: avgAttention,
        distractedCount: totalParticipants - focusedCount,
        engagementPercentage,
        focusedCount,
        lowEngagementAlert: totalParticipants > 0 && engagementPercentage < 50,
        participants: latestScores,
        totalParticipants,
        violations,
      },
    })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: 'Failed to load analytics',
    })
  }
}

module.exports = {
  getMeetingAnalytics,
  submitFocusScore,
}
