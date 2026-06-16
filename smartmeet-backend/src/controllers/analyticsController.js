const FocusScore = require('../models/FocusScore')
const Violation = require('../models/Violation')

// Records a focus data point from a meeting participant.
async function submitFocusScore(req, res) {
  try {
    const { meetingId } = req.params
    const { attentionScore, faceDetected, headOrientation, isFocused } = req.body

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

    const latestScores = await FocusScore.aggregate([
      { $match: { meetingId: require('mongoose').Types.ObjectId.createFromHexString(meetingId) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$userId',
          attentionScore: { $first: '$attentionScore' },
          faceDetected: { $first: '$faceDetected' },
          isFocused: { $first: '$isFocused' },
          userId: { $first: '$userId' },
        },
      },
      {
        $lookup: {
          as: 'user',
          foreignField: '_id',
          from: 'users',
          localField: 'userId',
          pipeline: [{ $project: { name: 1, username: 1 } }],
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmpty: true } },
    ])

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
        lowEngagementAlert: engagementPercentage < 50,
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
