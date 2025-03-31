import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SettingsPage from '@/pages/settings-page';
import React from 'react';

// Create a simplified rendering function that doesn't rely on providers
const renderWithoutProviders = (ui: React.ReactElement) => {
  return render(ui);
};

// Mock the hooks
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      createdAt: new Date().toISOString(),
    },
    isLoading: false,
  }),
}));

// Mock the query hooks
vi.mock('@tanstack/react-query', () => {
  const mockMutate = vi.fn();
  return {
    useQuery: () => ({
      data: {},
      isLoading: false,
      isError: false,
    }),
    useMutation: () => ({
      mutate: mockMutate,
      isLoading: false,
      isError: false,
      isSuccess: false,
    }),
    useQueryClient: () => ({
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    }),
    QueryClient: vi.fn(),
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock the sidebar component
vi.mock('@/components/layout/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

// Basic test to verify rendering
describe('SettingsPage', () => {
  it('renders the settings page', () => {
    renderWithoutProviders(<SettingsPage />);
    
    // Check for sidebar
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    
    // Check for page title
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Check for tabs
    expect(screen.getByRole('tab', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Security' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Notifications' })).toBeInTheDocument();
    
    // Check for profile form elements when the page loads - using role instead of label
    // The form tab content should be present by default
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    
    // Check for danger zone section
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
  });
});