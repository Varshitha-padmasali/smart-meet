import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatPanel from '../components/ChatPanel.jsx'
import FocusIndicator from '../components/FocusIndicator.jsx'
import ParticipantList from '../components/ParticipantList.jsx'
import VideoTile from '../components/VideoTile.jsx'
import useAuth from '../hooks/useAuth.js'
import useFocusDetection from '../hooks/useFocusDetection.js'
import useSpeechToText from '../hooks/useSpeechToText.js'
import useWebRTC from '../hooks/useWebRTC.js'
import { getMeetingById } from '../services/meetingService.js'
import socket from '../services/socketService.js'

function ControlButton({ onClick, active, danger, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-11 w-11 items-center justify-center rounded-full text-base transition shadow-sm ${
        danger
          ? 'bg-red-600 text-white hover:bg-red-700'
          : active
          ? 'bg-slate-700 text-white hover:bg-slate-600'
          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

function MeetingRoomPage() {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [meeting, setMeeting] = useState(null)
  const [activeTab, setActiveTab] = useState('chat')
  const [participants, setParticipants] = useState([])
  const [mutedSocketIds, setMutedSocketIds] = useState(new Set())
  const [focusEnabled, setFocusEnabled] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [joined, setJoined] = useState(false)
  const localVideoRef = useRef(null)

  const {
    error: rtcError,
    isAudioMuted,
    isScreenSharing,
    isVideoOff,
    localStream,
    remoteStreams,
    startMedia,
    startScreenShare,
    stopMedia,
    stopScreenShare,
    toggleAudio,
    toggleVideo,
  } = useWebRTC(meetingId)

  const { attentionScore, faceDetected, isFocused } = useFocusDetection(
    meetingId,
    localVideoRef,
    focusEnabled && joined,
  )
  const {
    error: speechError,
    isListening,
    isSupported: speechSupported,
    startListening,
    stopListening,
    transcript,
  } = useSpeechToText()

  const isHost =
    meeting?.host?._id === user?.id ||
    meeting?.host?.id === user?.id ||
    meeting?.host === user?.id

  useEffect(() => {
    async function load() {
      try {
        const data = await getMeetingById(meetingId)
        setMeeting(data.meeting)
      } catch {
        // Meeting may not be in DB (e.g., joined by code)
      }
    }
    load()
  }, [meetingId])

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (!meetingId) return

    function handleJoined({ socketId, user: remoteUser }) {
      setParticipants((prev) => {
        if (prev.find((p) => p.socketId === socketId)) return prev
        return [...prev, { isMuted: false, meetingId, socketId, user: remoteUser }]
      })
    }

    function handleLeft({ socketId }) {
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId))
    }

    function handleMuted({ socketId: sid }) {
      setMutedSocketIds((prev) => new Set([...prev, sid]))
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === sid ? { ...p, isMuted: true } : p)),
      )
    }

    function handleUnmuted({ socketId: sid }) {
      setMutedSocketIds((prev) => {
        const next = new Set(prev)
        next.delete(sid)
        return next
      })
      setParticipants((prev) =>
        prev.map((p) => (p.socketId === sid ? { ...p, isMuted: false } : p)),
      )
    }

    function handleHostRemoved() {
      stopMedia()
      navigate('/meetings')
    }

    socket.on('meeting:participant-joined', handleJoined)
    socket.on('meeting:participant-left', handleLeft)
    socket.on('meeting:participant-muted', handleMuted)
    socket.on('meeting:participant-unmuted', handleUnmuted)
    socket.on('host:removed', handleHostRemoved)

    return () => {
      socket.off('meeting:participant-joined', handleJoined)
      socket.off('meeting:participant-left', handleLeft)
      socket.off('meeting:participant-muted', handleMuted)
      socket.off('meeting:participant-unmuted', handleUnmuted)
      socket.off('host:removed', handleHostRemoved)
    }
  }, [meetingId, navigate, stopMedia])

  const handleJoin = useCallback(async () => {
    const stream = await startMedia()
    if (!stream) return
    if (!socket.connected) socket.connect()
    socket.emit('meeting:join', { meetingId, user })
    setParticipants([{ isMuted: false, meetingId, socketId: socket.id, user }])
    setJoined(true)
  }, [meetingId, startMedia, user])

  const handleLeave = useCallback(() => {
    socket.emit('meeting:leave', { meetingId })
    stopListening()
    stopMedia()
    navigate('/meetings')
  }, [meetingId, navigate, stopListening, stopMedia])

  const handleSpeechToggle = useCallback(() => {
    if (isListening) {
      stopListening()
      setSpeechEnabled(false)
      return
    }

    startListening()
    setSpeechEnabled(true)
  }, [isListening, startListening, stopListening])

  const allTiles = [
    { isLocal: true, socketId: 'local', stream: localStream, user },
    ...remoteStreams.map((r) => ({ isLocal: false, ...r })),
  ]

  const gridClass =
    allTiles.length === 1
      ? 'grid-cols-1'
      : allTiles.length <= 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : allTiles.length <= 4
      ? 'grid-cols-2'
      : 'grid-cols-2 xl:grid-cols-3'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
            Meeting room
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950">
            {meeting?.title || 'SmartMeet Room'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">ID: {meetingId}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              joined ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {joined ? 'Live' : 'Not joined'}
          </span>
          {!joined ? (
            <button
              onClick={handleJoin}
              className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 transition"
            >
              Join Meeting
            </button>
          ) : (
            <button
              onClick={handleLeave}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
            >
              Leave
            </button>
          )}
        </div>
      </div>

      {rtcError ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          {rtcError}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className={`grid gap-3 ${gridClass}`}>
            <div className="group relative">
              {localStream ? (
                <VideoTile
                  stream={localStream}
                  user={user}
                  isLocal
                  isVideoOff={isVideoOff}
                  isMuted={isAudioMuted}
                  isFocused={focusEnabled ? isFocused : null}
                />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-800">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-600 text-2xl font-bold text-white">
                      {user?.name?.charAt(0) || 'Y'}
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                      {joined ? 'Camera unavailable' : 'Click "Join Meeting" to start'}
                    </p>
                  </div>
                </div>
              )}
              <video ref={localVideoRef} autoPlay muted playsInline className="hidden" />
            </div>

            {remoteStreams.map((remote) => (
              <div className="group" key={remote.socketId}>
                <VideoTile
                  stream={remote.stream}
                  user={remote.user}
                  isHost={isHost}
                  isMuted={mutedSocketIds.has(remote.socketId)}
                  onMute={() => {
                    socket.emit(
                      mutedSocketIds.has(remote.socketId)
                        ? 'host:unmute-participant'
                        : 'host:mute-participant',
                      { targetSocketId: remote.socketId },
                    )
                  }}
                  onRemove={() => {
                    if (!confirm('Remove this participant from the meeting?')) return
                    socket.emit('host:remove-participant', {
                      meetingId,
                      targetSocketId: remote.socketId,
                    })
                  }}
                />
              </div>
            ))}
          </div>

          {joined && (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex-wrap">
              <ControlButton
                onClick={toggleAudio}
                active={isAudioMuted}
                title={isAudioMuted ? 'Unmute mic' : 'Mute mic'}
              >
                {isAudioMuted ? '🔇' : '🎤'}
              </ControlButton>
              <ControlButton
                onClick={toggleVideo}
                active={isVideoOff}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {isVideoOff ? '📷' : '📹'}
              </ControlButton>
              <ControlButton
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                active={isScreenSharing}
                title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
              >
                🖥️
              </ControlButton>
              <ControlButton
                onClick={() => setFocusEnabled((v) => !v)}
                active={focusEnabled}
                title={focusEnabled ? 'Disable focus detection' : 'Enable focus detection'}
              >
                👁️
              </ControlButton>
              <ControlButton
                onClick={handleSpeechToggle}
                active={speechEnabled && isListening}
                title={isListening ? 'Stop live transcript' : 'Start live transcript'}
              >
                CC
              </ControlButton>
              <ControlButton onClick={handleLeave} danger title="Leave meeting">
                ✕
              </ControlButton>
            </div>
          )}

          {joined && focusEnabled && (
            <FocusIndicator
              attentionScore={attentionScore}
              faceDetected={faceDetected}
              isFocused={isFocused}
            />
          )}

          {joined && speechEnabled ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-slate-950">Live transcript</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {isListening ? 'Listening' : 'Paused'}
                </span>
              </div>
              {!speechSupported || speechError ? (
                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700">
                  {speechError || 'Speech recognition is not supported in this browser.'}
                </p>
              ) : (
                <p className="mt-3 min-h-12 rounded-md bg-slate-50 p-3 text-slate-700">
                  {transcript || 'Start speaking to see captions here.'}
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex border-b border-slate-200">
            {[
              { id: 'chat', label: 'Chat' },
              { id: 'participants', label: `People (${participants.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-cyan-600 text-cyan-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' ? (
              <ChatPanel
                meetingId={meetingId}
                user={{ email: user?.email, name: user?.name, username: user?.username }}
              />
            ) : (
              <div className="p-4">
                <ParticipantList
                  participants={participants}
                  isHost={isHost}
                  localSocketId={socket.id}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingRoomPage
