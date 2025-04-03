import React, { ReactElement } from 'react';
import { render, screen, within, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';

// Re-export everything from testing-library
export * from '@testing-library/react';

// Create a custom render function that includes providers
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      // Prevent auto-fetching of data in tests
      enabled: false,
    },
  },
});

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  preloadedState?: any;
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
  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient };
}

// Custom queries for shadcn components
export const customQueries = {
  // Find a button by both text and role
  getButtonByText: (text: string) => {
    return screen.getByRole('button', { name: new RegExp(text, 'i') });
  },
  
  // Find a tab by its name
  getTabByName: (name: string) => {
    return screen.getByRole('tab', { name: new RegExp(name, 'i') });
  },
  
  // Find elements within a specific section
  getWithinSection: (heading: string) => {
    const headingElement = screen.getByRole('heading', { name: new RegExp(heading, 'i') });
    // Get the parent section
    let parent = headingElement.parentElement;
    while (parent && parent.tagName !== 'SECTION') {
      parent = parent.parentElement;
    }
    return parent ? within(parent) : within(document.body);
  },
  
  // Get by exact button text
  getButtonByExactText: (text: string) => {
    // First look for exact match
    const buttons = screen.getAllByRole('button');
    const button = buttons.find(button => button.textContent?.trim() === text);
    if (button) return button;
    
    // If not found, try regular getByRole
    return screen.getByRole('button', { name: text });
  },
  
  // Get all form fields by label
  getAllFormFieldsByLabel: () => {
    return screen.getAllByRole('textbox');
  },
  
  // Get deactivate account button (special case for settings page)
  getDeactivateAccountButton: () => {
    const buttons = screen.getAllByRole('button');
    return buttons.find(button => 
      button.textContent?.includes('Deactivate Account') && 
      button.querySelector('svg') // Has icon
    );
  },
};

// Custom assertions
export const customAssertions = {
  toHaveFormValues: (form: HTMLElement, expectedValues: Record<string, any>) => {
    const formElements = within(form).getAllByRole('textbox');
    const actualValues: Record<string, string> = {};
    
    formElements.forEach(el => {
      if (el instanceof HTMLInputElement) {
        const name = el.name;
        if (name) {
          actualValues[name] = el.value;
        }
      }
    });
    
    // Check if all expected values are present in actualValues
    const missingKeys = Object.keys(expectedValues).filter(
      key => !(key in actualValues)
    );
    
    if (missingKeys.length > 0) {
      return {
        pass: false,
        message: () => `Expected form to have fields: ${missingKeys.join(', ')}`,
      };
    }
    
    // Check values match
    const mismatchedKeys = Object.keys(expectedValues).filter(
      key => actualValues[key] !== expectedValues[key]
    );
    
    if (mismatchedKeys.length > 0) {
      return {
        pass: false,
        message: () => 
          `Expected values don't match for keys: ${mismatchedKeys.join(', ')}\n` +
          `Expected: ${JSON.stringify(mismatchedKeys.reduce((obj, key) => ({ ...obj, [key]: expectedValues[key] }), {}))}` +
          `Received: ${JSON.stringify(mismatchedKeys.reduce((obj, key) => ({ ...obj, [key]: actualValues[key] }), {}))}`,
      };
    }
    
    return {
      pass: true,
      message: () => `Form has the expected values`,
    };
  },
}; 