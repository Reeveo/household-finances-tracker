import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  SignInCredentials,
  SignUpCredentials,
  signIn,
  signUp,
  signOut,
  resetPassword,
  getCurrentUser,
  onAuthStateChange 
} from '../lib/supabase-client';
import { useToast } from '../hooks/useToast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Check for existing user session on mount
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error retrieving user session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up authentication state change listener
    const { data: authListener } = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    checkUser();

    // Clean up the subscription on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign in handler
  const handleSignIn = async (credentials: SignInCredentials) => {
    try {
      setLoading(true);
      const { error } = await signIn(credentials.email, credentials.password);
      if (error) throw error;
    } catch (error: any) {
      showToast({
        title: 'Authentication error',
        description: error.message || 'Failed to sign in',
        type: 'error',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up handler
  const handleSignUp = async (credentials: SignUpCredentials) => {
    try {
      setLoading(true);
      const { error } = await signUp(credentials.email, credentials.password);
      if (error) throw error;
      
      showToast({
        title: 'Account created',
        description: 'Please check your email for confirmation',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        title: 'Registration error',
        description: error.message || 'Failed to create account',
        type: 'error',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
    } catch (error: any) {
      showToast({
        title: 'Sign out error',
        description: error.message || 'Failed to sign out',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset password handler
  const handleResetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await resetPassword(email);
      if (error) throw error;
      
      showToast({
        title: 'Password reset email sent',
        description: 'Please check your email for reset instructions',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        title: 'Password reset error',
        description: error.message || 'Failed to send reset email',
        type: 'error',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 