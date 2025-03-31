import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CSVImport } from '@/components/income-expense/csv-import';
import { setupMocks } from '../test-utils';
import { apiRequest } from '@/lib/queryClient';

// Mock the API request
vi.mock('@/lib/queryClient');

describe('CSVImport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setupMocks();
  });

  it('handles successful file upload and format selection', async () => {
    // Mock successful API response
    (apiRequest as any).mockResolvedValueOnce({ success: true });

    // Render component
    render(<CSVImport />);

    // Upload file
    const file = new File(['Date,Type,Reference,Description,Amount,Balance\n01/01/2024,CREDIT,REF123,Test Transaction,100.00,1000.00'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/Upload Bank Statement/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Select bank format
    const formatSelect = screen.getByLabelText(/Bank Format/i);
    fireEvent.change(formatSelect, { target: { value: 'standard' } });

    // Wait for preview to load
    await waitFor(() => {
      expect(screen.getByText(/Preview Transactions/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Transaction/i)).toBeInTheDocument();
    });

    // Process import
    const importButton = screen.getByRole('button', { name: /Import/i });
    fireEvent.click(importButton);

    // Verify API was called
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

  it('handles API errors during import', async () => {
    // Mock failed API response
    (apiRequest as any).mockRejectedValueOnce(new Error('Import failed'));

    // Render component
    render(<CSVImport />);

    // Upload file
    const file = new File(['Date,Type,Reference,Description,Amount,Balance\n01/01/2024,CREDIT,REF123,Test Transaction,100.00,1000.00'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/Upload Bank Statement/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Select bank format
    const formatSelect = screen.getByLabelText(/Bank Format/i);
    fireEvent.change(formatSelect, { target: { value: 'standard' } });

    // Wait for preview to load
    await waitFor(() => {
      expect(screen.getByText(/Preview Transactions/i)).toBeInTheDocument();
    });

    // Process import
    const importButton = screen.getByRole('button', { name: /Import/i });
    fireEvent.click(importButton);

    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText(/Error importing transactions/i)).toBeInTheDocument();
    });
  });

  it('validates required fields before import', async () => {
    // Render component
    render(<CSVImport />);

    // Upload file without selecting format
    const file = new File(['Date,Type,Reference,Description,Amount,Balance\n01/01/2024,CREDIT,REF123,Test Transaction,100.00,1000.00'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/Upload Bank Statement/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Try to import without selecting format
    const importButton = screen.getByRole('button', { name: /Import/i });
    fireEvent.click(importButton);

    // Verify validation message
    await waitFor(() => {
      expect(screen.getByText(/Please select a bank format/i)).toBeInTheDocument();
    });
  });
});