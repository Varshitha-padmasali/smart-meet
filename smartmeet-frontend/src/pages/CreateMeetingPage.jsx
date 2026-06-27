import { useEffect, useState } from 'react'
import Button from '../components/Button.jsx'
import FormField from '../components/FormField.jsx'
import PageHeader from '../components/PageHeader.jsx'
import { createMeeting, getMeetingErrorMessage } from '../services/meetingService.js'
import { searchUsers } from '../services/userService.js'

// Schedules a meeting and sends invitations to selected registered users in one action.
function CreateMeetingPage() {
  const [formData, setFormData] = useState({ description: '', scheduledAt: '', title: '' })
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [createdMeeting, setCreatedMeeting] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const query = searchQuery.trim()
    if (query.length < 2) {
      return undefined
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const data = await searchUsers(query)
        if (!cancelled) {
          setSearchResults(
            data.users.filter((candidate) => !selectedUsers.some((user) => user._id === candidate._id)),
          )
        }
      } catch {
        if (!cancelled) setSearchResults([])
      } finally {
        if (!cancelled) setIsSearching(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [searchQuery, selectedUsers])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  function addUser(candidate) {
    setSelectedUsers((users) => [...users, candidate])
    setSearchQuery('')
    setSearchResults([])
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setCreatedMeeting(null)
    setIsSubmitting(true)

    try {
      const data = await createMeeting({
        ...formData,
        inviteeUsernames: selectedUsers.map((invitee) => invitee.username),
      })
      setCreatedMeeting({ ...data.meeting, invitationCount: selectedUsers.length })
      setFormData({ description: '', scheduledAt: '', title: '' })
      setSelectedUsers([])
      setSearchQuery('')
    } catch (apiError) {
      setError(getMeetingErrorMessage(apiError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_460px]">
      <PageHeader
        description="Schedule a secure room and invite registered SmartMeet users before it is created."
        eyebrow="Create meeting"
        title="Schedule a new SmartMeet room"
      />

      <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
        <div className="space-y-4">
          <FormField label="Meeting title" name="title" onChange={handleChange} placeholder="Team standup" required type="text" value={formData.title} />
          <FormField label="Date and time" name="scheduledAt" onChange={handleChange} required type="datetime-local" value={formData.scheduledAt} />
          <FormField helperText="Optional context for the meeting agenda." label="Description" name="description" onChange={handleChange} placeholder="Discuss sprint priorities" type="text" value={formData.description} />

          <div>
            <label className="text-sm font-semibold text-slate-800" htmlFor="people-search">Add people</label>
            <p className="mt-1 text-xs text-slate-500">Search registered users by name, email, or username.</p>
            <input
              autoComplete="off"
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              id="people-search"
              onChange={(event) => {
                const value = event.target.value
                setSearchQuery(value)
                setSearchResults([])
                setIsSearching(value.trim().length >= 2)
              }}
              placeholder="Start typing a name or username"
              type="search"
              value={searchQuery}
            />

            {searchQuery.trim().length >= 2 ? (
              <div className="mt-2 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                {isSearching ? <p className="px-4 py-3 text-sm text-slate-500">Searching...</p> : null}
                {!isSearching && searchResults.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500">No matching registered users.</p>
                ) : null}
                {searchResults.map((candidate) => (
                  <button
                    className="flex w-full items-center justify-between gap-4 border-t border-slate-100 px-4 py-3 text-left transition first:border-0 hover:bg-cyan-50"
                    key={candidate._id}
                    onClick={() => addUser(candidate)}
                    type="button"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">{candidate.name}</span>
                      <span className="block text-xs text-slate-500">@{candidate.username} · {candidate.email}</span>
                    </span>
                    <span className="text-sm font-semibold text-cyan-700">Add</span>
                  </button>
                ))}
              </div>
            ) : null}

            {selectedUsers.length > 0 ? (
              <div className="mt-3 space-y-2">
                {selectedUsers.map((invitee) => (
                  <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2" key={invitee._id}>
                    <span className="text-sm font-medium text-slate-800">{invitee.name} <span className="text-slate-500">@{invitee.username}</span></span>
                    <button className="text-sm font-semibold text-red-600 hover:text-red-700" onClick={() => setSelectedUsers((users) => users.filter((user) => user._id !== invitee._id))} type="button">Remove</button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <Button className="mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating meeting...' : selectedUsers.length ? `Create and invite ${selectedUsers.length}` : 'Create Meeting'}
        </Button>

        {createdMeeting ? (
          <div className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-sm font-medium text-cyan-900">Meeting scheduled{createdMeeting.invitationCount ? ` · ${createdMeeting.invitationCount} invited` : ''}</p>
            <p className="mt-2 text-lg font-bold text-cyan-800">{createdMeeting.title}</p>
            <p className="mt-1 text-sm text-cyan-900">{new Date(createdMeeting.scheduledAt).toLocaleString()}</p>
          </div>
        ) : null}
      </form>
    </section>
  )
}

export default CreateMeetingPage
