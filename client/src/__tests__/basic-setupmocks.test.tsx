import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupMocks } from './test-utils';

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

// Define a wrapper with QueryClientProvider
const QueryWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <div data-testid="query-wrapper">{children}</div>
    </QueryClientProvider>
  );
};

// Custom render function with QueryClientProvider
const renderWithSetupMocks = (ui: React.ReactElement) => {
  // Setup mocks with basic auth state
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
  
  return render(ui, { wrapper: QueryWrapper });
};

describe('SetupMocks Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a simple component directly', () => {
    render(<SimpleComponent />);
    
    // Debug what's rendered
    screen.debug();
    
    // Check if component rendered
    const element = screen.getByTestId('simple');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Hello World');
  });

  it('renders a simple component with setupMocks', () => {
    renderWithSetupMocks(<SimpleComponent />);
    
    // Debug what's rendered
    screen.debug();
    
    // Check if wrapper rendered
    const wrapper = screen.getByTestId('query-wrapper');
    expect(wrapper).toBeInTheDocument();
    
    // Check if component rendered inside wrapper
    const element = screen.getByTestId('simple');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Hello World');
  });
});