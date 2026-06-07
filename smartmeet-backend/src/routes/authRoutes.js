const express = require('express')
const { getCurrentUser, login, signup } = require('../controllers/authController')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

// Public authentication routes for creating and accessing user accounts.
router.post('/signup', signup)
router.post('/login', login)

// Example protected route to verify JWT authentication is working.
router.get('/me', protect, getCurrentUser)

module.exports = router
