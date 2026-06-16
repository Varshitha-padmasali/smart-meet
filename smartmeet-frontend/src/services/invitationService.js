import api from './api.js'

export async function getMyInvitations() {
  const response = await api.get('/invitations/mine')
  return response.data
}

export async function inviteUserByUsername(meetingId, username) {
  const response = await api.post('/invitations', { meetingId, username })
  return response.data
}

export async function respondToInvitation(invitationId, response) {
  const res = await api.patch(`/invitations/${invitationId}/respond`, { response })
  return res.data
}

export async function revokeInvitation(invitationId) {
  const response = await api.patch(`/invitations/${invitationId}/revoke`)
  return response.data
}

export function getInvitationErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    'Unable to load invitations right now.'
  )
}
