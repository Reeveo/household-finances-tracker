import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, describe, it } from 'vitest';

// Simple component with no dependencies
function SimpleComponent() {
  return <div data-testid="simple">Hello World</div>;
}

describe('Basic Rendering', () => {
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