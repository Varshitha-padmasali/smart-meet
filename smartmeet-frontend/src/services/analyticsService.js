import api from './api.js'

export async function submitFocusScore(meetingId, data) {
  const response = await api.post(`/analytics/${meetingId}/focus`, data)
  return response.data
}

export async function getMeetingAnalytics(meetingId) {
  const response = await api.get(`/analytics/${meetingId}`)
  return response.data
}
