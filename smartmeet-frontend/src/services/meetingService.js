import api from './api.js'

// Creates a scheduled meeting for the currently authenticated user.
export async function createMeeting(meetingDetails) {
  const response = await api.post('/meetings', meetingDetails)
  return response.data
}

// Loads meetings visible to the current user.
export async function getMyMeetings() {
  const response = await api.get('/meetings')
  return response.data
}

// Normalizes meeting API failures for display in the scheduling form.
export function getMeetingErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    'Unable to create the meeting. Please try again.'
  )
}
