import socket from '../services/socketService.js'

// ParticipantList shows connected participants and exposes host controls.
function ParticipantList({ participants, isHost, localSocketId }) {
  function handleMute(socketId, isMuted) {
    socket.emit(isMuted ? 'host:unmute-participant' : 'host:mute-participant', {
      targetSocketId: socketId,
    })
  }

  function handleRemove(socketId, meetingId) {
    if (!confirm('Remove this participant from the meeting?')) return
    socket.emit('host:remove-participant', { meetingId, targetSocketId: socketId })
  }

  if (participants.length === 0) {
    return (
      <p className="text-sm text-slate-500 px-1">No participants yet.</p>
    )
  }

  return (
    <ul className="space-y-2">
      {participants.map((p) => {
        const isLocal = p.socketId === localSocketId
        return (
          <li
            key={p.socketId}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
                {(p.user?.name || 'P').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {p.user?.name || 'Participant'}
                  {isLocal ? ' (You)' : ''}
                </p>
                {p.user?.username ? (
                  <p className="text-xs text-slate-500">@{p.user.username}</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {p.isMuted && (
                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                  Muted
                </span>
              )}
              {isHost && !isLocal && (
                <>
                  <button
                    onClick={() => handleMute(p.socketId, p.isMuted)}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-cyan-500 hover:text-cyan-700 transition"
                  >
                    {p.isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <button
                    onClick={() => handleRemove(p.socketId, p.meetingId)}
                    className="rounded-md bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default ParticipantList
