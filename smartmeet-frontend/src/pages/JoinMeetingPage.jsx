import { useState } from 'react'
import Button from '../components/Button.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import FormField from '../components/FormField.jsx'
import PageHeader from '../components/PageHeader.jsx'
import useAuth from '../hooks/useAuth.js'

// JoinMeetingPage joins a Socket.io room for chat; full video join arrives later.
function JoinMeetingPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    displayName: user?.name || '',
    meetingCode: '',
  })
  const [activeMeetingId, setActiveMeetingId] = useState('')
  const [status, setStatus] = useState('Enter a meeting code to preview the join flow.')

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setActiveMeetingId(formData.meetingCode.trim())
    setStatus('Joined the meeting chat room. Video room access will be added later.')
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
            name="meetingCode"
            onChange={handleChange}
            placeholder="SM-204-918"
            required
            type="text"
            value={formData.meetingCode}
          />
          <FormField
            label="Display name"
            name="displayName"
            onChange={handleChange}
            placeholder="Your name"
            required
            type="text"
            value={formData.displayName}
          />
        </div>
        <Button className="mt-6 w-full" type="submit">
          Join Meeting
        </Button>

        <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {status}
        </p>
      </form>

      <ChatPanel
        meetingId={activeMeetingId}
        user={{
          email: user?.email,
          name: formData.displayName || user?.name,
          username: user?.username,
        }}
      />
    </section>
  )
}

export default JoinMeetingPage
