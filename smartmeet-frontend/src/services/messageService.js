import api from './api.js'

// Loads persisted chat messages for a meeting room.
export async function getMeetingMessages(meetingId) {
  const response = await api.get(`/messages/${meetingId}`)
  return response.data
}
