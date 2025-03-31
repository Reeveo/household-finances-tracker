import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase, handleAuthError } from '../lib/supabase';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';

// Type for the auth context
type AuthContextType = {
  user: SelectUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  error: Error | null;
  session: Session | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  resetPasswordMutation: UseMutationResult<void, Error, { email: string }>;
};

type LoginData = {
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Initial load - check for existing session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setSupabaseUser(currentSession?.user || null);
        
        // If user is authenticated, fetch the user profile
        if (currentSession?.user) {
          // We fetch the user profile to get the full user data
          try {
            const response = await fetch('/api/user/profile', {
              headers: {
                'Authorization': `Bearer ${currentSession.access_token}`
              }
            });
            
            if (response.ok) {
              const userData = await response.json();
              queryClient.setQueryData(["/api/user"], userData);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        } else {
          // Clear user data when logged out
          queryClient.setQueryData(["/api/user"], null);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setSupabaseUser(initialSession?.user || null);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Get user profile data
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    enabled: !!supabaseUser, // Only run query if supabaseUser exists
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw new Error(handleAuthError(error));
      
      // Fetch user profile after successful authentication
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      return await response.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username || user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      // First register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email || '',
        password: userData.password,
      });
      
      if (error) throw new Error(handleAuthError(error));
      
      // Then create user profile in our database
      const response = await fetch('/api/user/create-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${data.session?.access_token || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          auth_id: data.user?.id,
        }),
      });
      
      if (!response.ok) {
        // If profile creation fails, we should delete the Supabase user
        // This would typically be handled by a server-side trigger or function
        throw new Error('Failed to create user profile');
      }
      
      return await response.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username || user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(handleAuthError(error));
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw new Error(handleAuthError(error));
    },
    onSuccess: () => {
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        supabaseUser,
        isLoading,
        error,
        session,
        loginMutation,
        logoutMutation,
        registerMutation,
        resetPasswordMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
