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

// Standard mock setup
vi.mock('@/hooks/use-auth');
vi.mock('@/hooks/use-toast');
vi.mock('@/hooks/use-mobile');
vi.mock('@tanstack/react-query');

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
    (useAuth as any).mockImplementation(createMockAuthHook(authState));
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
  Object.entries(customMocks).forEach(([mockPath, implementation]) => {
    if (typeof implementation === 'function') {
      // This needs to be called outside of this function, but we log a warning
      console.warn(`Custom mock for ${mockPath} should be set up before calling setupMocks`);
    }
  });

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
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    let wrappedChildren = children;

    // Wrap with custom providers if provided
    if (CustomProviders) {
      wrappedChildren = <CustomProviders>{wrappedChildren}</CustomProviders>;
    }

    // Wrap with QueryClientProvider
    return (
      <QueryClientProvider client={queryClient}>
        {wrappedChildren}
      </QueryClientProvider>
    );
  };

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
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