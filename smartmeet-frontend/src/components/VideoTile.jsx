import { useEffect, useRef } from 'react'

// VideoTile renders a single participant's video stream with overlay info.
function VideoTile({ stream, user, isLocal = false, isMuted = false, isVideoOff = false, isFocused = null, onMute, onRemove, isHost = false }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const displayName = user?.name || (isLocal ? 'You' : 'Participant')
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-800 aspect-video">
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal || isMuted}
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-600 text-2xl font-bold text-white">
            {initials}
          </div>
        </div>
      )}

      {/* Overlay: name + status */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-white truncate max-w-[120px]">
            {displayName}
            {isLocal ? ' (You)' : ''}
          </span>
          {isMuted && (
            <span className="rounded bg-red-500/80 px-1 py-0.5 text-[10px] font-bold text-white">
              MUTED
            </span>
          )}
        </div>
        {isFocused !== null && (
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              isFocused ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'
            }`}
          >
            {isFocused ? 'Focused' : 'Away'}
          </span>
        )}
      </div>

      {/* Host controls overlay */}
      {isHost && !isLocal && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100">
          {onMute && (
            <button
              onClick={onMute}
              className="rounded bg-slate-700/90 px-2 py-1 text-[10px] font-semibold text-white hover:bg-slate-600 transition"
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="rounded bg-red-600/90 px-2 py-1 text-[10px] font-semibold text-white hover:bg-red-500 transition"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default VideoTile
