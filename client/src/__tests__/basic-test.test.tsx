import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

// Define a simple component for testing
const SimpleComponent = () => {
  return <div data-testid="simple">Hello World</div>;
};

// Directly use render without any wrappers
describe('Basic Testing', () => {
  it('renders a simple component', () => {
    render(<SimpleComponent />);
    
    // Debug what's rendered
    screen.debug();
    
    // Check if component rendered
    const element = screen.getByTestId('simple');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Hello World');
  });
}); 