import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupMocks } from './test-utils';
import '@testing-library/jest-dom';

// Define a simple component for testing
const SimpleComponent = () => {
  return <div data-testid="simple">Hello World</div>;
};

// Create a standard query client for testing
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

// Our custom render with providers
const customRenderWithProviders = (ui: React.ReactElement) => {
  // Set up user event
  const queryClient = createTestQueryClient();
  
  // Setup basic mocks
  setupMocks({
    authState: {
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        createdAt: new Date(),
        role: 'user'
      },
      isAuthenticated: true
    }
  });
  
  // Define wrapper
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
  
  // Return render result
  return render(ui, { wrapper: Wrapper });
};

describe('Test Utils Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a simple component with standard render', () => {
    render(<SimpleComponent />);
    
    // Debug what's rendered
    screen.debug();
    
    // Check if component rendered
    const element = screen.getByTestId('simple');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Hello World');
  });

  it('renders a simple component with custom renderWithProviders', () => {
    customRenderWithProviders(<SimpleComponent />);
    
    // Debug what's rendered
    screen.debug();
    
    // Check if component rendered
    const element = screen.getByTestId('simple');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Hello World');
  });
}); 