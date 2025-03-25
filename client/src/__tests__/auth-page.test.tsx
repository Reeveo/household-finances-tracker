import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AuthPage from '../pages/auth-page';
import { renderWithProviders } from './test-utils';

// Mock useAuth hook
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

// Mock useLocation hook
vi.mock('wouter', () => ({
  useLocation: vi.fn(() => ['/auth', vi.fn()]),
}));

// Mock useIsMobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

describe('AuthPage', () => {
  // Setup common mocks
  const mockLoginMutate = vi.fn();
  const mockRegisterMutate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    const useAuth = vi.requireMock('@/hooks/use-auth').useAuth;
    useAuth.mockReturnValue({
      user: null,
      loginMutation: {
        mutate: mockLoginMutate,
        isPending: false,
        isError: false,
        error: null
      },
      registerMutation: {
        mutate: mockRegisterMutate,
        isPending: false,
        isError: false,
        error: null
      }
    });
  });

  it('renders the auth page with login form by default', () => {
    renderWithProviders(<AuthPage />);
    
    // Check for login form elements
    expect(screen.getByRole('tab', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /register/i })).toBeInTheDocument();
    
    // Login form should be active by default
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    
    // Feature section should be visible
    expect(screen.getByText(/smart budget tracking/i)).toBeInTheDocument();
  });

  it('switches to register tab when clicked', async () => {
    renderWithProviders(<AuthPage />);
    
    // Click on the register tab
    fireEvent.click(screen.getByRole('tab', { name: /register/i }));
    
    // Check that registration form is now visible
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });
  });

  it('submits login form with valid data', async () => {
    renderWithProviders(<AuthPage />);
    
    // Fill in the login form
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check that login mutation was called with correct data
    await waitFor(() => {
      expect(mockLoginMutate).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  it('shows validation errors for login form', async () => {
    renderWithProviders(<AuthPage />);
    
    // Submit empty form to trigger validation
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
    
    // Login mutation should not be called
    expect(mockLoginMutate).not.toHaveBeenCalled();
  });

  it('submits registration form with valid data', async () => {
    renderWithProviders(<AuthPage />);
    
    // Switch to register tab
    fireEvent.click(screen.getByRole('tab', { name: /register/i }));
    
    // Fill in the registration form
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Test User' }
      });
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check that register mutation was called with correct data
    await waitFor(() => {
      expect(mockRegisterMutate).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  it('shows validation errors for registration form', async () => {
    renderWithProviders(<AuthPage />);
    
    // Switch to register tab
    fireEvent.click(screen.getByRole('tab', { name: /register/i }));
    
    // Submit empty form to trigger validation
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    });
    
    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/must be a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
    
    // Register mutation should not be called
    expect(mockRegisterMutate).not.toHaveBeenCalled();
  });

  it('shows loading state during login submission', async () => {
    const useAuth = vi.requireMock('@/hooks/use-auth').useAuth;
    useAuth.mockReturnValue({
      user: null,
      loginMutation: {
        mutate: mockLoginMutate,
        isPending: true,
        isError: false,
        error: null
      },
      registerMutation: {
        mutate: mockRegisterMutate,
        isPending: false,
        isError: false,
        error: null
      }
    });
    
    renderWithProviders(<AuthPage />);
    
    // Check for loading state
    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('shows error message when login fails', async () => {
    const useAuth = vi.requireMock('@/hooks/use-auth').useAuth;
    useAuth.mockReturnValue({
      user: null,
      loginMutation: {
        mutate: mockLoginMutate,
        isPending: false,
        isError: true,
        error: { message: 'Invalid username or password' }
      },
      registerMutation: {
        mutate: mockRegisterMutate,
        isPending: false,
        isError: false,
        error: null
      }
    });
    
    renderWithProviders(<AuthPage />);
    
    // Check for error message
    expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
  });

  it('redirects to dashboard if user is already authenticated', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(vi.requireMock('wouter').useLocation).mockReturnValue(['/auth', mockNavigate]);
    
    const useAuth = vi.requireMock('@/hooks/use-auth').useAuth;
    useAuth.mockReturnValue({
      user: { id: 1, username: 'testuser', name: 'Test User' },
      loginMutation: {
        mutate: mockLoginMutate,
        isPending: false,
        isError: false,
        error: null
      },
      registerMutation: {
        mutate: mockRegisterMutate,
        isPending: false,
        isError: false,
        error: null
      }
    });
    
    renderWithProviders(<AuthPage />);
    
    // Check that navigation to dashboard was triggered
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
}); 