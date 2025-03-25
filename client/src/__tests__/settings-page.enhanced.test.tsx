import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import SettingsPage from '../pages/settings-page';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderWithProviders } from './test-utils';
import { apiRequest } from '@/lib/queryClient';

// Mock the hooks
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
  useQueryClient: vi.fn(() => ({
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock('@/components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}));

describe('SettingsPage Enhanced Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({ 
      user: { 
        id: 1, 
        name: 'Test User', 
        email: 'test@example.com' 
      },
      logout: vi.fn(),
      updateUser: vi.fn(),
    });
    
    (useToast as any).mockReturnValue({
      toast: vi.fn(),
    });
    
    (useIsMobile as any).mockReturnValue(false);
    
    // Reset mutation mock
    (useMutation as any).mockImplementation(({ onSuccess, onError }) => ({
      mutate: (data: any) => {
        onSuccess && onSuccess();
      },
      isPending: false,
      isError: false,
      error: null,
    }));
    
    // Mock the API request function
    (apiRequest as any).mockImplementation(() => Promise.resolve({}));
  });

  describe('Profile Tab Tests', () => {
    test('shows validation errors when submitting empty fields', async () => {
      render(<SettingsPage />);
      
      // Clear the name field
      const nameInput = screen.getByLabelText('Full Name');
      fireEvent.change(nameInput, { target: { value: '' } });
      
      // Submit the form
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      // Check for validation error
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
      
      // The mutation should not be called with invalid data
      const mockMutate = useMutation().mutate;
      expect(mockMutate).not.toHaveBeenCalled();
    });
    
    test('handles API errors during profile update', async () => {
      // Mock an error in the mutation
      (useMutation as any).mockImplementation(({ onSuccess, onError }) => ({
        mutate: (data: any) => {
          onError && onError(new Error('API Error'));
        },
        isPending: false,
        isError: true,
        error: new Error('API Error'),
      }));
      
      const mockToast = vi.fn();
      (useToast as any).mockReturnValue({
        toast: mockToast,
      });
      
      render(<SettingsPage />);
      
      // Submit the form
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      // Wait for error handling
      await waitFor(() => {
        // Check if error toast was displayed
        expect(mockToast).toHaveBeenCalledWith({
          title: expect.any(String),
          description: expect.stringContaining('error'),
          variant: 'destructive',
        });
      });
    });
    
    test('shows loading state during profile update', async () => {
      // Mock a loading state
      (useMutation as any).mockImplementation(() => ({
        mutate: vi.fn(),
        isPending: true,
        isError: false,
        error: null,
      }));
      
      render(<SettingsPage />);
      
      // Submit the form
      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();
      expect(saveButton.textContent).toContain('Saving');
    });
    
    test('updates user context after successful profile update', async () => {
      const mockUpdateUser = vi.fn();
      (useAuth as any).mockReturnValue({ 
        user: { 
          id: 1, 
          name: 'Test User', 
          email: 'test@example.com' 
        },
        updateUser: mockUpdateUser,
      });
      
      // Mock a successful mutation
      (useMutation as any).mockImplementation(({ onSuccess }) => ({
        mutate: (data: any) => {
          onSuccess && onSuccess(data);
        },
        isPending: false,
        isError: false,
        error: null,
      }));
      
      render(<SettingsPage />);
      
      // Edit the name field
      const nameInput = screen.getByLabelText('Full Name');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      
      // Submit the form
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      // Check if auth context was updated
      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          name: 'Updated Name',
          email: 'test@example.com',
        });
      });
    });
  });
  
  describe('Security Tab Tests', () => {
    test('validates password confirmation match', async () => {
      render(<SettingsPage />);
      
      // Switch to security tab
      fireEvent.click(screen.getByRole('tab', { name: 'Security' }));
      
      // Fill in the form with non-matching passwords
      fireEvent.change(screen.getByLabelText('Current Password'), { 
        target: { value: 'current123' } 
      });
      
      fireEvent.change(screen.getByLabelText('New Password'), { 
        target: { value: 'newpass123' } 
      });
      
      fireEvent.change(screen.getByLabelText('Confirm New Password'), { 
        target: { value: 'different123' } 
      });
      
      // Submit the form
      fireEvent.click(screen.getByText('Update Password'));
      
      // Check for validation error message
      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
      });
    });
    
    test('validates password strength requirements', async () => {
      render(<SettingsPage />);
      
      // Switch to security tab
      fireEvent.click(screen.getByRole('tab', { name: 'Security' }));
      
      // Fill in the form with a weak password
      fireEvent.change(screen.getByLabelText('Current Password'), { 
        target: { value: 'current123' } 
      });
      
      fireEvent.change(screen.getByLabelText('New Password'), { 
        target: { value: 'weak' } 
      });
      
      fireEvent.change(screen.getByLabelText('Confirm New Password'), { 
        target: { value: 'weak' } 
      });
      
      // Submit the form
      fireEvent.click(screen.getByText('Update Password'));
      
      // Check for validation error message
      await waitFor(() => {
        expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
      });
    });
    
    test('handles successful password update', async () => {
      const mockToast = vi.fn();
      (useToast as any).mockReturnValue({
        toast: mockToast,
      });
      
      (useMutation as any).mockImplementation(({ onSuccess }) => ({
        mutate: (data: any) => {
          onSuccess && onSuccess();
        },
        isPending: false,
        isError: false,
        error: null,
      }));
      
      render(<SettingsPage />);
      
      // Switch to security tab
      fireEvent.click(screen.getByRole('tab', { name: 'Security' }));
      
      // Fill in the form with valid data
      fireEvent.change(screen.getByLabelText('Current Password'), { 
        target: { value: 'current123' } 
      });
      
      fireEvent.change(screen.getByLabelText('New Password'), { 
        target: { value: 'StrongNewPass123!' } 
      });
      
      fireEvent.change(screen.getByLabelText('Confirm New Password'), { 
        target: { value: 'StrongNewPass123!' } 
      });
      
      // Submit the form
      fireEvent.click(screen.getByText('Update Password'));
      
      // Check if success message was displayed
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: expect.stringContaining('Success'),
          description: expect.stringContaining('updated'),
        });
      });
      
      // Form should be reset after successful submission
      await waitFor(() => {
        const currentPasswordField = screen.getByLabelText('Current Password') as HTMLInputElement;
        expect(currentPasswordField.value).toBe('');
      });
    });
  });
  
  describe('Appearance Tab Tests', () => {
    test('saves theme preferences correctly', async () => {
      const mockMutate = vi.fn();
      (useMutation as any).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
      });
      
      render(<SettingsPage />);
      
      // Switch to appearance tab
      fireEvent.click(screen.getByRole('tab', { name: 'Appearance' }));
      
      // Select dark theme
      fireEvent.click(screen.getByLabelText('Dark'));
      
      // Toggle animations off
      const animationsToggle = screen.getByRole('checkbox', { name: 'Animations' });
      fireEvent.click(animationsToggle);
      
      // Save the settings
      fireEvent.click(screen.getByText('Save Preferences'));
      
      // Check if mutation was called with correct data
      expect(mockMutate).toHaveBeenCalledWith({
        theme: 'dark',
        animations: false,
        soundEffects: true,  // Default value
      });
    });
    
    test('updates UI immediately after changing theme', async () => {
      // Mock localStorage
      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      
      render(<SettingsPage />);
      
      // Switch to appearance tab
      fireEvent.click(screen.getByRole('tab', { name: 'Appearance' }));
      
      // Select dark theme
      fireEvent.click(screen.getByLabelText('Dark'));
      
      // Check if localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });
  
  describe('Notifications Tab Tests', () => {
    test('toggles email notification preferences', async () => {
      const mockMutate = vi.fn();
      (useMutation as any).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
      });
      
      render(<SettingsPage />);
      
      // Switch to notifications tab
      fireEvent.click(screen.getByRole('tab', { name: 'Notifications' }));
      
      // Toggle various notification options
      const weeklyReportToggle = screen.getByRole('checkbox', { name: 'Weekly Summary Report' });
      const budgetAlertToggle = screen.getByRole('checkbox', { name: 'Budget Alerts' });
      
      fireEvent.click(weeklyReportToggle);
      fireEvent.click(budgetAlertToggle);
      
      // Save the settings
      fireEvent.click(screen.getByText('Save Notification Settings'));
      
      // Check if mutation was called with correct data
      expect(mockMutate).toHaveBeenCalledWith({
        emailNotifications: true, // Default value
        weeklyReport: true,
        budgetAlerts: true,
        billReminders: true, // Default value
        newFeatures: true, // Default value
      });
    });
  });
  
  describe('Account Deactivation Tests', () => {
    test('requires typing confirmation text to enable deactivate button', async () => {
      render(<SettingsPage />);
      
      // Click the deactivate button to open dialog
      const deactivateButton = screen.getByText('Deactivate Account');
      fireEvent.click(deactivateButton);
      
      // Check if confirmation dialog appears
      await waitFor(() => {
        expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();
      });
      
      // Verify that the confirm button is disabled initially
      const confirmButton = screen.getByText('Yes, deactivate my account');
      expect(confirmButton).toBeDisabled();
      
      // Type the confirmation text
      const confirmInput = screen.getByPlaceholderText('Type "deactivate" to confirm');
      fireEvent.change(confirmInput, { target: { value: 'deactivate' } });
      
      // Verify button is now enabled
      expect(confirmButton).not.toBeDisabled();
    });
    
    test('calls logout after successful account deactivation', async () => {
      const mockLogout = vi.fn();
      (useAuth as any).mockReturnValue({ 
        user: { 
          id: 1, 
          name: 'Test User', 
          email: 'test@example.com' 
        },
        logout: mockLogout,
      });
      
      // Mock API request
      (apiRequest as any).mockImplementation(() => Promise.resolve({ success: true }));
      
      render(<SettingsPage />);
      
      // Click the deactivate button to open dialog
      const deactivateButton = screen.getByText('Deactivate Account');
      fireEvent.click(deactivateButton);
      
      // Type the confirmation text
      await waitFor(() => {
        const confirmInput = screen.getByPlaceholderText('Type "deactivate" to confirm');
        fireEvent.change(confirmInput, { target: { value: 'deactivate' } });
      });
      
      // Click the confirm button
      const confirmButton = screen.getByText('Yes, deactivate my account');
      fireEvent.click(confirmButton);
      
      // Wait for the API call and logout
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith('DELETE', '/api/users');
        expect(mockLogout).toHaveBeenCalled();
      });
    });
    
    test('handles errors during account deactivation', async () => {
      // Mock API error
      (apiRequest as any).mockImplementation(() => Promise.reject(new Error('Deactivation failed')));
      
      const mockToast = vi.fn();
      (useToast as any).mockReturnValue({
        toast: mockToast,
      });
      
      render(<SettingsPage />);
      
      // Click the deactivate button to open dialog
      const deactivateButton = screen.getByText('Deactivate Account');
      fireEvent.click(deactivateButton);
      
      // Type the confirmation text
      await waitFor(() => {
        const confirmInput = screen.getByPlaceholderText('Type "deactivate" to confirm');
        fireEvent.change(confirmInput, { target: { value: 'deactivate' } });
      });
      
      // Click the confirm button
      const confirmButton = screen.getByText('Yes, deactivate my account');
      fireEvent.click(confirmButton);
      
      // Check for error toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: expect.stringContaining('Error'),
          description: expect.stringContaining('failed'),
          variant: 'destructive',
        });
      });
    });
  });
  
  describe('Accessibility Tests', () => {
    test('all form fields have accessible labels', () => {
      render(<SettingsPage />);
      
      // Check profile tab
      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');
      
      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      
      // Check security tab
      fireEvent.click(screen.getByRole('tab', { name: 'Security' }));
      
      const currentPasswordInput = screen.getByLabelText('Current Password');
      const newPasswordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
      
      expect(currentPasswordInput).toBeInTheDocument();
      expect(newPasswordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
      
      // Check appearance tab
      fireEvent.click(screen.getByRole('tab', { name: 'Appearance' }));
      
      const lightThemeInput = screen.getByLabelText('Light');
      const darkThemeInput = screen.getByLabelText('Dark');
      const systemThemeInput = screen.getByLabelText('System');
      
      expect(lightThemeInput).toBeInTheDocument();
      expect(darkThemeInput).toBeInTheDocument();
      expect(systemThemeInput).toBeInTheDocument();
    });
    
    test('tab navigation works correctly', () => {
      render(<SettingsPage />);
      
      // Test that we can tab through the form fields in the profile tab
      const nameInput = screen.getByLabelText('Full Name');
      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);
      
      // Tab to the next field
      fireEvent.keyDown(nameInput, { key: 'Tab', code: 'Tab' });
      
      // Email should now be focused
      const emailInput = screen.getByLabelText('Email Address');
      expect(document.activeElement).toBe(emailInput);
    });
  });
  
  describe('Responsive Design Tests', () => {
    test('mobile view optimizations are applied', () => {
      // Set mobile view
      (useIsMobile as any).mockReturnValue(true);
      
      render(<SettingsPage />);
      
      // Verify that mobile-specific classes are applied
      const tabsList = screen.getByRole('tablist');
      expect(tabsList).toHaveClass('grid-cols-2');
      
      // Buttons should be full width in mobile view
      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toHaveClass('w-full');
    });
  });
}); 