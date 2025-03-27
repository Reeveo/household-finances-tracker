import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { CSVImport } from '../../components/income-expense/csv-import';
import { AuthProvider } from '@/hooks/use-auth';

// Mock the API request function
vi.mock('@/lib/api-request', () => ({
  apiRequest: vi.fn()
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

const csvContent = `Date,Type,Sort Code,Account Number,Description,Debit,Credit,Balance
01/01/2024,DD,123456,12345678,Test Transaction 1,,100.00,1100.00
02/01/2024,FPI,123456,12345678,Test Transaction 2,50.00,,1050.00`;

describe('CSVImport Component', () => {
  let queryClient: QueryClient;

  // Mock FileReader
  const mockFileReader = {
    readAsText: vi.fn(),
    result: csvContent,
    onload: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
    onerror: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null,
    EMPTY: 0,
    LOADING: 1,
    DONE: 2,
    readyState: 0,
    error: null as Error | null,
    abort: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  };

  beforeEach(() => {
    queryClient = new QueryClient();
    
    // Mock FileReader implementation
    global.FileReader = vi.fn(() => mockFileReader) as unknown as typeof FileReader;
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CSVImport />
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it('renders the CSV import form', () => {
    renderComponent();
    expect(screen.getByText('Import Bank Transactions')).toBeInTheDocument();
    expect(screen.getByText('Upload Bank Statement CSV')).toBeInTheDocument();
  });

  it('handles file upload and column mapping', async () => {
    renderComponent();

    // Get the file input
    const fileInput = screen.getByTestId('csv-upload');
    
    // Create a CSV file
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    // Trigger file upload
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Simulate FileReader onload
      if (mockFileReader.onload) {
        mockFileReader.onload.call(mockFileReader as unknown as FileReader, {
          target: { result: csvContent }
        } as unknown as ProgressEvent<FileReader>);
      }
    });

    // Wait for the mapping step to appear and for the component to be ready
    await waitFor(() => {
      expect(screen.getByText('Column Mapping')).toBeInTheDocument();
    });

    // Select bank format
    await act(async () => {
      const bankFormatSelect = screen.getByRole('combobox');
      fireEvent.click(bankFormatSelect);
      
      // Wait for the select content to appear
      await waitFor(() => {
        expect(screen.getByText('Standard UK Bank Format')).toBeInTheDocument();
      });
      
      // Click the option
      fireEvent.click(screen.getByText('Standard UK Bank Format'));
    });

    // Wait for the component to update after bank format selection
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Debug: Log all buttons in the document
    const allButtons = screen.getAllByRole('button', { hidden: true });
    console.log('Available buttons:', allButtons.map(button => button.textContent));

    // Wait for the Process Transactions button to be available
    await waitFor(() => {
      const processButton = screen.getByText('Process Transactions');
      expect(processButton).toBeInTheDocument();
      expect(processButton.closest('button')).not.toBeDisabled();
    });

    // Click Process Transactions to proceed to preview
    await act(async () => {
      const processButton = screen.getByText('Process Transactions');
      fireEvent.click(processButton.closest('button')!);
    });

    // Wait for preview step
    await waitFor(() => {
      expect(screen.getByText('3. Review & Import')).toBeInTheDocument();
      const importButton = screen.getByRole('button', { name: /^Import \d* Transactions$/i });
      expect(importButton).toBeInTheDocument();
      expect(importButton).not.toBeDisabled();
    });

    // Click Import to confirm
    await act(async () => {
      const importButton = screen.getByRole('button', { name: /^Import \d* Transactions$/i });
      fireEvent.click(importButton);
    });

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Transactions processed successfully')).toBeInTheDocument();
      expect(screen.getByText('2 transactions found. Review and categorize before importing.')).toBeInTheDocument();
    });
  });

  it('handles import cancellation', async () => {
    renderComponent();

    // Get the file input
    const fileInput = screen.getByTestId('csv-upload');
    
    // Create a CSV file
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    // Trigger file upload
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Simulate FileReader onload
      if (mockFileReader.onload) {
        mockFileReader.onload.call(mockFileReader as unknown as FileReader, {
          target: { result: csvContent }
        } as unknown as ProgressEvent<FileReader>);
      }
    });

    // Wait for the mapping step to appear
    await waitFor(() => {
      expect(screen.getByText('Column Mapping')).toBeInTheDocument();
    });

    // Click Back to cancel
    await act(async () => {
      const backButton = screen.getByRole('button', { name: /Back/i });
      fireEvent.click(backButton);
    });

    // Verify we're back at the upload step
    await waitFor(() => {
      expect(screen.getByText('Upload Bank Statement CSV')).toBeInTheDocument();
    });
  });
});