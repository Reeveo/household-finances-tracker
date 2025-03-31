import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

// Import our mock creators
import { createMockAuthHook, MockAuthState } from '../__mocks__/hooks/use-auth';
import { createMockToastHook } from '../__mocks__/hooks/use-toast';
import { createMockIsMobileHook } from '../__mocks__/hooks/use-mobile';
import { createMockUseMutation, createMockUseQuery, createMockQueryClient } from '../__mocks__/tanstack-query';
import { MockApiResponse } from '../__mocks__/mockUtils';

// Import the actual hooks (which will be mocked)
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Include jest-dom matchers
import '@testing-library/jest-dom';

// Add compatibility for vi.requireMock which is used in some tests
// This helps tests that use jest.requireMock to work without changes
// @ts-ignore - Adding requireMock for compatibility
(vi as any).requireMock = (moduleName: string) => {
  const mocks: Record<string, any> = {
    '@/hooks/use-auth': {
      useAuth: vi.fn().mockReturnValue({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
        loginMutation: {
          mutate: vi.fn(),
          isSuccess: false,
          isError: false,
          error: null,
          isPending: false
        },
        logoutMutation: {
          mutate: vi.fn(),
          isSuccess: false,
          isError: false,
          error: null,
          isPending: false
        },
        registerMutation: {
          mutate: vi.fn(),
          isSuccess: false,
          isError: false,
          error: null,
          isPending: false
        }
      })
    },
    'wouter': {
      useLocation: vi.fn().mockReturnValue(['/auth', vi.fn()]),
      Link: ({ children }: { children: React.ReactNode }) => <a href="#">{children}</a>,
      Route: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      useRoute: vi.fn().mockReturnValue([false, {}]),
      Switch: ({ children }: { children: React.ReactNode }) => <>{children}</>
    }
  };
  
  return mocks[moduleName] || {};
};

// Standard mock setup
vi.mock('@/hooks/use-auth');
vi.mock('@/hooks/use-toast');
vi.mock('@/hooks/use-mobile');
vi.mock('@tanstack/react-query');
vi.mock('wouter', () => ({
  useLocation: vi.fn().mockReturnValue(['/auth', vi.fn()]),
  Link: ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => 
    <a href="#" {...props}>{children}</a>,
  Route: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRoute: vi.fn().mockReturnValue([false, {}]),
  Switch: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock queryClient with standardized implementation
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
  queryClient: {
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    refetchQueries: vi.fn()
  },
  getQueryFn: () => async () => null
}));

/**
 * Helper function to set up all mocks for a test
 */
export interface SetupMocksOptions {
  authState?: Partial<MockAuthState>;
  isMobile?: boolean;
  apiResponses?: MockApiResponse[];
  queryData?: Record<string, any>;
  customMocks?: Record<string, any>;
}

