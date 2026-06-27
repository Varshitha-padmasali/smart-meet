import api from './api.js'

export async function getMeetingById(meetingId) {
  const response = await api.get(`/meetings/${meetingId}`)
  return response.data
}

export async function createMeeting(meetingDetails) {
  const response = await api.post('/meetings', meetingDetails)
  return response.data
}

export async function deleteMeeting(meetingId) {
  const response = await api.delete(`/meetings/${meetingId}`)
  return response.data
}

export async function getMyMeetings() {
  const response = await api.get('/meetings')
  return response.data
}

export async function startMeeting(meetingId) {
  const response = await api.patch(`/meetings/${meetingId}/start`)
  return response.data
}

export async function endMeeting(meetingId) {
  const response = await api.patch(`/meetings/${meetingId}/end`)
  return response.data
}

export async function removeParticipantFromMeeting(meetingId, userId) {
  const response = await api.delete(`/meetings/${meetingId}/participants`, {
    data: { userId },
  })
  return response.data
}

export function getMeetingErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    'Unable to complete meeting action. Please try again.'
  )
}
