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
    // ─── Helper: detect if the current URL looks like an OAuth callback ───
    const isOAuthCallback = () =>
      window.location.hash.includes('access_token')
      || window.location.hash.includes('error')
      || window.location.search.includes('code=')

    // ─── Step 1: Set up the auth state change listener FIRST ───
    // This must be registered before getSession() so we don't miss
    // the SIGNED_IN event that fires when Supabase processes the
    // OAuth callback hash fragments in the URL.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session) {
          await fetchUserProfile()
        } else {
          // If no Supabase session, check if we have a local token
          const localToken = getLocalToken()
          if (!localToken) {
            // CRITICAL: Don't set loading=false if we're in the middle of
            // a PKCE OAuth callback. The INITIAL_SESSION event fires with
            // session=null BEFORE the code exchange completes. If we stop
            // loading now, ProtectedRoute will redirect to /login and strip
            // the ?code= from the URL, killing the exchange.
            if (!isOAuthCallback()) {
              setUser(null)
              setLoading(false)
            }
            // Otherwise, keep loading=true and let getSession() or a
            // subsequent onAuthStateChange(SIGNED_IN) handle it.
          }
        }
      }
    )

    // ─── Step 2: Check for existing auth ───
    const localToken = getLocalToken()
    if (localToken) {
      // Email/password user — validate their stored token
      fetchUserProfile(localToken)
    } else {
      // Check for an existing Supabase session (returning Google user)
      // Also handles the OAuth callback: Supabase processes the PKCE code
      // exchange during getSession() and fires onAuthStateChange above.
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        if (session) {
          fetchUserProfile()
        } else {
          // Only stop loading if there are NO hash/query fragments indicating
          // an OAuth callback is still being processed (Supabase v2 uses ?code= by default).
          if (!isOAuthCallback()) {
            setLoading(false)
          } else {
            // Safety timeout: if onAuthStateChange hasn't fired within 5s,
            // stop loading to avoid infinite spinner.
            setTimeout(() => {
              setLoading(prev => {
                // Only force-stop if still loading (callback may have already resolved)
                return prev ? false : prev
              })
            }, 5000)
          }
        }
      })
    }

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
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      // Store the local JWT
      setLocalToken(response.access_token)
      setUser(response.user)
      return response
    } catch (err) {
      // Provide a user-friendly message for network errors
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        throw new Error('Cannot reach the server. Please check that the backend is running.')
      }
      throw err
    }
  }

  const registerWithEmail = async (email, password, fullName) => {
    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName }),
      })
      // Store the local JWT
      setLocalToken(response.access_token)
      setUser(response.user)
      return response
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        throw new Error('Cannot reach the server. Please check that the backend is running.')
      }
      throw err
    }
  }

  const forgotPassword = async (email) => {
    await apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  const resetPassword = async (token, password) => {
    await apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  const verifyEmail = async (token) => {
    const updatedUser = await apiFetch('/auth/verify-email', {
      method: 'POST',
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