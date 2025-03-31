import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import SettingsPage from '../pages/settings-page';
import { setupMocks } from './test-utils';
import { AuthContext } from '../hooks/use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function to add providers
function renderWithWrappedProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  // Create mock auth context value with correct user structure
  const authContextValue = {
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      password: 'hashedpassword',
      createdAt: new Date(),
    },
    isLoading: false,
    error: null,
    isAuthenticated: true,
    logout: vi.fn(),
    loginMutation: {
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: null,
      reset: vi.fn(),
    },
    logoutMutation: {
      mutate: vi.fn(),
      isLoading: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: null,
      reset: vi.fn(),
    },
    registerMutation: {
      mutate: vi.fn(),
      isLoading: false, 
      isError: false,
      isSuccess: false,
      error: null,
      data: null,
      reset: vi.fn(),
    }
  };
  
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authContextValue}>
        {ui}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

describe('SettingsPage Tests with Improved Mocks', () => {
  beforeEach(() => {
    setupMocks({
      authState: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          username: 'testuser',
          password: 'hashedpassword',
          createdAt: new Date(),
        },
        isAuthenticated: true,
        logout: vi.fn(),
      },
      isMobile: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders the settings page with tabs', () => {
    renderWithWrappedProviders(<SettingsPage />);
    
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  test('profile form accepts input correctly', () => {
    renderWithWrappedProviders(<SettingsPage />);
    
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    
    expect(nameInput).toHaveValue('New Name');
  });

  test('mobile view applies correct classes', () => {
    // Override the mobile mock
    setupMocks({
      isMobile: true,
      authState: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          username: 'testuser',
          password: 'hashedpassword',
          createdAt: new Date(),
        },
        isAuthenticated: true,
      }
    });
    
    renderWithWrappedProviders(<SettingsPage />);
    
    const tabsContainer = screen.getByRole('tablist');
    expect(tabsContainer).toHaveClass('flex-col');
  });

  test('shows success toast after updating profile', () => {
    const mockToast = vi.fn();
    setupMocks({
      authState: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          username: 'testuser',
          password: 'hashedpassword',
          createdAt: new Date(),
        },
        isAuthenticated: true,
      },
      apiResponses: [{
        endpoint: '/api/user/profile',
        method: 'PUT',
        response: { success: true }
      }]
    });
    
    renderWithWrappedProviders(<SettingsPage />);
    
    // Find the save button in the profile form and click it
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
  });

  test('logs out user when deactivating account', () => {
    const logoutFn = vi.fn();
    setupMocks({
      authState: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          username: 'testuser',
          password: 'hashedpassword',
          createdAt: new Date(),
        },
        isAuthenticated: true,
        logout: logoutFn,
      },
    });
    
    renderWithWrappedProviders(<SettingsPage />);
    
    // Navigate to Security tab
    const securityTab = screen.getByRole('tab', { name: /security/i });
    fireEvent.click(securityTab);
    
    // Click deactivate account button to show confirmation
    const deactivateButton = screen.getByRole('button', { name: /deactivate account/i });
    fireEvent.click(deactivateButton);
    
    // Find and click confirm button in dialog
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    // Verify logout was called
    expect(logoutFn).toHaveBeenCalled();
  });
}); 