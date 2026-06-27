const cors = require('cors')
const express = require('express')
const analyticsRoutes = require('./routes/analyticsRoutes')
const authRoutes = require('./routes/authRoutes')
const invitationRoutes = require('./routes/invitationRoutes')
const meetingRoutes = require('./routes/meetingRoutes')
const messageRoutes = require('./routes/messageRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()

// Express middleware for cross-origin requests and JSON request bodies.
app.use(cors())
app.use(express.json())

// Simple health route to confirm the API server is alive.
app.get('/', (req, res) => {
  res.json({ message: 'SmartMeet API is running' })
})

// Auth routes are grouped under one API prefix for clean version growth later.
app.use('/api/auth', authRoutes)

// User search powers secure registered-user invitation pickers.
app.use('/api/users', userRoutes)

// Meeting routes stay separate from auth as the meeting domain grows.
app.use('/api/meetings', meetingRoutes)

// Invitation routes enforce username-based private meeting access.
app.use('/api/invitations', invitationRoutes)

// Message routes expose authenticated chat history.
app.use('/api/messages', messageRoutes)

// Analytics routes expose focus scores and engagement metrics.
app.use('/api/analytics', analyticsRoutes)

// Centralized fallback for unknown routes.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

module.exports = app
