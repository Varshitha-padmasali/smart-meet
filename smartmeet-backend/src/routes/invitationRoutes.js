const express = require('express')
const {
  getMyInvitations,
  inviteUserByUsername,
  respondToInvitation,
  revokeInvitation,
} = require('../controllers/invitationController')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/mine', protect, getMyInvitations)
router.post('/', protect, inviteUserByUsername)
router.patch('/:invitationId/respond', protect, respondToInvitation)
router.patch('/:invitationId/revoke', protect, revokeInvitation)

module.exports = router
