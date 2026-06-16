const http = require('http')
const dotenv = require('dotenv')
const app = require('./app')
const connectDB = require('./config/db')
const initializeSocket = require('./socket/socketServer')

// Loads environment variables before reading database or server settings.
dotenv.config()

const PORT = process.env.PORT || 5000
const server = http.createServer(app)

// Socket.io shares the same HTTP server as Express for real-time milestones.
initializeSocket(server)

// Starts MongoDB first so the API only listens after the database is ready.
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`SmartMeet backend running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start SmartMeet backend:', error.message)
    process.exit(1)
  })
