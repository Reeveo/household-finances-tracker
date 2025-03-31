import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

// Define a simple component for testing
const SimpleComponent = () => {
  return <div data-testid="simple">Hello World</div>;
};

// Define a simple wrapper component
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="wrapper">{children}</div>;
};

// Custom render function with wrapper
const renderWithWrapper = (ui: React.ReactElement) => {
  return render(ui, { wrapper: Wrapper });
};

describe('Wrapper Testing', () => {
  it('renders a simple component directly', () => {
    render(<SimpleComponent />);
    
    // Debug what's rendered
    screen.debug();
    
    // Check if component rendered
    const element = screen.getByTestId('simple');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Hello World');
  });

  it('renders a simple component with wrapper', () => {
    renderWithWrapper(<SimpleComponent />);
    
    // Debug what's rendered
    screen.debug();
    
    // Check if wrapper rendered
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper).toBeInTheDocument();
    
    // Check if component rendered inside wrapper
    const element = screen.getByTestId('simple');
    expect(element).toBeInTheDocument();
    expect(element.textContent).toBe('Hello World');
  });
}); 