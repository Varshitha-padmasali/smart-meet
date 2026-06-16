const { Server } = require('socket.io')
const Message = require('../models/Message')

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

    // Relays a WebRTC offer from one participant to the target peer.
    socket.on('webrtc:offer', ({ offer, targetSocketId }) => {
      if (!offer || !targetSocketId) {
        socket.emit('webrtc:error', { message: 'Offer and target are required' })
        return
      }

      io.to(targetSocketId).emit('webrtc:offer', {
        offer,
        senderSocketId: socket.id,
      })
    })

    // Relays a WebRTC answer back to the peer that created the offer.
    socket.on('webrtc:answer', ({ answer, targetSocketId }) => {
      if (!answer || !targetSocketId) {
        socket.emit('webrtc:error', { message: 'Answer and target are required' })
        return
      }

      io.to(targetSocketId).emit('webrtc:answer', {
        answer,
        senderSocketId: socket.id,
      })
    })

    // Relays ICE candidates so peers can establish the best network path.
    socket.on('webrtc:ice-candidate', ({ candidate, targetSocketId }) => {
      if (!candidate || !targetSocketId) {
        socket.emit('webrtc:error', {
          message: 'ICE candidate and target are required',
        })
        return
      }

      io.to(targetSocketId).emit('webrtc:ice-candidate', {
        candidate,
        senderSocketId: socket.id,
      })
    })

    // Lets a participant leave a room and notifies remaining peers.
    socket.on('meeting:leave', ({ meetingId }) => {
      if (!meetingId) {
        return
      }

      socket.leave(meetingId)
      socket.to(meetingId).emit('meeting:participant-left', {
        socketId: socket.id,
      })
    })

    // Broadcasts a chat message to everyone currently connected to the meeting room.
    socket.on('chat:send-message', async ({ meetingId, message, sender }) => {
      if (!meetingId || !message?.trim()) {
        socket.emit('chat:error', {
          message: 'Meeting id and message text are required',
        })
        return
      }

      try {
        const savedMessage = await Message.create({
          meetingId,
          senderName: sender?.name || 'Participant',
          senderUsername: sender?.username || '',
          text: message.trim(),
        })

        io.to(meetingId).emit('chat:new-message', {
          createdAt: savedMessage.createdAt,
          id: savedMessage._id,
          meetingId: savedMessage.meetingId,
          message: savedMessage.text,
          sender: {
            name: savedMessage.senderName,
            username: savedMessage.senderUsername,
          },
        })
      } catch (error) {
        socket.emit('chat:error', {
          message: 'Message could not be saved',
        })
      }
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

module.exports = initializeSocket
