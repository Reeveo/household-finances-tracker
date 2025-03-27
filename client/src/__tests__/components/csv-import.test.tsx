import { vi, describe, it, expect, beforeEach } from 'vitest';
import React, { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { CSVImport } from '@/components/income-expense/csv-import';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Define apiRequest for TypeScript
const apiRequest = vi.fn();

// Mock the API request function and AuthProvider
vi.mock('@/lib/queryClient', () => ({
  apiRequest,
  queryClient: {
    invalidateQueries: vi.fn()
  },
  getQueryFn: vi.fn().mockImplementation(() => async () => null)
}));

// Mock the Auth Provider to avoid dependency on actual implementation
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: '123', email: 'test@example.com' },
    isLoading: false,
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}));

// Then mock the hooks
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    })),
    useQuery: vi.fn(() => ({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    })),
  };
});

describe('CSVImport Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    apiRequest.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 
        stats: { created: 2, duplicates: 0, errors: 0 },
        created: [
          { id: 1, description: 'SALARY ACME INC', amount: '1500.00', category: 'Income' },
          { id: 2, description: 'GROCERY STORE', amount: '-45.67', category: 'Essentials' }
        ]
      })
    });
  });

  it('renders the CSV import form with correct initial state', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CSVImport />
      </QueryClientProvider>
    );
    
    // Check if the upload button is present
    expect(screen.getByText(/Upload Bank Statement CSV/i)).toBeInTheDocument();
    
    // Check if instructions are present
    expect(screen.getByText(/Import your bank statements/i)).toBeInTheDocument();
    
    // Additional checks for initial UI elements
    expect(screen.getByText(/Supported Bank Formats/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Upload CSV/i)).toBeInTheDocument();
  });

  // Other tests are skipped for now as they require more complex mocking
});