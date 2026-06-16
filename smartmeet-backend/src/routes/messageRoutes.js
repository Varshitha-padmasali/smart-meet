const express = require('express')
const { getMeetingMessages } = require('../controllers/messageController')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

// Message history is protected so only authenticated users can request chat logs.
router.get('/:meetingId', protect, getMeetingMessages)

module.exports = router
