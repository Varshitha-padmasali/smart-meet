const express = require('express')
const { createMeeting } = require('../controllers/meetingController')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

// Meeting routes are protected because only logged-in users can create rooms.
router.post('/', protect, createMeeting)

module.exports = router
