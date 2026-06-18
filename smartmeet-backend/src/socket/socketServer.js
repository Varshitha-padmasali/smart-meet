const { Server } = require('socket.io')
const Message = require('../models/Message')
const Violation = require('../models/Violation')

const TOXIC_PATTERNS = [
  /\b(hate|kill|stupid|idiot|dumb|loser|ugly|worthless|shut up)\b/i,
  /\b(f+u+c+k|s+h+i+t|a+s+s+h+o+l+e|b+i+t+c+h)\b/i,
]

function detectToxicity(text) {
  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(text)) {
      return { isToxic: true, score: 0.9 }
    }
  }
  return { isToxic: false, score: 0 }
}

// Attaches Socket.io to the HTTP server and defines real-time event handlers.
function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  })

  // socketId -> { meetingId, user }
  const socketMeta = new Map()
  const warningCounts = new Map()

  function emitAbuseWarning(socket, warning) {
    const nextCount = (warningCounts.get(socket.id) || 0) + 1
    warningCounts.set(socket.id, nextCount)

    socket.emit('abuse:warning', {
      ...warning,
      count: nextCount,
      severity: nextCount >= 3 ? 'high' : 'medium',
    })
  }

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    socket.on('meeting:join', ({ meetingId, user }) => {
      if (!meetingId) {
        socket.emit('chat:error', { message: 'Meeting id is required' })
        return
      }

      socket.join(meetingId)
      socketMeta.set(socket.id, { meetingId, user })

      socket.to(meetingId).emit('meeting:participant-joined', {
        socketId: socket.id,
        user,
      })
    })

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

    socket.on('meeting:leave', ({ meetingId }) => {
      if (!meetingId) return

      socket.leave(meetingId)
      socketMeta.delete(socket.id)
      socket.to(meetingId).emit('meeting:participant-left', {
        socketId: socket.id,
      })
    })

    // Host mutes a specific participant.
    socket.on('host:mute-participant', ({ targetSocketId }) => {
      if (!targetSocketId) return
      io.to(targetSocketId).emit('host:muted', { by: socket.id })
      const meta = socketMeta.get(targetSocketId)
      if (meta?.meetingId) {
        socket.to(meta.meetingId).emit('meeting:participant-muted', { socketId: targetSocketId })
      }
    })

    // Host unmutes a specific participant.
    socket.on('host:unmute-participant', ({ targetSocketId }) => {
      if (!targetSocketId) return
      io.to(targetSocketId).emit('host:unmuted', { by: socket.id })
      const meta = socketMeta.get(targetSocketId)
      if (meta?.meetingId) {
        socket.to(meta.meetingId).emit('meeting:participant-unmuted', { socketId: targetSocketId })
      }
    })

    // Host removes a participant from the meeting room.
    socket.on('host:remove-participant', ({ meetingId, targetSocketId }) => {
      if (!meetingId || !targetSocketId) return

      io.to(targetSocketId).emit('host:removed', { by: socket.id })
      const targetSocket = io.sockets.sockets.get(targetSocketId)
      if (targetSocket) {
        targetSocket.leave(meetingId)
        socketMeta.delete(targetSocketId)
      }
      socket.to(meetingId).emit('meeting:participant-left', { socketId: targetSocketId })
    })

    socket.on('chat:send-message', async ({ meetingId, message, sender }) => {
      if (!meetingId || !message?.trim()) {
        socket.emit('chat:error', {
          message: 'Meeting id and message text are required',
        })
        return
      }

      const text = message.trim()
      const { isToxic, score } = detectToxicity(text)

      try {
        const savedMessage = await Message.create({
          meetingId,
          moderationStatus: isToxic ? 'flagged' : 'clean',
          senderName: sender?.name || 'Participant',
          senderUsername: sender?.username || '',
          text,
        })

        if (isToxic) {
          await Violation.create({
            action: 'warned',
            meetingId,
            messageId: savedMessage._id,
            originalText: text,
            senderName: sender?.name || 'Participant',
            toxicityScore: score,
            violationType: 'toxic',
          }).catch(() => {})

          emitAbuseWarning(socket, {
            message: 'Your chat message was flagged. Continued violations may lead to removal.',
            source: 'chat',
          })

          socket.emit('chat:warning', {
            message: 'Your message was flagged for inappropriate content. Please keep the conversation respectful.',
          })

          io.to(meetingId).emit('chat:new-message', {
            createdAt: savedMessage.createdAt,
            flagged: true,
            id: savedMessage._id,
            meetingId: savedMessage.meetingId,
            message: '[Message flagged for inappropriate content]',
            sender: {
              name: savedMessage.senderName,
              username: savedMessage.senderUsername,
            },
          })
          return
        }

        io.to(meetingId).emit('chat:new-message', {
          createdAt: savedMessage.createdAt,
          flagged: false,
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

    // Analyzes finalized speech transcript chunks for toxic voice content.
    socket.on('voice:analyze-transcript', async ({ meetingId, sender, transcript }) => {
      if (!meetingId || !transcript?.trim()) {
        return
      }

      const text = transcript.trim()
      const { isToxic, score } = detectToxicity(text)

      if (!isToxic) {
        return
      }

      await Violation.create({
        action: 'warned',
        meetingId,
        originalText: text,
        senderName: sender?.name || 'Participant',
        toxicityScore: score,
        violationType: 'harassment',
      }).catch(() => {})

      emitAbuseWarning(socket, {
        message: 'Your speech was flagged. Continued violations may lead to removal.',
        source: 'voice',
      })

      socket.emit('voice:warning', {
        message: 'Your speech was flagged for possible toxic language.',
        transcript: text,
      })
    })

    socket.on('disconnect', () => {
      const meta = socketMeta.get(socket.id)
      if (meta?.meetingId) {
        socket.to(meta.meetingId).emit('meeting:participant-left', { socketId: socket.id })
      }
      socketMeta.delete(socket.id)
      warningCounts.delete(socket.id)
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

module.exports = initializeSocket
