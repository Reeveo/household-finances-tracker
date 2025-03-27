import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the modules used by useAuth
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
  getQueryFn: vi.fn().mockImplementation(() => () => Promise.resolve(null)),
  queryClient: {
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  }
}));

// Import mocked modules
import { apiRequest, queryClient } from '@/lib/queryClient';

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides null user initially while loading', async () => {
    // Set up a query client for the test
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={testQueryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      ),
    });

    // Initial state should be loading with null user
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);

    // Wait for the query to settle
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
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

    // Create a query client that will return the mock user
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    testQueryClient.setQueryData(['/api/user'], mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={testQueryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      ),
    });

    // Wait for the hook to process the data
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
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

    // Set up a query client for the test
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={testQueryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      ),
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
      // Check that the setQueryData from queryClient was called
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

    // Set up a query client for the test
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={testQueryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      ),
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

    // Set up a query client for the test
    const testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={testQueryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      ),
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