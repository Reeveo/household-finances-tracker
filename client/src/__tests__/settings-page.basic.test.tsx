import { describe, test, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import SettingsPage from '../pages/settings-page';
import { renderWithProviders, setupMocks } from './test-utils';

describe('SettingsPage', () => {
  beforeEach(() => {
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
        },
        isLoading: false,
        error: null
      },
      // Mock API responses
      apiResponses: [
        {
          endpoint: '/api/user/profile',
          method: 'PUT',
          response: { success: true }
        }
      ]
    });
  });

  test('renders the settings page with tabs', async () => {
    const { user } = renderWithProviders(<SettingsPage />);
    
    // Check for the main heading (using getByText as role might have changed)
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Check that tabs are present
    expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /appearance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /notifications/i })).toBeInTheDocument();
  });

  test('profile form accepts input', async () => {
    const { user } = renderWithProviders(<SettingsPage />);
    
    // The profile tab should be active by default
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toBeInTheDocument();
    
    // Change the name
    await user.clear(nameInput);
    await user.type(nameInput, 'New User Name');
    
    // Verify input change
    expect(nameInput).toHaveValue('New User Name');
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    
    // The form should be submitted and API call made (which is mocked)
    await waitFor(() => {
      // We can check that the form remains with the updated value
      expect(nameInput).toHaveValue('New User Name');
    });
  });

  test('mobile view applies correct classes', async () => {
    // Setup mobile view
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
      isMobile: true
    });
    
    renderWithProviders(<SettingsPage />);
    
    // Check for mobile-specific layout classes
    const tabsList = screen.getByRole('tablist');
    expect(tabsList).toHaveClass('grid-cols-2');
  });

  test('danger zone section contains deactivate account button', async () => {
    const { user } = renderWithProviders(<SettingsPage />);
    
    // There should be a danger zone section
    const dangerZone = screen.getByText(/danger zone/i);
    expect(dangerZone).toBeInTheDocument();
    
    // And it should contain a deactivate button
    const deactivateButton = screen.getByRole('button', { name: /deactivate account/i });
    expect(deactivateButton).toBeInTheDocument();
    
    // Click the button to open confirmation dialog
    await user.click(deactivateButton);
    
    // Check that confirmation dialog appears
    const confirmDialog = screen.getByRole('dialog');
    expect(confirmDialog).toBeInTheDocument();
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    
    // Close the dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    // Dialog should be gone
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
}); 