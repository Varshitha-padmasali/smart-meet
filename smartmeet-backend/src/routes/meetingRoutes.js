const express = require('express')
const { createMeeting, getMyMeetings } = require('../controllers/meetingController')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

// Meeting routes are protected because only logged-in users can create rooms.
router.get('/', protect, getMyMeetings)
router.post('/', protect, createMeeting)

module.exports = router
