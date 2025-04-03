import { screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CSVImport } from '@/components/income-expense/csv-import';
import { renderWithProviders, setupMocks } from '../test-utils';

describe('CSVImport', () => {
  let mockFileReader: any;
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Set up standard mocks
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
        }
      },
      // Mock API responses for bank formats
      apiResponses: [
        {
          endpoint: '/api/bank-formats',
          method: 'GET',
          response: [
            { id: 1, name: 'Chase Bank', code: 'chase' },
            { id: 2, name: 'Bank of America', code: 'bofa' },
            { id: 3, name: 'Wells Fargo', code: 'wellsfargo' },
            { id: 4, name: 'Custom Format', code: 'custom' }
          ]
        }
      ]
    });
    
    // Mock FileReader
    mockFileReader = {
      readAsText: vi.fn(),
      onload: null,
      onerror: null,
      result: null
    };
    
    // @ts-ignore - we need to mock the FileReader constructor
    global.FileReader = vi.fn(() => mockFileReader);
  });

  it('renders the upload interface', async () => {
    const { user } = renderWithProviders(<CSVImport />);
    
    // Check that the title is rendered
    expect(await screen.findByText(/import transactions/i)).toBeInTheDocument();
    
    // Check that supported formats section is shown
    expect(screen.getByText('Supported Bank Formats')).toBeInTheDocument();
    
    // Check for bank format options
    await waitFor(() => {
      expect(screen.getByText('Chase Bank')).toBeInTheDocument();
      expect(screen.getByText('Bank of America')).toBeInTheDocument();
      expect(screen.getByText('Wells Fargo')).toBeInTheDocument();
      expect(screen.getByText('Custom Format')).toBeInTheDocument();
    });
    
    // Upload button should be present
    expect(await screen.findByRole('button', { name: /select csv file/i })).toBeInTheDocument();
  });
  
  it('handles file selection', async () => {
    const { user } = renderWithProviders(<CSVImport />);
    
    // Get file input and upload button
    const uploadButton = await screen.findByRole('button', { name: /select csv file/i });
    
    // Create a test file
    const testFile = new File(['date,description,amount\n2023-01-01,Test Transaction,100.00'], 'test.csv', { type: 'text/csv' });
    
    // Click the upload button
    await user.click(uploadButton);
    
    // Simulate file selection
    // This is a bit tricky in testing as the file input is often hidden
    const fileInput = screen.getByTestId('csv-file-input');
    await user.upload(fileInput, testFile);
    
    // Trigger the FileReader onload event
    mockFileReader.result = 'date,description,amount\n2023-01-01,Test Transaction,100.00';
    mockFileReader.onload && mockFileReader.onload({ target: mockFileReader } as any);
    
    // After file is processed, we should move to the mapping step
    await waitFor(() => {
      expect(screen.getByText(/map columns/i)).toBeInTheDocument();
    });
  });
  
  it('shows error when non-CSV file is selected', async () => {
    const { user } = renderWithProviders(<CSVImport />);
    
    // Get file input and upload button
    const uploadButton = await screen.findByRole('button', { name: /select csv file/i });
    
    // Create a test file with wrong type
    const testFile = new File(['not a csv'], 'test.txt', { type: 'text/plain' });
    
    // Click the upload button
    await user.click(uploadButton);
    
    // Simulate file selection with wrong file type
    const fileInput = screen.getByTestId('csv-file-input');
    await user.upload(fileInput, testFile);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/please select a csv file/i)).toBeInTheDocument();
    });
  });
});