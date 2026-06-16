import axios from 'axios'

// Shared Axios client for all SmartMeet API requests.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Adds the saved JWT to requests when a user is already authenticated.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartmeet_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
