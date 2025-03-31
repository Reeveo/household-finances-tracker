import { renderHook } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useAuth } from '../../hooks/use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';
import { ReactNode } from 'react';

// Mock the API request function
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
  queryClient: {
    setQueryData: vi.fn(),
    getQueryData: vi.fn()
  },
  getQueryFn: () => async () => null
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      enabled: false,
    },
  },
});

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('provides null user initially while loading', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    // Check initial state
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  test('provides user data when authenticated', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedpassword',
      createdAt: new Date(),
    };

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['/api/user'], mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      )
    });

    // Check authenticated state
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
  });

  test('handles login mutation', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedpassword',
      createdAt: new Date(),
    };

    const apiRequest = vi.mocked(require('@/lib/queryClient').apiRequest);
    apiRequest.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser)
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    // Attempt login
    await result.current.loginMutation.mutate({
      username: 'testuser',
      password: 'password'
    });

    // Verify login state
    expect(result.current.loginMutation.isSuccess).toBe(true);
  });

  test('handles logout', async () => {
    const apiRequest = vi.mocked(require('@/lib/queryClient').apiRequest);
    apiRequest.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null)
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    // Attempt logout
    await result.current.logoutMutation.mutate();

    // Verify logout state
    expect(result.current.user).toBeNull();
  });
});