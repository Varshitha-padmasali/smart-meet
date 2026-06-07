import Button from '../components/Button.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { dummyMeetings, dummyUser } from '../data/dummyMeetings.js'

// Dashboard page shows a welcome message, meeting actions, and sample meeting data.
function DashboardPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <PageHeader
          description={`You are signed in as a ${dummyUser.role}. Create a new video room or join an existing one using a meeting code.`}
          eyebrow="Dashboard"
          title={`Welcome, ${dummyUser.name}`}
        />
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Button to="/create-meeting">Create Meeting</Button>
          <Button to="/join-meeting" variant="secondary">
            Join Meeting
          </Button>
        </div>
      </div>

      <div>
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
