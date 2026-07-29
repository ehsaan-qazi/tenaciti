import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase env variables. Please check your .env file.")
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Local token storage key
const LOCAL_TOKEN_KEY = 'tenaciti_local_token'

export function getLocalToken() {
  return localStorage.getItem(LOCAL_TOKEN_KEY)
}

export function setLocalToken(token) {
  localStorage.setItem(LOCAL_TOKEN_KEY, token)
}

export function clearLocalToken() {
  localStorage.removeItem(LOCAL_TOKEN_KEY)
}

export async function apiFetch(endpoint, options = {}) {
  // Determine which token to use: explicit token from options, local token, or Supabase session
  const explicitToken = options.token
  const localToken = getLocalToken()

  const isFormData = options.body instanceof FormData

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  }

  let token = explicitToken || localToken

  if (!token) {
    // Fallback to Supabase session
    const { data: { session } } = await supabase.auth.getSession()
    token = session?.access_token
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Remove token from options if it was passed (not a standard fetch option)
  const { token: _unused, ...fetchOptions } = options

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    // FastAPI can return detail as:
    //   1. A plain string  → { detail: "some message" }
    //   2. A Pydantic validation array → { detail: [{ loc, msg, type }] }
    //   3. A nested object → { detail: { message: "..." } }
    let message = 'API request failed'
    if (errorData.detail) {
      if (typeof errorData.detail === 'string') {
        message = errorData.detail
      } else if (Array.isArray(errorData.detail)) {
        // Pydantic v2 validation errors — join all messages
        message = errorData.detail
          .map(e => e.msg || e.message || JSON.stringify(e))
          .join('. ')
      } else if (typeof errorData.detail === 'object') {
        message = errorData.detail.message || JSON.stringify(errorData.detail)
      }
    }
    throw new Error(message)
  }

  // Handle empty responses (e.g., 204 No Content)
  if (response.status === 204) return null;

  return response.json()
}