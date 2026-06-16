const express = require('express')
const { inviteUserByUsername } = require('../controllers/invitationController')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

// Invitation routes are protected because invites reveal private meeting access.
router.post('/', protect, inviteUserByUsername)

module.exports = router
