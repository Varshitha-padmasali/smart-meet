const express = require('express')
const {
  getMeetingAnalytics,
  submitFocusScore,
} = require('../controllers/analyticsController')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/:meetingId/focus', protect, submitFocusScore)
router.get('/:meetingId', protect, getMeetingAnalytics)

module.exports = router
