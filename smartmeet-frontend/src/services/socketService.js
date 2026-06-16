import { io } from 'socket.io-client'

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// Single Socket.io client shared by real-time frontend features.
const socket = io(socketUrl, {
  autoConnect: false,
})

export default socket
