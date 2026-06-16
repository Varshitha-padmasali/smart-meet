import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/Button.jsx'
import PageHeader from '../components/PageHeader.jsx'
import useAuth from '../hooks/useAuth.js'
import {
  getInvitationErrorMessage,
  inviteUserByUsername,
} from '../services/invitationService.js'
import { getMeetingById, getMeetingErrorMessage } from '../services/meetingService.js'

function MeetingDetailsPage() {
  const { meetingId } = useParams()
  const { user } = useAuth()
  const [meeting, setMeeting] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [inviteUsername, setInviteUsername] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  const isHost =
    meeting?.host?._id === user?.id ||
    meeting?.host?.id === user?.id ||
    meeting?.host === user?.id

  useEffect(() => {
    async function load() {
      try {
        const data = await getMeetingById(meetingId)
        setMeeting(data.meeting)
      } catch (err) {
        setError(getMeetingErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [meetingId])

  async function handleInvite(event) {
    event.preventDefault()
    if (!inviteUsername.trim()) return
    setIsInviting(true)
    setInviteError('')
    setInviteStatus('')

    try {
      await inviteUserByUsername(meetingId, inviteUsername.trim())
      setInviteStatus(`Invitation sent to @${inviteUsername.trim().toLowerCase()}`)
      setInviteUsername('')
    } catch (err) {
      setInviteError(getInvitationErrorMessage(err))
    } finally {
      setIsInviting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Loading meeting details...
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {error || 'Meeting not found.'}
      </div>
    )
  }

  const statusColors = {
    cancelled: 'bg-red-50 text-red-700',
    ended: 'bg-slate-100 text-slate-600',
    live: 'bg-emerald-50 text-emerald-700',
    scheduled: 'bg-cyan-50 text-cyan-700',
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          eyebrow="Meeting details"
          title={meeting.title}
          description={meeting.description || undefined}
        />
        <div className="flex gap-3">
          <Button to={`/meeting/${meeting._id}`}>Open Room</Button>
          {isHost && (
            <Link
              to={`/analytics/${meeting._id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:border-cyan-500 hover:text-cyan-700 transition"
            >
              Analytics
            </Link>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Scheduled</p>
          <p className="mt-1 text-base font-semibold text-slate-950">
            {new Date(meeting.scheduledAt).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Status</p>
          <span
            className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              statusColors[meeting.status] || 'bg-slate-100 text-slate-600'
            }`}
          >
            {meeting.status}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Host</p>
          <p className="mt-1 text-base font-semibold text-slate-950">
            {meeting.host?.name || 'Unknown'}
          </p>
        </div>
      </div>

      {/* Participants */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Participants ({meeting.participants?.length ?? 0})
        </h2>
        <div className="mt-4 space-y-3">
          {meeting.participants?.length > 0 ? (
            meeting.participants.map((p, i) => (
              <div
                key={p.user?._id || i}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
                    {(p.user?.name || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {p.user?.name || 'Participant'}
                    </p>
                    {p.user?.email ? (
                      <p className="text-xs text-slate-500">{p.user.email}</p>
                    ) : null}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    p.role === 'host'
                      ? 'bg-cyan-50 text-cyan-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {p.role}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No participants yet.</p>
          )}
        </div>
      </div>

      {/* Invite (host only) */}
      {isHost && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Invite by username</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter a registered SmartMeet username to send an invitation.
          </p>
          <form className="mt-4 flex gap-3" onSubmit={handleInvite}>
            <input
              className="min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              onChange={(e) => setInviteUsername(e.target.value)}
              placeholder="username"
              type="text"
              value={inviteUsername}
            />
            <button
              className="min-h-11 rounded-md bg-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:opacity-70"
              disabled={isInviting || !inviteUsername.trim()}
              type="submit"
            >
              {isInviting ? 'Sending...' : 'Invite'}
            </button>
          </form>
          {inviteStatus ? (
            <p className="mt-3 text-sm font-medium text-emerald-600">{inviteStatus}</p>
          ) : null}
          {inviteError ? (
            <p className="mt-3 text-sm font-medium text-red-600">{inviteError}</p>
          ) : null}
        </div>
      )}
    </section>
  )
}

export default MeetingDetailsPage
