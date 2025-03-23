import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the API request function
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
  queryClient: {
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  },
  getQueryFn: vi.fn()
}));

import { apiRequest, queryClient } from '@/lib/queryClient';

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides null user initially while loading', () => {
    // Mock the getQueryFn to return null (unauthenticated state)
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => {
        const queryClient = new QueryClient({
          defaultOptions: {
            queries: {
              retry: false,
              enabled: false // Disable auto fetch for tests
            },
          },
        });
        return (
          <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
          </QueryClientProvider>
        );
      },
    });

    // Check initial state
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('provides user data when authenticated', async () => {
    // Create a mock user
    const mockUser = {
      id: 1,
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date()
    };

    // Set up query client with mock data
    const mockQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    mockQueryClient.setQueryData(['/api/user'], mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={mockQueryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      ),
    });

    // Wait for the hook to process the data
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('calls login API when loginMutation is called', async () => {
    // Mock the API response
    const mockUser = {
      id: 1,
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date()
    };
    
    (apiRequest as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser)
    });

    // Render the hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => {
        const queryClient = new QueryClient({
          defaultOptions: {
            queries: {
              retry: false,
            },
          },
        });
        return (
          <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
          </QueryClientProvider>
        );
      },
    });

    // Call the login mutation
    result.current.loginMutation.mutate({
      username: 'testuser',
      password: 'password123'
    });

    // Wait for the mutation to complete
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        'POST',
        '/api/login',
        {
          username: 'testuser',
          password: 'password123'
        }
      );
      expect(queryClient.setQueryData).toHaveBeenCalledWith(['/api/user'], mockUser);
    });
  });

  it('calls register API when registerMutation is called', async () => {
    // Mock the API response
    const mockUser = {
      id: 1,
      username: 'newuser',
      name: 'New User',
      email: 'new@example.com',
      createdAt: new Date()
    };
    
    (apiRequest as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser)
    });

    // Render the hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => {
        const queryClient = new QueryClient({
          defaultOptions: {
            queries: {
              retry: false,
            },
          },
        });
        return (
          <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
          </QueryClientProvider>
        );
      },
    });

    // Call the register mutation
    result.current.registerMutation.mutate({
      username: 'newuser',
      password: 'password123',
      name: 'New User',
      email: 'new@example.com'
    });

    // Wait for the mutation to complete
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        'POST',
        '/api/register',
        {
          username: 'newuser',
          password: 'password123',
          name: 'New User',
          email: 'new@example.com'
        }
      );
      expect(queryClient.setQueryData).toHaveBeenCalledWith(['/api/user'], mockUser);
    });
  });

  it('calls logout API when logoutMutation is called', async () => {
    // Mock the API response
    (apiRequest as any).mockResolvedValueOnce({
      ok: true
    });

    // Render the hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => {
        const queryClient = new QueryClient({
          defaultOptions: {
            queries: {
              retry: false,
            },
          },
        });
        return (
          <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
          </QueryClientProvider>
        );
      },
    });

    // Call the logout mutation
    result.current.logoutMutation.mutate();

    // Wait for the mutation to complete
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        'POST',
        '/api/logout'
      );
      expect(queryClient.setQueryData).toHaveBeenCalledWith(['/api/user'], null);
    });
  });
});