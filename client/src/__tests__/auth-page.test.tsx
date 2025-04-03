import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { UseMutationResult } from '@tanstack/react-query';

// Define the types needed for our mocks
type User = {
  id: number;
  username: string;
  password: string;
  name: string | null;
  email: string | null;
  createdAt: Date | null;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  name?: string;
  email?: string;
};

// Create a helper function to generate a mock mutation result
function createMockMutation<TData, TError, TVariables>(overrides?: Partial<UseMutationResult<TData, TError, TVariables>>): UseMutationResult<TData, TError, TVariables> {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    isError: false,
    isIdle: true,
    isLoading: false,
    isPending: false,
    isSuccess: false,
    status: 'idle',
    error: null as unknown as TError,
    data: undefined as unknown as TData,
    variables: undefined as unknown as TVariables,
    failureCount: 0,
    failureReason: null as unknown as TError,
    ...overrides
  };
}

// Mock modules need to be at the top, before any variable declarations
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: null,
    isLoading: false,
    loginMutation: createMockMutation<User, Error, LoginData>({
      mutate: vi.fn()
    }),
    registerMutation: createMockMutation<User, Error, RegisterData>({
      mutate: vi.fn()
    }),
    logoutMutation: createMockMutation<void, Error, void>({
      mutate: vi.fn()
    })
  })
}));

// Mock the wouter hook - create and export a mockNavigate function for testing
const mockNavigate = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => ['/auth', mockNavigate],
  Link: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
    <a href="#" {...props}>{children}</a>
  ),
  Route: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRoute: () => [false, {}],
  Switch: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock the isMobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false
}));

// Import module after mocking
import AuthPage from '../pages/auth-page';
import { renderWithClient } from './minimal-test-utils';
import { useAuth } from '@/hooks/use-auth';

describe('AuthPage', () => {
  // Create refs to mock functions that will be used in tests
  const loginMutate = vi.fn();
  const registerMutate = vi.fn();
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    loginMutate.mockReset();
    registerMutate.mockReset();
    mockNavigate.mockReset();
    
    // Mock the useAuth return value for each test
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      loginMutation: createMockMutation<User, Error, LoginData>({
        mutate: loginMutate
      }),
      registerMutation: createMockMutation<User, Error, RegisterData>({
        mutate: registerMutate
      }),
      logoutMutation: createMockMutation<void, Error, void>({
        mutate: vi.fn()
      })
    });
  });

  it('renders the auth page with login form by default', () => {
    const { container } = renderWithClient(<AuthPage />);
    
    // Check for login form elements
    expect(screen.getByRole('tab', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /register/i })).toBeInTheDocument();
    
    // Check the login tab is active
    expect(screen.getByRole('tab', { name: /login/i })).toHaveAttribute('data-state', 'active');
    expect(screen.getByRole('tab', { name: /register/i })).toHaveAttribute('data-state', 'inactive');
    
    // Check the login form is visible
    const loginPanel = screen.getByRole('tabpanel', { name: /login/i });
    expect(loginPanel).toBeInTheDocument();
    expect(loginPanel).toHaveAttribute('data-state', 'active');
    
    // Check form fields are visible
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    
    // Check features section is visible
    expect(screen.getByText(/take control of your financial future/i)).toBeInTheDocument();
    expect(screen.getByText(/visual financial insights/i)).toBeInTheDocument();
  });

  it('switches to register tab when clicked', async () => {
    const { user } = renderWithClient(<AuthPage />);
    
    // Click the register tab
    await user.click(screen.getByRole('tab', { name: /register/i }));
    
    // Check the register tab is now active
    expect(screen.getByRole('tab', { name: /login/i })).toHaveAttribute('data-state', 'inactive');
    expect(screen.getByRole('tab', { name: /register/i })).toHaveAttribute('data-state', 'active');
    
    // The register tabpanel should be visible and active
    const registerPanel = screen.getByRole('tabpanel', { name: /register/i });
    expect(registerPanel).toBeInTheDocument();
    expect(registerPanel).toHaveAttribute('data-state', 'active');
    expect(registerPanel).not.toHaveAttribute('hidden');
  });

  it('submits the login form with valid data', async () => {
    const { user } = renderWithClient(<AuthPage />);
    
    // Fill in the login form
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    // Check that the login mutation was called with correct data
    expect(loginMutate).toHaveBeenCalledWith(
      { username: 'testuser', password: 'password123' },
      expect.anything()
    );
  });

  it('redirects to homepage when user is already authenticated', () => {
    // Mock the user to be authenticated
    vi.mocked(useAuth).mockReturnValue({
      user: { 
        id: 1, 
        username: 'testuser', 
        name: 'Test User', 
        email: 'test@example.com',
        password: 'hashedpassword',
        createdAt: new Date()
      },
      isLoading: false,
      loginMutation: createMockMutation<User, Error, LoginData>({
        mutate: loginMutate
      }),
      registerMutation: createMockMutation<User, Error, RegisterData>({
        mutate: registerMutate
      }),
      logoutMutation: createMockMutation<void, Error, void>({
        mutate: vi.fn()
      })
    });
    
    // Render the auth page - this should trigger the redirect effect
    renderWithClient(<AuthPage />);
    
    // Check that navigation to the homepage was triggered directly (no need for waitFor)
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
}); 