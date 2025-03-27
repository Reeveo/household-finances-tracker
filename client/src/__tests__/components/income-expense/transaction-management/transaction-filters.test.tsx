import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionFilters } from '@/components/income-expense/transaction-management/transaction-filters';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { MONTHS } from '@/components/income-expense/transaction-management/types';

// Mock the pointer capture API
beforeAll(() => {
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn();
});

describe('TransactionFilters', () => {
  const defaultProps = {
    searchQuery: '',
    categoryFilter: 'All',
    monthFilter: 'All',
    onSearchChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onMonthChange: vi.fn(),
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all filter components', () => {
    render(<TransactionFilters {...defaultProps} />);
    
    expect(screen.getByTestId('transaction-search')).toBeInTheDocument();
    expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    expect(screen.getByTestId('month-filter')).toBeInTheDocument();
    expect(screen.getByTestId('reset-filters')).toBeInTheDocument();
  });

  it('handles search input changes', () => {
    render(<TransactionFilters {...defaultProps} />);
    const searchInput = screen.getByTestId('transaction-search');
    
    // Simulate a change event with the new value
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Verify that onSearchChange was called with the new value
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test search');
  });

  it('handles category filter changes', async () => {
    render(<TransactionFilters {...defaultProps} />);
    const categoryFilter = screen.getByTestId('category-filter');
    
    fireEvent.click(categoryFilter);
    fireEvent.click(screen.getByRole('option', { name: 'Essentials' }));
    
    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('Essentials');
  });

  it('handles month filter changes', async () => {
    render(<TransactionFilters {...defaultProps} />);
    const monthFilter = screen.getByTestId('month-filter');
    
    fireEvent.click(monthFilter);
    // Use the first non-"All" option from MONTHS
    const firstMonth = MONTHS[0];
    fireEvent.click(screen.getByRole('option', { name: firstMonth.label }));
    
    expect(defaultProps.onMonthChange).toHaveBeenCalledWith(firstMonth.value);
  });

  it('handles reset button click', () => {
    render(<TransactionFilters {...defaultProps} />);
    const resetButton = screen.getByTestId('reset-filters');
    
    fireEvent.click(resetButton);
    expect(defaultProps.onReset).toHaveBeenCalled();
  });

  it('displays current filter values', () => {
    const currentMonth = MONTHS[0];
    const props = {
      ...defaultProps,
      searchQuery: 'test',
      categoryFilter: 'Essentials',
      monthFilter: currentMonth.value,
    };
    
    render(<TransactionFilters {...props} />);
    
    expect(screen.getByTestId('transaction-search')).toHaveValue('test');
    expect(screen.getByText('Essentials')).toBeInTheDocument();
    expect(screen.getByText(currentMonth.label)).toBeInTheDocument();
  });
}); 