import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

// Create a test QueryClient
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

// Create a minimal render function that just provides the QueryClient
interface MinimalRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export const renderWithClient = (
  ui: ReactElement,
  options: MinimalRenderOptions = {}
) => {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;
  
  // Create a simple wrapper with just the QueryClientProvider
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  
  // Set up user event instance
  const user = userEvent.setup();
  
  // Render with the wrapper
  return {
    user,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
}; 