const cors = require('cors')
const express = require('express')
const authRoutes = require('./routes/authRoutes')

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

// Centralized fallback for unknown routes.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

module.exports = app
