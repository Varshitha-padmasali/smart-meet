import { useEffect, useMemo, useState } from 'react'
import {
  clearAuthToken,
  getCurrentUser,
  getStoredAuthToken,
  loginUser,
  saveAuthToken,
  signupUser,
} from '../services/authService.js'
import AuthContext from './AuthContext.js'

const GUEST_STORAGE_KEY = 'smartmeet_guest_user'

function getStoredGuestUser() {
  try {
    const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY)
    return savedGuest ? JSON.parse(savedGuest) : null
  } catch {
    localStorage.removeItem(GUEST_STORAGE_KEY)
    return null
  }
}

// AuthProvider owns login persistence, current user state, and logout behavior.
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredGuestUser())
  const [token, setToken] = useState(() => getStoredAuthToken())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCurrentUser() {
      const storedToken = getStoredAuthToken()

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        const data = await getCurrentUser()
        setUser(data.user)
        setToken(storedToken)
      } catch {
        clearAuthToken()
        setUser(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadCurrentUser()
  }, [])

  async function login(credentials) {
    // A fresh login attempt must not inherit access from an older browser session.
    clearAuthToken()
    localStorage.removeItem(GUEST_STORAGE_KEY)
    setToken(null)
    setUser(null)
    const data = await loginUser(credentials)
    localStorage.removeItem(GUEST_STORAGE_KEY)
    saveAuthToken(data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  async function signup(userDetails) {
    const data = await signupUser(userDetails)
    localStorage.removeItem(GUEST_STORAGE_KEY)
    saveAuthToken(data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  function logout() {
    clearAuthToken()
    localStorage.removeItem(GUEST_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  function continueAsGuest(displayName) {
    const guestUser = {
      email: '',
      id: `guest-${Date.now()}`,
      isGuest: true,
      name: displayName || 'Guest',
      username: 'guest',
    }

    clearAuthToken()
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser))
    setToken(null)
    setUser(guestUser)
    return guestUser
  }

  const value = useMemo(
    () => ({
      continueAsGuest,
      isAuthenticated: Boolean(token),
      isGuest: Boolean(user?.isGuest),
      isLoading,
      login,
      logout,
      signup,
      token,
      user,
    }),
    [isLoading, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
