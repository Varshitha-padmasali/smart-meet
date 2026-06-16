import { useState } from 'react'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import PageHeader from '../components/PageHeader.jsx'
import {
  createMeeting,
  getMeetingErrorMessage,
} from '../services/meetingService.js'

// CreateMeetingPage schedules a meeting through the protected backend API.
function CreateMeetingPage() {
  const [formData, setFormData] = useState({
    description: '',
    scheduledAt: '',
    title: '',
  })
  const [createdMeeting, setCreatedMeeting] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setCreatedMeeting(null)
    setIsSubmitting(true)

    try {
      const data = await createMeeting(formData)
      setCreatedMeeting(data.meeting)
      setFormData({
        description: '',
        scheduledAt: '',
        title: '',
      })
    } catch (apiError) {
      setError(getMeetingErrorMessage(apiError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <PageHeader
        description="Schedule a secure SmartMeet room. Invitation controls will be added in the next milestone."
        eyebrow="Create meeting"
        title="Schedule a new SmartMeet room"
      />

      <form
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
        <div className="space-y-4">
          <FormField
            label="Meeting title"
            name="title"
            onChange={handleChange}
            placeholder="Team standup"
            required
            type="text"
            value={formData.title}
          />
          <FormField
            label="Date and time"
            name="scheduledAt"
            onChange={handleChange}
            required
            type="datetime-local"
            value={formData.scheduledAt}
          />
          <FormField
            helperText="Optional context for the meeting agenda."
            label="Description"
            name="description"
            onChange={handleChange}
            placeholder="Discuss sprint priorities"
            type="text"
            value={formData.description}
          />
        </div>
        <Button
          className="mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating meeting...' : 'Create Meeting'}
        </Button>

        {createdMeeting ? (
          <div className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-sm font-medium text-cyan-900">
              Meeting scheduled
            </p>
            <p className="mt-2 text-lg font-bold tracking-normal text-cyan-800">
              {createdMeeting.title}
            </p>
            <p className="mt-1 text-sm text-cyan-900">
              {new Date(createdMeeting.scheduledAt).toLocaleString()}
            </p>
          </div>
        ) : null}
      </form>
    </section>
  )
}

export default CreateMeetingPage
