import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TransactionForm } from "@/components/income-expense/transaction-management/transaction-form";
import { CATEGORIES } from "@/components/income-expense/transaction-management/types";

// Mock Radix UI Select
vi.mock("@radix-ui/react-select", () => ({
  Root: vi.fn().mockImplementation(({ children, onValueChange, defaultValue, name }) => {
    const labels = {
      category: "Category",
      subcategory: "Subcategory",
      frequency: "Frequency",
      budgetMonth: "Budget Month"
    };
    return (
      <div 
        data-testid="select-root" 
        role="combobox"
        aria-expanded="false"
        aria-controls="radix-select-content"
        aria-label={labels[name as keyof typeof labels]}
        onClick={() => onValueChange && onValueChange(defaultValue)}
      >
        {children}
      </div>
    );
  }),
  Trigger: vi.fn().mockImplementation(({ children }) => (
    <div data-testid="select-trigger" role="button">
      {children}
    </div>
  )),
  Value: vi.fn().mockImplementation(({ children, placeholder }) => (
    <div data-testid="select-value">
      {children || placeholder}
    </div>
  )),
  Portal: vi.fn().mockImplementation(({ children }) => (
    <div data-testid="select-portal">
      {children}
    </div>
  )),
  Content: vi.fn().mockImplementation(({ children }) => (
    <div 
      data-testid="select-content"
      id="radix-select-content"
      role="listbox"
    >
      {children}
    </div>
  )),
  Viewport: vi.fn().mockImplementation(({ children }) => (
    <div data-testid="select-viewport">
      {children}
    </div>
  )),
  Item: vi.fn().mockImplementation(({ children, value }) => (
    <div 
      data-testid="select-item"
      role="option"
      aria-selected="false"
      data-value={value}
    >
      {children}
    </div>
  )),
  ItemText: vi.fn().mockImplementation(({ children }) => (
    <div data-testid="select-item-text">
      {children}
    </div>
  )),
  ItemIndicator: vi.fn().mockImplementation(({ children }) => (
    <div data-testid="select-item-indicator">
      {children}
    </div>
  )),
  Group: vi.fn().mockImplementation(({ children }) => (
    <div data-testid="select-group" role="group">
      {children}
    </div>
  )),
  Label: vi.fn().mockImplementation(({ children }) => (
    <div data-testid="select-label" role="presentation">
      {children}
    </div>
  )),
  Separator: vi.fn().mockImplementation(() => (
    <div data-testid="select-separator" role="separator" />
  )),
  ScrollUpButton: vi.fn().mockImplementation(() => (
    <div data-testid="select-scroll-up" role="button" />
  )),
  ScrollDownButton: vi.fn().mockImplementation(() => (
    <div data-testid="select-scroll-down" role="button" />
  )),
  Icon: vi.fn().mockImplementation(() => (
    <div data-testid="select-icon" role="presentation" />
  ))
}));

// Mock Radix UI Switch
vi.mock("@radix-ui/react-switch", () => ({
  Root: vi.fn().mockImplementation(({ checked, onCheckedChange, children }) => (
    <div 
      data-testid="switch-root"
      role="switch"
      aria-checked={checked}
      aria-label="Recurring Transaction"
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
    >
      {children}
    </div>
  )),
  Thumb: vi.fn().mockImplementation(() => (
    <div data-testid="switch-thumb" role="presentation" />
  ))
}));

describe("TransactionForm", () => {
  const user = userEvent.setup();
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<TransactionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/^description$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^merchant$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^date$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^amount$/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /category/i })).toBeInTheDocument(); // Use getByRole due to mock structure
    expect(screen.getByLabelText(/^subcategory$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^payment method$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^notes$/i)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /^recurring transaction$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save transaction/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("shows validation errors", async () => {
    render(<TransactionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole("button", { name: /save transaction/i }));

    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(screen.getByText(/merchant is required/i)).toBeInTheDocument();
    expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
    expect(screen.getByText(/category is required/i)).toBeInTheDocument();
  });

  it("handles form submission with valid data", async () => {
    render(<TransactionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText(/^description$/i), "Test Transaction");
    await user.type(screen.getByLabelText(/^merchant$/i), "Test Merchant");
    await user.type(screen.getByLabelText(/^amount$/i), "100");
    
    // Select category
    const categorySelect = screen.getByRole("combobox", { name: /category/i });
    await user.click(categorySelect);
    await user.click(screen.getByRole("option", { name: CATEGORIES[0] }));

    await user.click(screen.getByRole("button", { name: /save transaction/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      description: "Test Transaction",
      merchant: "Test Merchant",
      amount: 100,
      category: CATEGORIES[0],
    }));
  });

  it("shows end date field when frequency is selected", async () => {
    render(<TransactionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole("switch", { name: /^recurring transaction$/i }));
    
    const frequencySelect = screen.getByRole("combobox", { name: /frequency/i });
    await user.click(frequencySelect);
    await user.click(screen.getByRole("option", { name: "Weekly" }));

    expect(screen.getByRole("switch", { name: /^end date$/i })).toBeInTheDocument();
  });

  it("handles cancel button click", async () => {
    render(<TransactionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("populates form with initial values", () => {
    const initialValues = {
      description: "Initial Description",
      merchant: "Initial Merchant",
      amount: 50,
      category: CATEGORIES[0],
      paymentMethod: "Credit Card",
      notes: "Test notes",
    };

    render(
      <TransactionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        initialValues={initialValues}
      />
    );

    expect(screen.getByLabelText(/^description$/i)).toHaveValue("Initial Description");
    expect(screen.getByLabelText(/^merchant$/i)).toHaveValue("Initial Merchant");
    expect(screen.getByLabelText(/^amount$/i)).toHaveValue(50);
    expect(screen.getByLabelText(/^payment method$/i)).toHaveValue("Credit Card");
    expect(screen.getByLabelText(/^notes$/i)).toHaveValue("Test notes");
  });
}); 