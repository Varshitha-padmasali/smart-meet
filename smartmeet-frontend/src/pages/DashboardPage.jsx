import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import PageHeader from '../components/PageHeader.jsx'
import useAuth from '../hooks/useAuth.js'
import {
  getInvitationErrorMessage,
  getMyInvitations,
  respondToInvitation,
} from '../services/invitationService.js'
import { getMyMeetings } from '../services/meetingService.js'

function DashboardPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [invitations, setInvitations] = useState([])
  const [invitationError, setInvitationError] = useState('')
  const [upcomingMeetings, setUpcomingMeetings] = useState([])
  const [respondingId, setRespondingId] = useState(null)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [invData, meetData] = await Promise.all([
          getMyInvitations(),
          getMyMeetings().catch(() => ({ meetings: [] })),
        ])
        setInvitations(invData.invitations)

        const now = new Date()
        const upcoming = meetData.meetings
          .filter(
            (m) =>
              new Date(m.scheduledAt) > now &&
              m.status !== 'ended' &&
              m.status !== 'cancelled',
          )
          .slice(0, 4)
        setUpcomingMeetings(upcoming)
      } catch (error) {
        setInvitationError(getInvitationErrorMessage(error))
      }
    }

    loadData()
  }, [])

  async function handleRespond(invitationId, response) {
    setRespondingId(invitationId)
    try {
      await respondToInvitation(invitationId, response)
      setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId))
    } catch (error) {
      setInvitationError(getInvitationErrorMessage(error))
    } finally {
      setRespondingId(null)
    }
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <PageHeader
          description="Create a new video room or join an existing one using a meeting code."
          eyebrow="Dashboard"
          title={`Welcome, ${user?.name || 'SmartMeet user'}`}
        />
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Button to="/create-meeting">Create Meeting</Button>
          <Button to="/join-meeting" variant="secondary">
            Join Meeting
          </Button>
          <Button onClick={handleLogout} type="button" variant="secondary">
            Logout
          </Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Name</p>
          <p className="mt-1 text-base font-semibold text-slate-950">
            {user?.name || 'Not available'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Username</p>
          <p className="mt-1 text-base font-semibold text-slate-950">
            {user?.username ? `@${user.username}` : 'Not set'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Email</p>
          <p className="mt-1 text-base font-semibold text-slate-950">
            {user?.email || 'Not available'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold tracking-normal text-slate-950">
            Pending invitations
          </h2>
          <span className="rounded-md bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
            {invitations.length}
          </span>
        </div>

        {invitationError ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {invitationError}
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          {invitations.length > 0 ? (
            invitations.map((invitation) => (
              <article
                className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                key={invitation._id}
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {invitation.meeting?.title || 'SmartMeet invitation'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Invited by {invitation.invitedBy?.name || 'Host'} &middot;{' '}
                    {invitation.meeting?.scheduledAt
                      ? new Date(invitation.meeting.scheduledAt).toLocaleString()
                      : 'Scheduled meeting'}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    disabled={respondingId === invitation._id}
                    onClick={() => handleRespond(invitation._id, 'accepted')}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    disabled={respondingId === invitation._id}
                    onClick={() => handleRespond(invitation._id, 'declined')}
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-600 transition disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">No pending invitations.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-normal text-slate-950">
          Upcoming meetings
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meeting) => (
              <article
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                key={meeting._id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">
                      {meeting.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(meeting.scheduledAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-md bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                    {meeting.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Host: {meeting.host?.name || 'Unknown'}
                </p>
                <div className="mt-4 flex gap-3">
                  <Button to={`/meeting/${meeting._id}`} className="flex-1">
                    Join
                  </Button>
                  <Button
                    to={`/meetings/${meeting._id}`}
                    variant="secondary"
                    className="flex-1"
                  >
                    Details
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="flex items-center gap-4 md:col-span-2">
              <p className="text-sm text-slate-500">No upcoming meetings yet.</p>
              <Button to="/create-meeting" variant="secondary">
                Create one
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
