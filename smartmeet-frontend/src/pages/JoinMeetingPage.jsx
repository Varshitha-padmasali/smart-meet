import { useState } from 'react'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import PageHeader from '../components/PageHeader.jsx'

// JoinMeetingPage validates only the frontend interaction and shows a dummy ready state.
function JoinMeetingPage() {
  const [status, setStatus] = useState('Enter a meeting code to preview the join flow.')

  function handleSubmit(event) {
    event.preventDefault()
    setStatus('Ready to join. Backend meeting lookup will be added later.')
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <PageHeader
        description="Use a sample meeting code to test the frontend flow without connecting to a video room."
        eyebrow="Join meeting"
        title="Join an existing SmartMeet room"
      />

      <form
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <FormField
            helperText="Try SM-204-918 or any code format for now."
            label="Meeting code"
            placeholder="SM-204-918"
            required
            type="text"
          />
          <FormField
            label="Display name"
            placeholder="Your name"
            required
            type="text"
          />
        </div>
        <Button className="mt-6 w-full" type="submit">
          Join Meeting
        </Button>

        <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {status}
        </p>
      </form>
    </section>
  )
}

export default JoinMeetingPage
