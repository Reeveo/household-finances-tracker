import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SettingsPage from '../pages/settings-page';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  })),
  useQueryClient: vi.fn(() => ({
    setQueryData: vi.fn(),
  })),
}));

vi.mock('@/components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({ 
      user: { 
        id: 1, 
        name: 'Test User', 
        email: 'test@example.com' 
      } 
    });
    
    (useToast as any).mockReturnValue({
      toast: vi.fn(),
    });
    
    (useIsMobile as any).mockReturnValue(false);
  });

  test('renders the settings page with all tabs', () => {
    render(<SettingsPage />);
    
    // Check page heading
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Check all tabs are rendered
    expect(screen.getByRole('tab', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Security' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Notifications' })).toBeInTheDocument();
    
    // Danger zone section should be visible
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    expect(screen.getByText('Deactivate Account')).toBeInTheDocument();
  });

  test('profile form should be pre-populated with user data', () => {
    render(<SettingsPage />);
    
    const nameInput = screen.getByLabelText('Full Name') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    
    expect(nameInput.value).toBe('Test User');
    expect(emailInput.value).toBe('test@example.com');
  });

  test('profile form should handle submission', async () => {
    const mockToast = vi.fn();
    (useToast as any).mockReturnValue({
      toast: mockToast,
    });
    
    const mockMutate = vi.fn();
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    
    render(<SettingsPage />);
    
    // Edit the name field
    const nameInput = screen.getByLabelText('Full Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    // Submit the form
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Check if mutation was called with correct data
    expect(mockMutate).toHaveBeenCalledWith({
      name: 'Updated Name',
      email: 'test@example.com',
    });
  });

  test('renders mobile-optimized view', () => {
    (useIsMobile as any).mockReturnValue(true);
    
    render(<SettingsPage />);
    
    // In mobile view, buttons should be full width
    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).toHaveClass('w-full');
    
    // TabsList should have mobile-friendly grid layout
    const tabsList = screen.getByRole('tablist');
    expect(tabsList).toHaveClass('grid-cols-2');
  });

  test('deactivation confirmation dialog works', async () => {
    render(<SettingsPage />);
    
    // Click the deactivate button to open dialog
    const deactivateButton = screen.getByText('Deactivate Account');
    fireEvent.click(deactivateButton);
    
    // Check if confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();
    });
    
    // Confirmation dialog should have cancel and confirm buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Yes, deactivate my account')).toBeInTheDocument();
    
    // Click cancel should close the dialog
    fireEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByText('Are you absolutely sure?')).not.toBeInTheDocument();
    });
  });
  
  test('appearance settings form works correctly', () => {
    render(<SettingsPage />);
    
    // Switch to appearance tab
    fireEvent.click(screen.getByRole('tab', { name: 'Appearance' }));
    
    // Check if theme options are present
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    
    // Check if toggle switches are present
    expect(screen.getByText('Animations')).toBeInTheDocument();
    expect(screen.getByText('Sound Effects')).toBeInTheDocument();
  });
  
  test('security form validates matching passwords', async () => {
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
});