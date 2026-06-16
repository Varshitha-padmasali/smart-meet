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

// AuthProvider owns login persistence, current user state, and logout behavior.
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
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
    const data = await loginUser(credentials)
    saveAuthToken(data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  async function signup(userDetails) {
    const data = await signupUser(userDetails)
    saveAuthToken(data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  function logout() {
    clearAuthToken()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
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
