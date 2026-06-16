import api from './api.js'

// Loads pending meeting invitations for the signed-in user.
export async function getMyInvitations() {
  const response = await api.get('/invitations/mine')
  return response.data
}

// Normalizes invitation API failures for small dashboard alerts.
export function getInvitationErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    'Unable to load invitations right now.'
  )
}
