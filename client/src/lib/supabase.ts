import { createClient } from '@supabase/supabase-js'

// Use environment variables for Supabase configuration
// These should be defined in your .env file and loaded via Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase environment variables are missing. Please check your .env file.'
  )
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Helper function to handle authentication errors
export function handleAuthError(error: Error | null): string {
  if (!error) return ''

  // Map common Supabase auth errors to user-friendly messages
  if (error.message.includes('Email not confirmed')) {
    return 'Please check your email to confirm your account'
  } else if (error.message.includes('Invalid login credentials')) {
    return 'Incorrect email or password'
  } else if (error.message.includes('User already registered')) {
    return 'An account with this email already exists'
  } else if (error.message.includes('Password should be at least')) {
    return 'Password should be at least 6 characters'
  }

  // Default error message
  return error.message || 'An authentication error occurred'
} 