import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import PageHeader from '../components/PageHeader.jsx'
import {
  getMeetingErrorMessage,
  getMyMeetings,
} from '../services/meetingService.js'

// MeetingListPage shows scheduled meetings returned by the authenticated API.
function MeetingListPage() {
  const [meetings, setMeetings] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

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
            <Button className="mt-5 w-full" to={`/meeting/${meeting._id}`}>
              Open Room
            </Button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default MeetingListPage
