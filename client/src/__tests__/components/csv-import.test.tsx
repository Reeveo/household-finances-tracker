import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CSVImport } from '@/components/income-expense/csv-import';
import { setupMocks } from '../test-utils';
import { apiRequest } from '@/lib/queryClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

// Mock the API request
vi.mock('@/lib/queryClient');

// Mock toast notifications
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('CSVImport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setupMocks();
  });

  it('handles successful file upload and column mapping', async () => {
    // Mock successful API response
    (apiRequest as any).mockResolvedValueOnce({ success: true });

    // Render component
    renderWithProviders(<CSVImport />);

    // Upload file
    const file = new File(
      ['Date,Type,Reference,Description,Amount,Balance\n01/01/2024,CREDIT,REF123,Test Transaction,100.00,1000.00'], 
      'test.csv', 
      { type: 'text/csv' }
    );
    
    // Find and trigger file input
    const uploadButton = screen.getByRole('button', { name: /Select CSV File/i });
    const fileInput = screen.getByTestId('csv-upload');
    await userEvent.upload(fileInput, file);

    // Verify upload success message
    expect(await screen.findByText(/File uploaded successfully/i)).toBeInTheDocument();
    
    // Select bank format
    const formatSelect = screen.getByRole('combobox', { name: /bank format/i });
    await userEvent.click(formatSelect);
    const standardOption = screen.getByRole('option', { name: /Standard UK Bank Format/i });
    await userEvent.click(standardOption);

    // Wait for preview to load
    await waitFor(() => {
      expect(screen.getByText(/Test Transaction/i)).toBeInTheDocument();
    });

    // Process import
    const importButton = screen.getByRole('button', { name: /Import/i });
    await userEvent.click(importButton);

    // Verify API call
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        'POST',
        '/api/transactions/batch',
        expect.objectContaining({
          transactions: expect.arrayContaining([
            expect.objectContaining({
              description: 'Test Transaction',
              amount: 100.00
            })
          ])
        })
      );
    });
  });

  it('handles custom column mapping', async () => {
    renderWithProviders(<CSVImport />);

    // Upload file with custom format
    const file = new File(
      ['CustomDate,CustomDesc,Value\n2024-03-15,Custom Transaction,50.00'], 
      'custom.csv', 
      { type: 'text/csv' }
    );
    
    const fileInput = screen.getByTestId('csv-upload');
    await userEvent.upload(fileInput, file);

    // Select custom format
    const formatSelect = screen.getByRole('combobox', { name: /bank format/i });
    await userEvent.click(formatSelect);
    const customOption = screen.getByRole('option', { name: /custom/i });
    await userEvent.click(customOption);

    // Map columns
    const dateColumnSelect = screen.getByRole('combobox', { name: /date column/i });
    const descColumnSelect = screen.getByRole('combobox', { name: /description column/i });
    const amountColumnSelect = screen.getByRole('combobox', { name: /amount format/i });

    await userEvent.click(dateColumnSelect);
    await userEvent.click(screen.getByRole('option', { name: /column 0/i }));

    await userEvent.click(descColumnSelect);
    await userEvent.click(screen.getByRole('option', { name: /column 1/i }));

    await userEvent.click(amountColumnSelect);
    await userEvent.click(screen.getByRole('option', { name: /single amount column/i }));

    // Verify preview updates
    expect(await screen.findByText(/Custom Transaction/i)).toBeInTheDocument();
  });

  it('handles API errors during import', async () => {
    (apiRequest as any).mockRejectedValueOnce(new Error('Import failed'));
    renderWithProviders(<CSVImport />);

    // Upload file
    const file = new File(
      ['Date,Type,Reference,Description,Amount,Balance\n01/01/2024,CREDIT,REF123,Test Transaction,100.00,1000.00'], 
      'test.csv', 
      { type: 'text/csv' }
    );
    
    const fileInput = screen.getByTestId('csv-upload');
    await userEvent.upload(fileInput, file);

    // Select format
    const formatSelect = screen.getByRole('combobox', { name: /bank format/i });
    await userEvent.click(formatSelect);
    await userEvent.click(screen.getByRole('option', { name: /Standard UK Bank Format/i }));

    // Process import
    const importButton = screen.getByRole('button', { name: /Import/i });
    await userEvent.click(importButton);

    // Verify error message
    expect(await screen.findByText(/Error importing transactions/i)).toBeInTheDocument();
  });

  it('validates file type', async () => {
    renderWithProviders(<CSVImport />);

    // Try to upload non-CSV file
    const file = new File(['invalid'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByTestId('csv-upload');
    await userEvent.upload(fileInput, file);

    // Verify error message
    expect(await screen.findByText(/Please upload a CSV file/i)).toBeInTheDocument();
  });

  it('handles empty files', async () => {
    renderWithProviders(<CSVImport />);

    // Upload empty file
    const file = new File([''], 'empty.csv', { type: 'text/csv' });
    const fileInput = screen.getByTestId('csv-upload');
    await userEvent.upload(fileInput, file);

    // Verify error message
    expect(await screen.findByText(/The CSV file appears to be empty/i)).toBeInTheDocument();
  });
});