import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import PageHeader from '../components/PageHeader.jsx'
import useAuth from '../hooks/useAuth.js'
import {
  deleteMeeting,
  getMeetingErrorMessage,
  getMyMeetings,
} from '../services/meetingService.js'

// MeetingListPage shows scheduled meetings returned by the authenticated API.
function MeetingListPage() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')

  async function handleDelete(meeting) {
    if (!window.confirm(`Delete "${meeting.title}" and all of its meeting data?`)) return
    setDeletingId(meeting._id)
    setError('')
    try {
      await deleteMeeting(meeting._id)
      setMeetings((current) => current.filter((item) => item._id !== meeting._id))
    } catch (apiError) {
      setError(getMeetingErrorMessage(apiError))
    } finally {
      setDeletingId('')
    }
  }

  useEffect(() => {
    async function loadMeetings() {
      try {
        const data = await getMyMeetings()
        setMeetings(data.meetings)
      } catch (apiError) {
        setError(getMeetingErrorMessage(apiError))
      } finally {
        setIsLoading(false)
      }
    }

    loadMeetings()
  }, [])

  return (
    <section className="space-y-6">
      <PageHeader
        description="Review meetings you created or have joined as a participant."
        eyebrow="Meetings"
        title="Meeting list"
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-medium text-slate-600 shadow-sm">
          Loading meetings...
        </div>
      ) : null}

      {!isLoading && meetings.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          No meetings scheduled yet.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {meetings.map((meeting) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={meeting._id}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {meeting.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {new Date(meeting.scheduledAt).toLocaleString()}
                </p>
              </div>
              <span className="rounded-md bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                {meeting.status}
              </span>
            </div>
            {meeting.description ? (
              <p className="mt-4 text-sm text-slate-600">
                {meeting.description}
              </p>
            ) : null}
            <p className="mt-4 text-sm text-slate-500">
              Host: {meeting.host?.name || 'Unknown host'}
            </p>
            <div className="mt-5 flex gap-3">
              <Button className="flex-1" to={`/meeting/${meeting._id}`}>
                Open Room
              </Button>
              <Button className="flex-1" variant="secondary" to={`/meetings/${meeting._id}`}>
                Details
              </Button>
            </div>
            {(meeting.host?._id || meeting.host?.id || meeting.host) === user?.id ? (
              <button
                className="mt-3 w-full rounded-md px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                disabled={deletingId === meeting._id}
                onClick={() => handleDelete(meeting)}
                type="button"
              >
                {deletingId === meeting._id ? 'Deleting...' : 'Delete Meeting'}
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

export default MeetingListPage
