import { z } from "zod";

// Month options for budget assignment - dynamically generated
export const getMonthOptions = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Current and next month options
  const options = [
    { 
      value: "current", 
      label: `Current Month (${monthNames[currentMonth]} ${currentYear})` 
    },
    { 
      value: "next", 
      label: `Next Month (${monthNames[(currentMonth + 1) % 12]} ${currentMonth === 11 ? currentYear + 1 : currentYear})` 
    }
  ];
  
  // Add next 5 months
  for (let i = 2; i < 7; i++) {
    const futureMonth = (currentMonth + i) % 12;
    const futureYear = currentYear + Math.floor((currentMonth + i) / 12);
    options.push({
      value: monthNames[futureMonth].toLowerCase(),
      label: `${monthNames[futureMonth]} ${futureYear}`
    });
  }
  
  return options;
};

export const MONTHS = getMonthOptions();

// Transaction category options
export const CATEGORIES = [
  'Essentials',
  'Lifestyle',
  'Savings',
  'Income'
] as const;

// Sub-categories for different main categories
export const SUB_CATEGORIES: Record<string, string[]> = {
  'Essentials': ['Rent/Mortgage', 'Utilities', 'Groceries', 'Transport', 'Insurance', 'Healthcare', 'Debt Repayment'],
  'Lifestyle': ['Dining Out', 'Entertainment', 'Shopping', 'Travel', 'Gifts', 'Subscriptions', 'Hobbies'],
  'Savings': ['Emergency Fund', 'Retirement', 'Investment', 'Property', 'Education', 'Future Goals'],
  'Income': ['Salary', 'Side Hustle', 'Investment Income', 'Rental Income', 'Benefits', 'Gifts Received', 'Tax Refund']
};

// Category styling config with icons and colors
export const categoryConfig: Record<string, { color: string; bgColor: string }> = {
  'Essentials': { color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-100' },
  'Lifestyle': { color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-100' },
  'Savings': { color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-100' },
  'Income': { color: 'text-green-600', bgColor: 'bg-green-50 border-green-100' }
};

// Form validation schema
export const transactionSchema = z.object({
  description: z.string().min(2, { message: "Description is required" }),
  merchant: z.string().min(1, { message: "Merchant is required" }),
  date: z.date({ required_error: "Date is required" }),
  amount: z.coerce.number()
    .refine(val => val !== 0, { message: "Amount cannot be zero" }),
  category: z.string().min(1, { message: "Category is required" }),
  subcategory: z.string().min(1, { message: "Subcategory is required" }),
  paymentMethod: z.string().optional(),
  isRecurring: z.boolean().default(false),
  frequency: z.string().optional(),
  hasEndDate: z.boolean().default(false),
  endDate: z.date().optional(),
  budgetMonth: z.string().min(1, { message: "Budget month is required" }),
  notes: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export type Transaction = {
  id: number;
  date: string;
  description: string;
  merchant: string;
  merchantLogo?: string;
  category: string;
  subcategory: string;
  amount: number;
  paymentMethod: string;
  isRecurring: boolean;
  frequency?: string;
  hasEndDate?: boolean;
  endDate?: string;
  budgetMonth: string;
  notes: string;
}; 