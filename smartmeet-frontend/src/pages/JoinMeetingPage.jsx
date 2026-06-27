import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import useAuth from '../hooks/useAuth.js'

// JoinMeetingPage is public so guests can enter a room without creating an account.
function JoinMeetingPage() {
  const navigate = useNavigate()
  const { continueAsGuest, isAuthenticated, user } = useAuth()
  const [formData, setFormData] = useState({
    displayName: user?.name || '',
    meetingCode: '',
  })
  const [status, setStatus] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const meetingId = formData.meetingCode.trim()
    const displayName = formData.displayName.trim()

    if (!meetingId || !displayName) {
      setStatus('Enter both a meeting ID and display name to continue.')
      return
    }

    setIsJoining(true)
    setStatus('Opening meeting room...')

    if (!isAuthenticated) {
      continueAsGuest(displayName)
    }

    navigate(`/meeting/${meetingId}`)
  }

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 py-6 lg:grid-cols-[1fr_440px]">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">Guest access</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
          Join a SmartMeet room in seconds.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Enter a meeting ID and display name to try the live meeting UI, video,
          audio, chat, and screen sharing without creating an account.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {['No signup required', 'Guest chat enabled', 'Screen share ready'].map((item) => (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={item}>
              <span className="block h-2 w-10 rounded-full bg-cyan-500" />
              <p className="mt-4 text-sm font-semibold text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <form
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60"
        onSubmit={handleSubmit}
      >
        <div>
          <h2 className="text-xl font-bold tracking-normal text-slate-950">Join Meeting</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Guests can participate in the meeting room, but host controls and account
            dashboards stay reserved for signed-in users.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <FormField
            helperText="Paste the meeting ID shared by the host."
            label="Meeting ID"
            name="meetingCode"
            onChange={handleChange}
            placeholder="SM-204-918"
            required
            type="text"
            value={formData.meetingCode}
          />
          <FormField
            label="Display Name"
            name="displayName"
            onChange={handleChange}
            placeholder="Your name"
            required
            type="text"
            value={formData.displayName}
          />
        </div>

        {status ? (
          <p className="mt-5 rounded-lg border border-cyan-100 bg-cyan-50 p-3 text-sm font-medium text-cyan-800">
            {status}
          </p>
        ) : null}

        <div className="mt-6 grid gap-3">
          <Button className="w-full" disabled={isJoining} type="submit">
            {isJoining ? 'Joining...' : 'Join Meeting'}
          </Button>
          <Button className="w-full" to="/" variant="secondary">
            Back to Home
          </Button>
        </div>
      </form>
    </section>
  )
}

export default JoinMeetingPage
