import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithClient } from './minimal-test-utils';

// A simple component for testing rendering
const SimpleComponent = () => <div data-testid="simple">Hello World</div>;

describe('Minimal Rendering Test', () => {
  it('renders a basic component with minimal renderWithClient', () => {
    // Render using our minimal renderWithClient function
    const { container } = renderWithClient(<SimpleComponent />);
    
    // Debug what's being rendered
    console.log('Minimal renderWithClient HTML:', container.innerHTML);
    
    // Check if component rendered
    expect(screen.getByTestId('simple')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
}); 