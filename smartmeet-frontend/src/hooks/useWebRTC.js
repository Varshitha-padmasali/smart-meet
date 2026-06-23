import { useCallback, useEffect, useRef, useState } from 'react'
import socket from '../services/socketService.js'

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

// useWebRTC manages peer connections, local/remote streams, and WebRTC signaling.
function useWebRTC(meetingId) {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState([])
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [error, setError] = useState('')

  const peerConnections = useRef(new Map())
  const localStreamRef = useRef(null)
  const screenStreamRef = useRef(null)

  const removePeer = useCallback((socketId) => {
    const pc = peerConnections.current.get(socketId)
    if (pc) {
      pc.close()
      peerConnections.current.delete(socketId)
    }
    setRemoteStreams((prev) => prev.filter((r) => r.socketId !== socketId))
  }, [])

  const createPeerConnection = useCallback(
    (targetSocketId) => {
      const pc = new RTCPeerConnection(ICE_CONFIG)

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit('webrtc:ice-candidate', { candidate, targetSocketId })
        }
      }

      pc.ontrack = ({ streams }) => {
        const stream = streams[0]
        setRemoteStreams((prev) => {
          const exists = prev.find((r) => r.socketId === targetSocketId)
          if (exists) {
            return prev.map((r) =>
              r.socketId === targetSocketId ? { ...r, stream } : r,
            )
          }
          return [...prev, { socketId: targetSocketId, stream, user: null }]
        })
      }

      pc.onconnectionstatechange = () => {
        if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
          removePeer(targetSocketId)
        }
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current)
        })
      }

      peerConnections.current.set(targetSocketId, pc)
      return pc
    },
    [removePeer],
  )

  const startMedia = useCallback(async (videoEnabled = true, audioEnabled = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioEnabled,
        video: videoEnabled,
      })
      localStreamRef.current = stream
      setLocalStream(stream)
      return stream
    } catch {
      setError('Camera/microphone access denied. Please check browser permissions.')
      return null
    }
  }, [])

  const stopMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
    setLocalStream(null)
  }, [])

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current
    if (!stream) return
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled
    })
    setIsAudioMuted((prev) => !prev)
  }, [])

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current
    if (!stream) return
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled
    })
    setIsVideoOff((prev) => !prev)
  }, [])

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop())
    screenStreamRef.current = null
    setIsScreenSharing(false)

    const originalVideoTrack = localStreamRef.current?.getVideoTracks()[0]
    if (originalVideoTrack) {
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (sender) sender.replaceTrack(originalVideoTrack)
      })
    }
    setLocalStream(localStreamRef.current)
  }, [])

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      screenStreamRef.current = screenStream
      setIsScreenSharing(true)

      const screenTrack = screenStream.getVideoTracks()[0]
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
        if (sender) sender.replaceTrack(screenTrack)
      })

      setLocalStream(new MediaStream(screenStream.getTracks()))
      screenTrack.onended = () => stopScreenShare()
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        setError('Screen sharing failed.')
      }
    }
  }, [stopScreenShare])

  useEffect(() => {
    if (!meetingId) return undefined

    async function handleParticipantJoined({ socketId, user: remoteUser }) {
      console.log('Participant joined:', socketId)
      const pc = createPeerConnection(socketId)
      setRemoteStreams((prev) => {
        if (prev.find((r) => r.socketId === socketId)) return prev
        return [...prev, { socketId, stream: null, user: remoteUser }]
      })

      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
      
        socket.emit('webrtc:offer', {
          offer,
          targetSocketId: socketId,
        })
      } catch (err) {
        console.error('WEBRTC OFFER ERROR:', err)
        setError(`Failed to create WebRTC offer: ${err.message}`)
      }
    }

    async function handleOffer({ offer, senderSocketId }) {
      let pc = peerConnections.current.get(senderSocketId)
      if (!pc) pc = createPeerConnection(senderSocketId)

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('webrtc:answer', { answer, targetSocketId: senderSocketId })
      } catch (err) {
        console.error('WEBRTC HANDLE OFFER ERROR:', err)
        setError(`Failed to handle WebRTC offer: ${err.message}`)
      }
    }

    async function handleAnswer({ answer, senderSocketId }) {
      const pc = peerConnections.current.get(senderSocketId)
      if (!pc) return
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      } catch {
        // Stale answer; ignore
      }
    }

    async function handleIceCandidate({ candidate, senderSocketId }) {
      const pc = peerConnections.current.get(senderSocketId)
      if (!pc) return
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch {
        // Stale ICE candidate; ignore
      }
    }

    function handleParticipantLeft({ socketId }) {
      removePeer(socketId)
    }

    socket.on('meeting:participant-joined', handleParticipantJoined)
    socket.on('webrtc:offer', handleOffer)
    socket.on('webrtc:answer', handleAnswer)
    socket.on('webrtc:ice-candidate', handleIceCandidate)
    socket.on('meeting:participant-left', handleParticipantLeft)

    return () => {
      socket.off('meeting:participant-joined', handleParticipantJoined)
      socket.off('webrtc:offer', handleOffer)
      socket.off('webrtc:answer', handleAnswer)
      socket.off('webrtc:ice-candidate', handleIceCandidate)
      socket.off('meeting:participant-left', handleParticipantLeft)
    }
  }, [meetingId, createPeerConnection, removePeer])

  useEffect(() => {
    const pcs = peerConnections.current
    return () => {
      pcs.forEach((pc) => pc.close())
      pcs.clear()
      stopMedia()
    }
  }, [stopMedia])

  return {
    error,
    isAudioMuted,
    isScreenSharing,
    isVideoOff,
    localStream,
    remoteStreams,
    setRemoteStreams,
    startMedia,
    startScreenShare,
    stopMedia,
    stopScreenShare,
    toggleAudio,
    toggleVideo,
  }
}

export default useWebRTC
