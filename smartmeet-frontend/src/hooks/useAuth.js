import { useContext } from 'react'
import AuthContext from '../contexts/AuthContext.js'

// Convenience hook for reading and updating authentication state anywhere.
function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

export default useAuth
