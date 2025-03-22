// User Types
export type User = {
  id: number;
  username: string;
  name?: string;
  email?: string;
  createdAt: Date;
};

// Transaction Types
export type TransactionCategory = 'Essentials' | 'Lifestyle' | 'Savings' | 'Income';

export type Transaction = {
  id: number;
  userId: number;
  date: Date;
  description: string;
  amount: number;
  category: TransactionCategory;
  subcategory?: string;
};

// Budget Types
export type BudgetCategory = {
  category: string;
  current: number;
  target: number;
  percentage: number;
  isOverBudget: boolean;
};

export type MonthlyBudget = {
  month: number;
  year: number;
  categories: BudgetCategory[];
};

// Savings and Investment Types
export type SavingsGoal = {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  percentage: number;
};

export type InvestmentPortfolioItem = {
  name: string;
  value: number;
  percentage: number;
};

export type InvestmentPerformance = {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  annualReturn: number;
};

// Financial Calculator Types
export type MortgageCalculation = {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
};

export type OverpaymentCalculation = {
  standardBalance: number;
  overpaymentBalance: number;
  interestSaved: number;
  termReduction: number;
};

export type PensionProjection = {
  currentAge: number;
  retirementAge: number;
  estimatedPensionPot: number;
  estimatedAnnualIncome: number;
  isOnTrack: boolean;
};

// Dashboard Summary Types
export type FinancialSummary = {
  income: {
    amount: number;
    change: number;
  };
  expenses: {
    amount: number;
    change: number;
  };
  savings: {
    amount: number;
    change: number;
  };
  netWorth: {
    amount: number;
    change: number;
  };
};

// Chart Data Types
export type ChartDataPoint = {
  label: string;
  value: number;
};

export type TimeSeriesDataPoint = {
  date: string;
  value: number;
};

export type CategoryBreakdownData = {
  category: string;
  value: number;
  color: string;
};
