import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { dummyMeetings } from '../data/dummyMeetings.js'
import useAuth from '../hooks/useAuth.js'
import {
  getInvitationErrorMessage,
  getMyInvitations,
} from '../services/invitationService.js'

// Dashboard page shows authenticated user details, meeting actions, and logout.
function DashboardPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [invitations, setInvitations] = useState([])
  const [invitationError, setInvitationError] = useState('')

  function handleLogout() {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    async function loadInvitations() {
      try {
        const data = await getMyInvitations()
        setInvitations(data.invitations)
      } catch (error) {
        setInvitationError(getInvitationErrorMessage(error))
      }
    }

    loadInvitations()
  }, [])

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

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-slate-500">Current user</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">
            {user?.name || 'Not available'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Email address</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">
            {user?.email || 'Not available'}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold tracking-normal text-slate-950">
              Invitation notifications
            </h2>
            <span className="rounded-md bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
              {invitations.length} pending
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
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  key={invitation._id}
                >
                  <p className="font-semibold text-slate-950">
                    {invitation.meeting?.title || 'SmartMeet invitation'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Invited by {invitation.invitedBy?.name || 'Host'} for{' '}
                    {invitation.meeting?.scheduledAt
                      ? new Date(invitation.meeting.scheduledAt).toLocaleString()
                      : 'a scheduled meeting'}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-600">
                No pending invitations yet.
              </p>
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold tracking-normal text-slate-950">
          Upcoming meetings
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {dummyMeetings.map((meeting) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={meeting.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    {meeting.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{meeting.time}</p>
                </div>
                <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {meeting.id}
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500">Host: {meeting.host}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
