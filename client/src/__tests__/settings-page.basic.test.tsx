import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import SettingsPage from '../pages/settings-page';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

describe('SettingsPage Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth hook
    (useAuth as any).mockReturnValue({ 
      user: { 
        id: 1, 
        name: 'Test User', 
        email: 'test@example.com' 
      },
      logout: vi.fn(),
      updateUser: vi.fn(),
    });
    
    // Mock toast hook
    (useToast as any).mockReturnValue({
      toast: vi.fn(),
    });
    
    // Default to desktop view
    (useIsMobile as any).mockReturnValue(false);
  });
  
  test('renders the settings page with tabs', () => {
    render(<SettingsPage />);
    
    // Verify sidebar is rendered
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
    // Verify page title
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Verify tabs exist
    expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /appearance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /notifications/i })).toBeInTheDocument();
  });
  
  test('profile form accepts input correctly', async () => {
    render(<SettingsPage />);
    
    // Get the input field and change it
    const nameInput = screen.getByLabelText(/full name/i);
    expect(nameInput).toBeInTheDocument();
    
    // Verify initial value
    expect(nameInput).toHaveValue('Test User');
    
    // Change the value
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } });
    expect(nameInput).toHaveValue('Changed Name');
  });
  
  test('renders in mobile view correctly', () => {
    // Set mobile view
    (useIsMobile as any).mockReturnValue(true);
    
    render(<SettingsPage />);
    
    // Verify mobile-specific classes are applied to the tab list
    const tabsList = screen.getByRole('tablist');
    expect(tabsList).toHaveClass('grid-cols-2');
  });
  
  test('danger zone section has deactivate account button', () => {
    render(<SettingsPage />);
    
    // Find the danger zone heading
    const dangerHeading = screen.getByText(/danger zone/i);
    expect(dangerHeading).toBeInTheDocument();
    
    // Find the deactivate account button
    const deactivateButton = screen.getByRole('button', { name: /deactivate account/i });
    expect(deactivateButton).toBeInTheDocument();
  });
}); 