import { useState } from 'react'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import PageHeader from '../components/PageHeader.jsx'

// CreateMeetingPage mocks meeting creation and displays a generated dummy meeting code.
function CreateMeetingPage() {
  const [meetingCode, setMeetingCode] = useState('SM-542-809')

  function handleSubmit(event) {
    event.preventDefault()
    setMeetingCode(`SM-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`)
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <PageHeader
        description="Prepare a meeting room with frontend-only dummy data. No room is created on a server yet."
        eyebrow="Create meeting"
        title="Schedule a new SmartMeet room"
      />

      <form
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <FormField
            label="Meeting title"
            placeholder="Team standup"
            required
            type="text"
          />
          <FormField
            label="Date and time"
            required
            type="datetime-local"
          />
          <FormField
            helperText="This is optional until participant invitations are connected."
            label="Invitee email"
            placeholder="teammate@example.com"
            type="email"
          />
        </div>
        <Button className="mt-6 w-full" type="submit">
          Generate Meeting Code
        </Button>

        <div className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
          <p className="text-sm font-medium text-cyan-900">Dummy meeting code</p>
          <p className="mt-2 text-2xl font-bold tracking-normal text-cyan-800">
            {meetingCode}
          </p>
        </div>
      </form>
    </section>
  )
}

export default CreateMeetingPage
