import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const login = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8787'
    window.location.href = `${backendUrl}/auth/google`
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('youload_token')
    localStorage.removeItem('youload_user')
  }

  const handleAuthSuccess = (token, userData) => {
    localStorage.setItem('youload_token', token)
    localStorage.setItem('youload_user', JSON.stringify(userData))
    setUser(userData)
  }

  useEffect(() => {
    // Check for existing session on app load
    const token = localStorage.getItem('youload_token')
    const userData = localStorage.getItem('youload_user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
        
        // Verify token is still valid
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8787'
        fetch(`${backendUrl}/auth/me`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
          .then(async res => {
            if (!res.ok) {
              throw new Error('Token invalid')
            }
            return res.json()
          })
          .then(data => {
            if (data.user) {
              setUser(data.user)
              localStorage.setItem('youload_user', JSON.stringify(data.user))
            }
          })
          .catch(() => {
            // Token is invalid, clear storage
            logout()
          })
          .finally(() => setLoading(false))
      } catch (error) {
        logout()
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  // Expose login function globally for redirect callbacks
  useEffect(() => {
    window.authContext = { login, handleAuthSuccess }
  }, [])

  const value = {
    user,
    login,
    logout,
    loading,
    handleAuthSuccess
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
