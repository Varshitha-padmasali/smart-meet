const express = require('express')
const {
  createMeeting,
  deleteMeeting,
  endMeeting,
  getMeetingById,
  getMyMeetings,
  removeParticipant,
  startMeeting,
} = require('../controllers/meetingController')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, getMyMeetings)
router.post('/', protect, createMeeting)
router.delete('/:meetingId', protect, deleteMeeting)
router.get('/:meetingId', protect, getMeetingById)
router.patch('/:meetingId/start', protect, startMeeting)
router.patch('/:meetingId/end', protect, endMeeting)
router.delete('/:meetingId/participants', protect, removeParticipant)

module.exports = router
