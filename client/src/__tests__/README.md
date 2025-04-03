# Testing Standards

This document outlines our standardized approach to testing in this project.

## Test Utilities

We have a standardized `test-utils.tsx` file that provides:

1. Consistent mock setup
2. Helper functions for testing
3. Standardized rendering with necessary providers

## Mocking

Always use the `setupMocks` function from `test-utils.tsx` to set up your mocks:

```typescript
import { setupMocks } from '../test-utils';

beforeEach(() => {
  setupMocks({
    // Set up auth state if needed
    authState: { 
      user: { id: 1, name: 'Test User' } 
    },
    // Set mobile/desktop view
    isMobile: false,
    // Set up mock API responses
    apiResponses: [
      {
        endpoint: '/api/users',
        method: 'GET',
        response: { data: [] }
      }
    ],
    // Set up query data
    queryData: {
      '/api/users': { data: [] }
    }
  });
});
```

## Rendering Components

Always use the `renderWithProviders` function from `test-utils.tsx` to render components:

```typescript
import { renderWithProviders } from '../test-utils';

it('renders correctly', () => {
  const { user, container } = renderWithProviders(<MyComponent />);
  
  // Now you can use the user instance for interaction
  // and container for finding elements
});
```

## Finding Elements

When working with elements:

1. Always prefer accessible queries (role, label, etc.)
2. Use the `testHelpers` for special cases:

```typescript
import { testHelpers } from '../test-utils';

// Find an element by its class
const element = testHelpers.getByTestClass(container, 'my-class');

// Find an element by fragmented text (text that might be split across elements)
const title = testHelpers.findByFragmentedText(container, 'Welcome to our site');
```

## Writing New Tests

When writing new tests:

1. Follow the structure of existing tests
2. Use the standardized test utilities
3. Make tests as independent and isolated as possible
4. Avoid duplicating test code
5. Focus on testing behavior, not implementation details

## Common Testing Patterns

### Testing a Component

```typescript
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { user } = renderWithProviders(<MyComponent />);
    
    // Check that the component renders properly
    expect(screen.getByRole('heading')).toHaveTextContent('My Component');
    
    // Interact with the component
    await user.click(screen.getByRole('button'));
    
    // Check for expected changes
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### Testing a Hook

```typescript
import { renderHook } from '@testing-library/react';
import { createProviderWrapper } from '../test-utils';

describe('useMyHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useMyHook(), {
      wrapper: createProviderWrapper()
    });
    
    // Check the initial value
    expect(result.current.value).toBe(0);
    
    // Call a function in the hook
    result.current.increment();
    
    // Check the updated value
    expect(result.current.value).toBe(1);
  });
});
```

## Testing API Requests

When testing API requests, always:

1. Mock the `apiRequest` function
2. Check that it was called with the expected parameters
3. Use `waitFor` to handle the asynchronous nature of API calls

```typescript
import { apiRequest } from '@/lib/queryClient';
import { renderWithProviders } from '../test-utils';
import { waitFor } from '@testing-library/react';

describe('MyComponent', () => {
  it('calls the API correctly', async () => {
    (apiRequest as any).mockResolvedValueOnce({ data: [] });
    
    const { user } = renderWithProviders(<MyComponent />);
    
    await user.click(screen.getByRole('button', { name: 'Load Data' }));
    
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        'GET',
        '/api/data',
        expect.any(Object)
      );
    });
  });
}); 