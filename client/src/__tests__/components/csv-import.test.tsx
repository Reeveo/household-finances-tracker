import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CSVImport } from '@/components/income-expense/csv-import';
import { renderWithProviders } from '../test-utils';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Mock the API request function
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
  queryClient: {
    invalidateQueries: vi.fn()
  }
}));

// Mock the FileReader API
const mockFileReader = {
  readAsText: function(blob: Blob) {
    // Mock CSV file content - simplified bank statement with headers and two rows
    const csvContent = `Date,Description,Debit,Credit,Balance
25/05/2023,SALARY ACME INC,,1500.00,1500.00
28/05/2023,GROCERY STORE,45.67,,1454.33`;
    
    // Trigger the onload event asynchronously
    setTimeout(() => {
      this.onload?.({ target: { result: csvContent } } as any);
    }, 0);
  },
  result: '',
  onload: null
};

// Replace the global FileReader with our mock
vi.stubGlobal('FileReader', vi.fn(() => mockFileReader));

describe('CSVImport Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiRequest as any).mockResolvedValue({
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
    renderWithProviders(<CSVImport />);
    
    // Check if the upload button is present
    expect(screen.getByText(/Upload Bank Statement/i)).toBeInTheDocument();
    
    // Check if instructions are present
    expect(screen.getByText(/Import your bank statements/i)).toBeInTheDocument();
  });

  it('handles file selection and displays preview', async () => {
    renderWithProviders(<CSVImport />);
    
    // Get the file input
    const fileInput = screen.getByLabelText(/Upload Bank Statement/i) as HTMLInputElement;
    
    // Create a mock file and trigger the change event
    const file = new File(['test'], 'statement.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Wait for the file to be processed
    await waitFor(() => {
      // Check if preview is shown
      expect(screen.getByText(/Preview Transactions/i)).toBeInTheDocument();
      // Check if some of the parsed data is shown
      expect(screen.getByText(/SALARY ACME INC/i)).toBeInTheDocument();
      expect(screen.getByText(/GROCERY STORE/i)).toBeInTheDocument();
    });
  });

  it('allows category mapping and submits the form', async () => {
    renderWithProviders(<CSVImport />);
    
    // Get the file input and upload a file
    const fileInput = screen.getByLabelText(/Upload Bank Statement/i) as HTMLInputElement;
    const file = new File(['test'], 'statement.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Wait for the file to be processed
    await waitFor(() => {
      expect(screen.getByText(/Preview Transactions/i)).toBeInTheDocument();
    });
    
    // Change a category dropdown (this is more complex with shadcn but simplified for test)
    // In a real test you'd need to handle the shadcn Select component's interactions
    const categorySelects = screen.getAllByText(/Income/i);
    expect(categorySelects.length).toBeGreaterThan(0);
    
    // Click import button
    const importButton = screen.getByRole('button', { name: /Import/i });
    fireEvent.click(importButton);
    
    // Verify API was called with the expected data
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        'POST',
        '/api/transactions/batch',
        expect.objectContaining({
          transactions: expect.arrayContaining([
            expect.objectContaining({
              description: 'SALARY ACME INC',
              category: 'Income',
            }),
            expect.objectContaining({
              description: 'GROCERY STORE',
              category: 'Essentials',
            })
          ])
        })
      );
      
      // Check that the cache is invalidated after submission
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['/api/transactions'] });
    });
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText(/Successfully imported 2 transactions/i)).toBeInTheDocument();
    });
  });

  it('handles API errors during import', async () => {
    // Mock API error
    (apiRequest as any).mockRejectedValue(new Error('Server error'));
    
    renderWithProviders(<CSVImport />);
    
    // Get the file input and upload a file
    const fileInput = screen.getByLabelText(/Upload Bank Statement/i) as HTMLInputElement;
    const file = new File(['test'], 'statement.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Wait for the file to be processed
    await waitFor(() => {
      expect(screen.getByText(/Preview Transactions/i)).toBeInTheDocument();
    });
    
    // Click import button
    const importButton = screen.getByRole('button', { name: /Import/i });
    fireEvent.click(importButton);
    
    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText(/Error importing transactions/i)).toBeInTheDocument();
    });
  });
});