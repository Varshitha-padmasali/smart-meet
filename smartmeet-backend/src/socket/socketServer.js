const { Server } = require('socket.io')

// Attaches Socket.io to the HTTP server and defines base connection lifecycle events.
function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // Allows clients to subscribe to a meeting-specific real-time room.
    socket.on('meeting:join', ({ meetingId, user }) => {
      if (!meetingId) {
        socket.emit('chat:error', { message: 'Meeting id is required' })
        return
      }

      socket.join(meetingId)
      socket.to(meetingId).emit('meeting:participant-joined', {
        socketId: socket.id,
        user,
      })
    })

    // Broadcasts a chat message to everyone currently connected to the meeting room.
    socket.on('chat:send-message', ({ meetingId, message, sender }) => {
      if (!meetingId || !message?.trim()) {
        socket.emit('chat:error', {
          message: 'Meeting id and message text are required',
        })
        return
      }

      io.to(meetingId).emit('chat:new-message', {
        createdAt: new Date().toISOString(),
        id: `${socket.id}-${Date.now()}`,
        meetingId,
        message: message.trim(),
        sender,
      })
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

module.exports = initializeSocket
