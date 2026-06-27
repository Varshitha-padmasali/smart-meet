import api from './api.js'

const TOKEN_STORAGE_KEY = 'smartmeet_token'

// Keeps auth-specific API calls in one place so pages stay focused on UI state.
export async function signupUser(userDetails) {
  const response = await api.post('/auth/signup', userDetails)
  return response.data
}

export async function loginUser(credentials) {
  const response = await api.post('/auth/login', {
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
  })
  if (!response.data?.token || !response.data?.user?.id) {
    throw new Error('The login server returned an invalid authentication response.')
  }
  return response.data
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me')
  return response.data
}

export function getStoredAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

// Stores the JWT returned by the backend for future authenticated requests.
export function saveAuthToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

// Converts Axios errors into friendly messages for the UI.
export function getAuthErrorMessage(error) {
  if (error.code === 'ERR_NETWORK') {
    return 'Cannot reach the SmartMeet server. Check that the backend is running and try again.'
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'Unable to connect to SmartMeet. Please try again.'
  )
}
