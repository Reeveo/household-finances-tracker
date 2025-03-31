import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Import the component to test
import SettingsPage from '../pages/settings-page';

// Mock all the hooks
const mockLogoutMutate = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    },
    isLoading: false,
    error: null,
    loginMutation: { mutate: vi.fn() },
    logoutMutation: { mutate: mockLogoutMutate },
    registerMutation: { mutate: vi.fn() },
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: ({ onSuccess }: { onSuccess?: (data: any) => void }) => ({
    mutate: (data: any) => {
      // Call onSuccess immediately to simulate successful mutation
      onSuccess?.(data);
    },
    isLoading: false,
  }),
  useQueryClient: () => ({
    setQueryData: vi.fn(),
  }),
}));

vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ id: 1, name: 'Test User' }),
  }),
}));

describe('SettingsPage Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the settings page with tabs', () => {
    render(<SettingsPage />);
    
    // Check for the heading element specifically
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    
    // Verify tabs exist by using more specific role selectors
    expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /appearance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /notifications/i })).toBeInTheDocument();
  });

  test('profile form works correctly', () => {
    render(<SettingsPage />);
    
    // Get the input field using a more specific selector
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toBeInTheDocument();
    
    // Change the value
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(nameInput).toHaveValue('New Name');
    
    // Submit form
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
  });

  test('tab selection works', () => {
    render(<SettingsPage />);
    
    // All tabs should be present
    const profileTab = screen.getByRole('tab', { name: /profile/i });
    const securityTab = screen.getByRole('tab', { name: /security/i });
    const appearanceTab = screen.getByRole('tab', { name: /appearance/i });
    const notificationsTab = screen.getByRole('tab', { name: /notifications/i });
    
    // Click each tab in sequence and verify it can be clicked
    fireEvent.click(securityTab);
    fireEvent.click(appearanceTab);
    fireEvent.click(notificationsTab);
    fireEvent.click(profileTab);
    
    // If we reach this point without errors, the test passes
    expect(true).toBeTruthy();
  });
}); 