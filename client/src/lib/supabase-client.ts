import { createClient } from '@supabase/supabase-js';
import type { AuthResponse, User, AuthError } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helpers
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  return supabase.auth.signInWithPassword({
    email,
    password
  });
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  return supabase.auth.signUp({
    email,
    password
  });
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email);
}

export async function updatePassword(password: string) {
  return supabase.auth.updateUser({
    password
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Set up auth state change listener
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
}

// Custom types
export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = {
  email: string;
  password: string;
  name?: string;
};

// Re-export types from Supabase
export type { User, AuthResponse, AuthError }; 