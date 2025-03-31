import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, setupMocks, createTestQueryClient } from './test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

// A simple component for testing rendering
const SimpleComponent = () => <div data-testid="simple">Hello World</div>;

describe('Basic Rendering Test', () => {
  it('renders a basic component with standard render', () => {
    // Render using the standard React Testing Library render function
    const { container } = render(<SimpleComponent />);
    
    // Debug what's being rendered
    console.log('Basic render HTML:', container.innerHTML);
    
    // Check if component rendered
    expect(screen.getByTestId('simple')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
  
  it('renders a basic component with a direct QueryClientProvider wrapper', () => {
    // Create a query client
    const queryClient = createTestQueryClient();
    
    // Render using a direct wrapper component
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <SimpleComponent />
      </QueryClientProvider>
    );
    
    // Debug what's being rendered
    console.log('Direct wrapper HTML:', container.innerHTML);
    
    // Check if component rendered
    expect(screen.getByTestId('simple')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
  
  it('renders a basic component with bare renderWithProviders (no mocks)', () => {
    // Render using our custom renderWithProviders function without setting up mocks
    const { container } = renderWithProviders(<SimpleComponent />, {
      queryClient: createTestQueryClient()
    });
    
    // Debug what's being rendered
    console.log('renderWithProviders (no mocks) HTML:', container.innerHTML);
    
    // Check if component rendered
    expect(screen.getByTestId('simple')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
  
  it('renders a basic component with renderWithProviders and setupMocks', () => {
    // Set up mocks
    setupMocks({
      authState: {
        user: null,
        isLoading: false,
        loginMutation: {
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
        },
        logoutMutation: {
          mutate: vi.fn(),
          isSuccess: false,
          isError: false,
          error: null,
          isPending: false
        }
      }
    });
    
    // Render using our custom renderWithProviders function
    const { container } = renderWithProviders(<SimpleComponent />);
    
    // Debug what's being rendered
    console.log('renderWithProviders with setupMocks HTML:', container.innerHTML);
    
    // Check if component rendered
    expect(screen.getByTestId('simple')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
}); 