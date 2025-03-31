import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';
import { customQueries, customAssertions } from './test-utils-enhanced';

// Create a custom render function that includes providers
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      // Disable auto fetch for tests
      enabled: false,
    },
  },
});

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  withAuth?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    withAuth = true,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {withAuth ? (
          <AuthProvider>
            {children}
          </AuthProvider>
        ) : (
          children
        )}
      </QueryClientProvider>
    );
  }
  return { 
    ...render(ui, { wrapper: Wrapper, ...renderOptions }), 
    queryClient,
    ...customQueries
  };
}

// Re-export everything
export * from '@testing-library/react';

// Export custom queries
export { customQueries, customAssertions };

// Include jest-dom matchers
import '@testing-library/jest-dom';