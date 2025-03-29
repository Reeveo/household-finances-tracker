import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AuthPage from '../../AuthPage';
import { renderWithProviders } from './test-utils';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders the auth page with login form by default', () => {
    renderWithProviders(<AuthPage />);
    
    // Get tab buttons
    const tabButtons = screen.getAllByRole('button');
    const loginTab = tabButtons.find(button => 
      button.textContent === 'Login' && 
      !button.getAttribute('type')?.includes('submit')
    );
    const registerTab = tabButtons.find(button => 
      button.textContent === 'Register' && 
      !button.getAttribute('type')?.includes('submit')
    );
    
    expect(loginTab).toBeInTheDocument();
    expect(registerTab).toBeInTheDocument();
    
    // Login form should be active by default
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('switches to register tab when clicked', async () => {
    renderWithProviders(<AuthPage />);
    
    // Get the register tab and click it
    const tabButtons = screen.getAllByRole('button');
    const registerTab = tabButtons.find(button => 
      button.textContent === 'Register' && 
      !button.getAttribute('type')?.includes('submit')
    );
    
    if (!registerTab) {
      throw new Error('Register tab not found');
    }
    
    await act(async () => {
      fireEvent.click(registerTab);
    });
    
    // Check that registration form is now visible
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Choose a username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Choose a password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('handles login form submission', async () => {
    // Mock window.alert
    const alertMock = vi.fn();
    vi.stubGlobal('alert', alertMock);
    
    renderWithProviders(<AuthPage />);
    
    // Fill in the login form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Enter your username'), {
        target: { value: 'testuser' }
      });
      
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
        target: { value: 'password123' }
      });
    });
    
    // Submit the form and wait for the async function to complete
    await act(async () => {
      fireEvent.submit(screen.getByTestId('login-form'));
      // Wait for the simulated API call (1000ms delay)
      await new Promise(resolve => setTimeout(resolve, 1100));
    });
    
    // Check that alert was called and navigation happened
    expect(alertMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('handles registration form submission', async () => {
    // Mock window.alert
    const alertMock = vi.fn();
    vi.stubGlobal('alert', alertMock);
    
    renderWithProviders(<AuthPage />);
    
    // Switch to register tab
    const tabButtons = screen.getAllByRole('button');
    const registerTab = tabButtons.find(button => 
      button.textContent === 'Register' && 
      !button.getAttribute('type')?.includes('submit')
    );
    
    if (!registerTab) {
      throw new Error('Register tab not found');
    }
    
    await act(async () => {
      fireEvent.click(registerTab);
    });
    
    // Fill in the registration form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Choose a username'), {
        target: { value: 'testuser' }
      });
        
      fireEvent.change(screen.getByPlaceholderText('Choose a password'), {
        target: { value: 'password123' }
      });
        
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
        target: { value: 'test@example.com' }
      });
        
      fireEvent.change(screen.getByPlaceholderText('Enter your full name'), {
        target: { value: 'Test User' }
      });
    });
    
    // Submit the form and wait for the async function to complete
    await act(async () => {
      fireEvent.submit(screen.getByTestId('register-form'));
      // Wait for the simulated API call (1000ms delay)
      await new Promise(resolve => setTimeout(resolve, 1100));
    });
    
    // Check that alert was called and navigation happened
    expect(alertMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
}); 