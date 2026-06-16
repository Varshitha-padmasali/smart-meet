import { useParams } from 'react-router-dom'
import ChatPanel from '../components/ChatPanel.jsx'
import useAuth from '../hooks/useAuth.js'

// MeetingRoomPage is the main in-call workspace before WebRTC streams are added.
function MeetingRoomPage() {
  const { meetingId } = useParams()
  const { user } = useAuth()

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
            Meeting room
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-slate-950">
                SmartMeet Room
              </h1>
              <p className="mt-2 text-sm text-slate-600">Room ID: {meetingId}</p>
            </div>
            <span className="rounded-md bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              Chat ready
            </span>
          </div>
        </div>

        <div className="grid min-h-[420px] place-items-center rounded-lg border border-slate-200 bg-slate-900 p-6 text-center shadow-sm">
          <div>
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-cyan-500 text-3xl font-bold text-white">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-normal text-white">
              Video stage
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
              Camera streams, screen sharing, and participant tiles will be added
              in the WebRTC milestones.
            </p>
          </div>
        </div>
      </div>

      <ChatPanel
        meetingId={meetingId}
        user={{
          email: user?.email,
          name: user?.name,
          username: user?.username,
        }}
      />
    </section>
  )
}

export default MeetingRoomPage
