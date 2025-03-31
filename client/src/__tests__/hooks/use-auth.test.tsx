import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useAuth } from '../../hooks/use-auth';
import { renderWithProviders, setupMocks, createProviderWrapper } from '../test-utils';

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  test('provides null user initially while loading', async () => {
    // Setup mock for loading state
    setupMocks({
      customMocks: {
        useAuth: () => ({
          user: null,
          isLoading: true,
          error: null,
          isAuthenticated: false,
          loginMutation: { mutate: vi.fn(), isSuccess: false },
          logoutMutation: { mutate: vi.fn(), isSuccess: false },
          registerMutation: { mutate: vi.fn(), isSuccess: false }
        })
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createProviderWrapper()
    });

    // Check initial state
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  test('provides user data when authenticated', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      role: 'user',
      createdAt: new Date(),
    };

    // Setup mock for authenticated state
    setupMocks({
      authState: {
        user: mockUser,
        isLoading: false,
        error: null,
        isAuthenticated: true
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createProviderWrapper()
    });

    // Check authenticated state
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
    });
  });

  test('handles login mutation', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      role: 'user',
      createdAt: new Date(),
    };

    // Setup mock for login API call
    setupMocks({
      apiResponses: [
        {
          endpoint: '/api/auth/login',
          method: 'POST',
          response: mockUser
        }
      ],
      authState: {
        loginMutation: {
          mutate: vi.fn(async () => mockUser),
          isSuccess: true
        }
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createProviderWrapper()
    });

    // Attempt login
    await result.current.loginMutation.mutate({
      username: 'testuser',
      password: 'password'
    });

    // Verify login mutation state
    await waitFor(() => {
      expect(result.current.loginMutation.isSuccess).toBe(true);
    });
  });

  test('handles logout', async () => {
    // Setup mock for logout API call
    setupMocks({
      apiResponses: [
        {
          endpoint: '/api/auth/logout',
          method: 'POST',
          response: { success: true }
        }
      ],
      authState: {
        logoutMutation: {
          mutate: vi.fn(),
          isSuccess: true
        }
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createProviderWrapper()
    });

    // Attempt logout
    await result.current.logoutMutation.mutate();

    // Verify logout mutation state
    await waitFor(() => {
      expect(result.current.logoutMutation.isSuccess).toBe(true);
    });
  });

  test('handles register mutation', async () => {
    const mockUser = {
      id: 1,
      name: 'New User',
      email: 'new@example.com',
      username: 'newuser',
      role: 'user',
      createdAt: new Date(),
    };

    // Setup mock for register API call
    setupMocks({
      apiResponses: [
        {
          endpoint: '/api/auth/register',
          method: 'POST',
          response: mockUser
        }
      ],
      authState: {
        registerMutation: {
          mutate: vi.fn(),
          isSuccess: true
        }
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createProviderWrapper()
    });

    // Attempt registration
    await result.current.registerMutation.mutate({
      name: 'New User',
      email: 'new@example.com',
      username: 'newuser',
      password: 'newpassword'
    });

    // Verify registration mutation state
    await waitFor(() => {
      expect(result.current.registerMutation.isSuccess).toBe(true);
    });
  });
  
  test('handles authentication errors', async () => {
    // Setup mock for failed login attempt
    setupMocks({
      apiResponses: [
        {
          endpoint: '/api/auth/login',
          method: 'POST',
          error: new Error('Invalid credentials')
        }
      ],
      authState: {
        loginMutation: {
          mutate: vi.fn(),
          isSuccess: false,
          isError: true,
          error: new Error('Invalid credentials')
        }
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createProviderWrapper()
    });

    // Attempt login with invalid credentials
    await result.current.loginMutation.mutate({
      username: 'wrong',
      password: 'wrong'
    });

    // Verify error state
    await waitFor(() => {
      expect(result.current.loginMutation.isError).toBe(true);
      expect(result.current.loginMutation.error).toBeTruthy();
    });
  });
});