export const setupMocks = (options: SetupMocksOptions = {}) => {
  const {
    authState,
    isMobile = false,
    apiResponses = [],
    queryData = {},
    customMocks = {}
  } = options;

  // Reset all mocks
  vi.resetAllMocks();

  // Setup auth mock
  if (authState) {
    // Ensure the authState has all required fields
    const userDefaults = {
      password: 'password123',
      createdAt: new Date(),
      role: 'user'
    };
    
    const user = authState.user ? {
      ...userDefaults,
      ...authState.user
    } : null;

    const completeAuthState = {
      ...authState,
      user,
      isAuthenticated: authState.isAuthenticated ?? (user !== null),
      isLoading: authState.isLoading ?? false,
      error: authState.error ?? null,
      loginMutation: authState.loginMutation ? {
        mutate: authState.loginMutation.mutate || vi.fn(),
        isSuccess: authState.loginMutation.isSuccess ?? false,
        isError: authState.loginMutation.isError ?? false,
        error: authState.loginMutation.error ?? null,
        isPending: authState.loginMutation.isPending ?? false
      } : undefined,
      logoutMutation: authState.logoutMutation ? {
        mutate: authState.logoutMutation.mutate || vi.fn(),
        isSuccess: authState.logoutMutation.isSuccess ?? false,
        isError: authState.logoutMutation.isError ?? false,
        error: authState.logoutMutation.error ?? null,
        isPending: authState.logoutMutation.isPending ?? false
      } : undefined,
      registerMutation: authState.registerMutation ? {
        mutate: authState.registerMutation.mutate || vi.fn(),
        isSuccess: authState.registerMutation.isSuccess ?? false,
        isError: authState.registerMutation.isError ?? false,
        error: authState.registerMutation.error ?? null,
        isPending: authState.registerMutation.isPending ?? false
      } : undefined
    };

    (useAuth as any).mockImplementation(createMockAuthHook(completeAuthState));
  }

  // Setup isMobile mock
  (useIsMobile as any).mockImplementation(createMockIsMobileHook(isMobile));

  // Setup toast mock
  (useToast as any).mockImplementation(createMockToastHook());

  // Setup API responses
  apiResponses.forEach(({ endpoint, method = 'GET', response, error }) => {
    if (error) {
      (apiRequest as any).mockRejectedValueOnce(error);
    } else {
      (apiRequest as any).mockResolvedValueOnce(response);
    }
  });

  // Setup query data
  Object.entries(queryData).forEach(([queryKey, data]) => {
    (useQuery as any).mockImplementation(
      createMockUseQuery(data, false, false, null)
    );
  });

  // Setup any custom mocks
  if (customMocks) {
    // Handle wouter mocks specially
    if (customMocks.wouter) {
      // Get the mocked module
      const wouterMock = (vi as any).requireMock('wouter');
      if (wouterMock) {
        // Apply the custom implementations
        if (customMocks.wouter.useLocation && wouterMock.useLocation) {
          wouterMock.useLocation.mockImplementation(customMocks.wouter.useLocation);
        }
        if (customMocks.wouter.useRoute && wouterMock.useRoute) {
          wouterMock.useRoute.mockImplementation(customMocks.wouter.useRoute);
        }
      }
    }
    
    // Handle other custom mocks
    Object.entries(customMocks).forEach(([modulePath, mockImplementation]) => {
      if (modulePath === 'wouter') return; // Already handled separately
      
      try {
        // For other modules, try to apply the mock implementation
        if (typeof mockImplementation === 'object') {
          Object.entries(mockImplementation as Record<string, any>).forEach(([exportName, implementation]) => {
            // For exports from modules, try to mock them
            if (typeof implementation === 'function') {
              try {
                // Try to get the module mock from vi.mocked
                const mockFn = vi.fn();
                mockFn.mockImplementation(implementation);
                
                // Find if there's a globally mocked version to update
                if (modulePath.startsWith('@/')) {
                  const pathParts = modulePath.substring(2).split('/');
                  const globalMock = pathParts.reduce((acc: any, part) => acc?.[part], global);
                  if (globalMock && globalMock[exportName]) {
                    globalMock[exportName].mockImplementation(implementation);
                  }
                }
              } catch (innerError) {
                console.warn(`Unable to mock ${modulePath}.${exportName}:`, innerError);
              }
            }
          });
        }
      } catch (error) {
        console.warn(`Error setting up custom mock for ${modulePath}:`, error);
      }
    });
  }

  // Return cleanup function
  return () => {
    vi.resetAllMocks();
  };
};

// Create a standard query client for testing
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a wrapper with QueryClient provider
export const createProviderWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
};

// Custom render function with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  authState?: Partial<MockAuthState>;
  isMobile?: boolean;
  customProviders?: React.FC<{ children: React.ReactNode }>;
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } => {
  const {
    queryClient = createTestQueryClient(),
    authState,
    isMobile = false,
    customProviders: CustomProviders,
    ...renderOptions
  } = options;

  // Set up user event instance
  const user = userEvent.setup();

  // Set up mocks
  setupMocks({ authState, isMobile });

  // Create wrapper with providers
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {CustomProviders ? <CustomProviders>{children}</CustomProviders> : children}
    </QueryClientProvider>
  );

  // Use the standard render function with our Wrapper
  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });

  // Return the render result along with the user event instance
  return {
    user,
    ...renderResult,
  };
};

/**
 * Custom test helpers
 */
export const testHelpers = {
  getByTestClass: (container: HTMLElement, className: string) => {
    const elements = container.getElementsByClassName(className);
    if (elements.length === 0) {
      throw new Error(`No elements found with class: ${className}`);
    }
    return elements[0];
  },
  getAllByTestClass: (container: HTMLElement, className: string) => {
    const elements = container.getElementsByClassName(className);
    if (elements.length === 0) {
      throw new Error(`No elements found with class: ${className}`);
    }
    return Array.from(elements);
  },
  // Add a helper to find a component by text content within it
  findByTextContent: (container: HTMLElement, text: string | RegExp) => {
    const allElements = container.querySelectorAll('*');
    for (const element of Array.from(allElements)) {
      if (typeof text === 'string') {
        if (element.textContent?.includes(text)) {
          return element;
        }
      } else {
        if (text.test(element.textContent || '')) {
          return element;
        }
      }
    }
    throw new Error(`No element found with text content: ${text}`);
  },
  // Find an element with a specific text, handling possible text fragmentation
  findByFragmentedText: (container: HTMLElement, text: string) => {
    const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim();
    const allElements = container.querySelectorAll('*');
    
    for (const element of Array.from(allElements)) {
      const elementText = element.textContent?.toLowerCase().replace(/\s+/g, ' ').trim() || '';
      if (elementText.includes(normalizedText)) {
        return element;
      }
    }
    
    throw new Error(`No element found with fragmented text: ${text}`);
  }
};

export default {
  setupMocks,
  createTestQueryClient,
  createProviderWrapper,
  renderWithProviders,
  testHelpers
};