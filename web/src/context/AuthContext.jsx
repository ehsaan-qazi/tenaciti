import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../api/client'
import { apiFetch, setLocalToken, getLocalToken, clearLocalToken } from '../api/client'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null) // Supabase session (for Google OAuth)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async (token = null) => {
    try {
      const options = typeof token === 'string' ? { token } : {}
      const userData = await apiFetch('/auth/me', options)
      setUser(userData)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setUser(null)
    } finally {
      // Always stop loading — even if the backend is unreachable
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check for local JWT first (email/password auth)
    const localToken = getLocalToken()
    if (localToken) {
      fetchUserProfile(localToken)
    } else {
      // Fallback to Supabase session (Google OAuth)
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        if (session) {
          fetchUserProfile()
        } else {
          setLoading(false)
        }
      })
    }

    // Listen for Supabase auth changes (Google OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session) {
          await fetchUserProfile()
        } else {
          // If no Supabase session, check if we have a local token
          const localToken = getLocalToken()
          if (!localToken) {
            setUser(null)
            setLoading(false)
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  const loginWithEmail = async (email, password) => {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    // Store the local JWT
    setLocalToken(response.access_token)
    setUser(response.user)
    return response
  }

  const registerWithEmail = async (email, password, fullName) => {
    const response = await apiFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
    })
    // Store the local JWT
    setLocalToken(response.access_token)
    setUser(response.user)
    return response
  }

  const forgotPassword = async (email) => {
    await apiFetch('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
  }

  const resetPassword = async (token, password) => {
    await apiFetch('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
  }

  const verifyEmail = async (token) => {
    const updatedUser = await apiFetch('/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    setUser(updatedUser)
    return updatedUser
  }

  const resendVerification = async () => {
    const response = await apiFetch('/auth/resend-verification', {
      method: 'POST',
    })
    return response
  }

  const logout = async () => {
    // Clear local token
    clearLocalToken()
    // Sign out from Supabase (for Google OAuth)
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setSession(null)
  }

  const value = {
    session,           // Supabase session (Google OAuth)
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    logout,
    refreshUser: fetchUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}