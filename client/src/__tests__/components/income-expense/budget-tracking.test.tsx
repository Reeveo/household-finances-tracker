import React from 'react';
import { screen, within, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest';
import { BudgetTracking } from '@/components/income-expense/budget-tracking';
import { renderWithClient } from '../../minimal-test-utils';

// Mock UI components to avoid rendering errors
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div data-testid="card-header" className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h2 data-testid="card-title" className={className}>{children}</h2>,
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className, size }: any) => (
    <button 
      data-testid="button" 
      data-variant={variant} 
      className={className} 
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value} onChange={(e: any) => onValueChange?.(e.target.value)}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className }: any) => <div data-testid="select-trigger" className={className}>{children}</div>,
  SelectValue: ({ children }: any) => <div data-testid="select-value">{children}</div>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <option data-testid={`select-item-${value}`} value={value}>{children}</option>,
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, max, className, indicatorClassName }: any) => (
    <div 
      data-testid="progress" 
      data-value={value} 
      data-max={max} 
      className={className}
      data-indicator-class={indicatorClassName}
    ></div>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: any) => <div data-testid="tooltip-provider">{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => <div data-testid="tooltip-trigger">{children}</div>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dialog" data-open={open} onChange={() => onOpenChange?.(!open)}>
      {open ? children : null}
    </div>
  ),
  DialogContent: ({ children, className }: any) => <div data-testid="dialog-content" className={className}>{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table data-testid="table">{children}</table>,
  TableHeader: ({ children, className }: any) => <thead data-testid="table-header" className={className}>{children}</thead>,
  TableBody: ({ children }: any) => <tbody data-testid="table-body">{children}</tbody>,
  TableRow: ({ children }: any) => <tr data-testid="table-row">{children}</tr>,
  TableHead: ({ children, className }: any) => <th data-testid="table-head" className={className}>{children}</th>,
  TableCell: ({ children, className, colSpan }: any) => <td data-testid="table-cell" className={className} colSpan={colSpan}>{children}</td>,
}));

vi.mock('@/components/common/modal-form', () => ({
  ModalForm: ({ title, isOpen, onClose, fields, onSubmit }: any) => (
    isOpen ? (
      <div data-testid="modal-form" data-title={title}>
        <div data-testid="modal-form-fields">
          {fields.map((field: any, idx: number) => (
            <div key={idx} data-field-name={field.name} data-field-type={field.type}>
              {field.label}
            </div>
          ))}
        </div>
        <div data-testid="modal-form-actions">
          <button onClick={() => onSubmit({ essentials: '1200', lifestyle: '500', savings: '500' })}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    ) : null
  )
}));

// Mock console.log to prevent noise in test output
const originalConsoleLog = console.log;
console.log = vi.fn();

describe('BudgetTracking Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Restore original console.log after tests
  afterAll(() => {
    console.log = originalConsoleLog;
  });

  it('renders the budget tracking component with title and budgets', async () => {
    renderWithClient(<BudgetTracking />);
    
    // Check that the component title is rendered
    expect(screen.getByText('Budget Tracking')).toBeInTheDocument();
    
    // Check for the overall budget section
    expect(screen.getByText('Overall Budget')).toBeInTheDocument();
    
    // Check that all budget categories are displayed
    expect(screen.getByText('Essentials')).toBeInTheDocument();
    expect(screen.getByText('Lifestyle')).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
  });

  it('shows correct budget values and percentages', async () => {
    renderWithClient(<BudgetTracking />);
    
    // Check that the budget amounts are displayed correctly
    expect(screen.getByText('£1200.00')).toBeInTheDocument();  // Essentials target
    
    // Use getAllByText for values that appear multiple times
    const lifestyleTargets = screen.getAllByText('£500.00');
    expect(lifestyleTargets.length).toBeGreaterThan(0);
    
    // Check that we have progress bars
    const progressBars = screen.getAllByTestId('progress');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('allows opening the adjust budget modal', async () => {
    const { user } = renderWithClient(<BudgetTracking />);
    
    // Find and click the adjust budget button
    const adjustBudgetButtons = screen.getAllByText('Adjust Budget');
    await user.click(adjustBudgetButtons[0]);
    
    // Check that the budget modal is displayed
    const modalForm = screen.getByTestId('modal-form');
    expect(modalForm).toBeInTheDocument();
    expect(modalForm).toHaveAttribute('data-title', 'Adjust Budget');
    
    // Check that the form fields are displayed
    const formFields = screen.getByTestId('modal-form-fields');
    expect(within(formFields).getByText('Essentials Budget (£)')).toBeInTheDocument();
    expect(within(formFields).getByText('Lifestyle Budget (£)')).toBeInTheDocument();
    expect(within(formFields).getByText('Savings Budget (£)')).toBeInTheDocument();
    
    // Close the modal
    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('modal-form')).not.toBeInTheDocument();
  });

  it('allows viewing transactions for a category', async () => {
    const { user } = renderWithClient(<BudgetTracking />);
    
    // Find and click the "View transactions" button for Essentials
    const viewTransactionsButtons = screen.getAllByText('View transactions');
    await user.click(viewTransactionsButtons[0]);
    
    // Check that the transactions dialog is displayed
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true');
    expect(screen.getByText('Essentials Transactions')).toBeInTheDocument();
    
    // Check that transaction data is in the table
    expect(screen.getByText('Groceries - Tesco')).toBeInTheDocument();
    expect(screen.getByText('Electricity Bill')).toBeInTheDocument();
    expect(screen.getByText('Mobile Phone Bill')).toBeInTheDocument();
    
    // Close the dialog
    await user.click(screen.getByText('Close'));
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'false');
  });

  it('submits the budget form with updated values', async () => {
    const { user } = renderWithClient(<BudgetTracking />);
    
    // Open the adjust budget modal
    const adjustBudgetButtons = screen.getAllByText('Adjust Budget');
    await user.click(adjustBudgetButtons[0]);
    
    // Submit the form
    await user.click(screen.getByText('Save'));
    
    // Check that console.log was called with the updated budget data
    expect(console.log).toHaveBeenCalledWith("Budget updated:", expect.anything());
  });
}); 