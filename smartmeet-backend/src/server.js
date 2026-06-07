const dotenv = require('dotenv')
const app = require('./app')
const connectDB = require('./config/db')

// Loads environment variables before reading database or server settings.
dotenv.config()

const PORT = process.env.PORT || 5000

// Starts MongoDB first so the API only listens after the database is ready.
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SmartMeet backend running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start SmartMeet backend:', error.message)
    process.exit(1)
  })
