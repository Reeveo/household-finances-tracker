import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
const renderWithQueryClient = (ui: React.ReactElement) => {
  return render(ui, { wrapper: QueryWrapper });
};

describe('QueryClient Wrapper Testing', () => {
  it('renders a simple component directly', () => {
    render(<SimpleComponent />);
    
    // Debug what's rendered
    screen.debug();
    
    // Check if component rendered
    const element = screen.getByTestId('simple');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Hello World');
  });

  it('renders a simple component with QueryClientProvider', () => {
    renderWithQueryClient(<SimpleComponent />);
    
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