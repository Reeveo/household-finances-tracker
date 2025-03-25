import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotFound from '../pages/not-found';

describe('NotFound Page', () => {
  it('renders the 404 page correctly', () => {
    render(<NotFound />);
    
    // Check for proper heading
    expect(screen.getByText('404 Page Not Found')).toBeInTheDocument();
    
    // Check for helpful message
    expect(screen.getByText('Did you forget to add the page to the router?')).toBeInTheDocument();
    
    // Check for alert icon
    expect(screen.getByTestId(/alert-circle/i)).toBeInTheDocument();
  });
  
  it('has proper styling for error messaging', () => {
    render(<NotFound />);
    
    // Check if alert icon has the error color
    const alertIcon = screen.getByTestId(/alert-circle/i);
    expect(alertIcon).toHaveClass('text-red-500');
    
    // Check if the page is centered
    const container = screen.getByTestId(/card/i).parentElement;
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
  });
}); 