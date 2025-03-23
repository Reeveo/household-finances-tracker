import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, FileText, Info, ArrowRight, Plus, Calendar } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ModalForm } from "@/components/common/modal-form";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample mock data to use for demonstration
const mockTransactions = [
  {
    id: 1,
    date: '2023-06-12',
    description: 'Groceries - Tesco',
    merchant: 'Tesco',
    category: 'Essentials',
    subcategory: 'Groceries',
    amount: -82.47,
    budgetMonth: 'current',
  },
  {
    id: 2,
    date: '2023-06-10',
    description: 'Monthly Salary',
    merchant: 'Acme Inc',
    category: 'Income',
    subcategory: 'Salary',
    amount: 3850.00,
    budgetMonth: 'current',
  },
  {
    id: 3,
    date: '2023-06-09',
    description: 'Coffee Shop',
    merchant: 'Costa Coffee',
    category: 'Lifestyle',
    subcategory: 'Dining Out',
    amount: -4.85,
    budgetMonth: 'current',
  },
  {
    id: 4,
    date: '2023-06-07',
    description: 'Electricity Bill',
    merchant: 'British Gas',
    category: 'Essentials',
    subcategory: 'Utilities',
    amount: -78.32,
    budgetMonth: 'current',
  },
  {
    id: 5,
    date: '2023-06-05',
    description: 'Investment Deposit',
    merchant: 'Vanguard',
    category: 'Savings',
    subcategory: 'Investment',
    amount: -400.00,
    budgetMonth: 'current',
  },
  {
    id: 6,
    date: '2023-06-03',
    description: 'Mobile Phone Bill',
    merchant: 'Vodafone',
    category: 'Essentials',
    subcategory: 'Utilities',
    amount: -35.99,
    budgetMonth: 'current',
  },
  {
    id: 7,
    date: '2023-07-05',
    description: 'Rent Payment',
    merchant: 'Landlord',
    category: 'Essentials',
    subcategory: 'Rent/Mortgage',
    amount: -1200.00,
    budgetMonth: 'next',
  },
  {
    id: 8,
    date: '2023-07-10',
    description: 'Expected Salary',
    merchant: 'Acme Inc',
    category: 'Income',
    subcategory: 'Salary',
    amount: 3850.00,
    budgetMonth: 'next',
  },
];

// Predefined budgets with mapping to transaction categories
const budgetCategories = {
  'Essentials': {
    subcategories: ['Rent/Mortgage', 'Utilities', 'Groceries', 'Transport', 'Insurance', 'Healthcare', 'Debt Repayment'],
    color: 'bg-blue-600',
  },
  'Lifestyle': {
    subcategories: ['Dining Out', 'Entertainment', 'Shopping', 'Travel', 'Gifts', 'Subscriptions', 'Hobbies'],
    color: 'bg-emerald-600',
  },
  'Savings': {
    subcategories: ['Emergency Fund', 'Retirement', 'Investment', 'Property', 'Education', 'Future Goals'],
    color: 'bg-purple-600',
  }
};

// Budget data by month
const budgetsByMonth = {
  'current': [
    { 
      category: "Essentials", 
      target: 1200, 
    },
    { 
      category: "Lifestyle", 
      target: 500, 
    },
    { 
      category: "Savings", 
      target: 500, 
    }
  ],
  'next': [
    { 
      category: "Essentials", 
      target: 1250, 
    },
    { 
      category: "Lifestyle", 
      target: 450, 
    },
    { 
      category: "Savings", 
      target: 600, 
    }
  ],
  'august': [
    { 
      category: "Essentials", 
      target: 1250, 
    },
    { 
      category: "Lifestyle", 
      target: 450, 
    },
    { 
      category: "Savings", 
      target: 600, 
    }
  ],
};

// Month mappings for display purposes
const MONTHS = [
  { value: "current", label: "Current Month (June 2023)" },
  { value: "next", label: "Next Month (July 2023)" },
  { value: "august", label: "August 2023" },
  { value: "september", label: "September 2023" },
  { value: "october", label: "October 2023" },
  { value: "november", label: "November 2023" },
  { value: "december", label: "December 2023" }
];

export function BudgetTracking() {
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTransactionsDialog, setShowTransactionsDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Calculate current spending for each budget category based on transactions
  const budgetData = useMemo(() => {
    const monthBudgets = budgetsByMonth[selectedMonth] || [];
    
    return monthBudgets.map(budget => {
      // Filter transactions for the selected month and category
      const categoryTransactions = mockTransactions.filter(
        t => t.budgetMonth === selectedMonth && t.category === budget.category && t.amount < 0
      );
      
      // Calculate total spending for this category
      const current = Math.abs(categoryTransactions.reduce((sum, t) => sum + t.amount, 0));
      
      // Calculate percentage and determine if over budget
      const percentage = (current / budget.target) * 100;
      const isOverBudget = current > budget.target;
      
      return {
        ...budget,
        current,
        percentage,
        isOverBudget,
        transactions: categoryTransactions
      };
    });
  }, [selectedMonth]);

  // Total budget and spending
  const totalBudget = budgetData.reduce((sum, item) => sum + item.target, 0);
  const totalSpent = budgetData.reduce((sum, item) => sum + item.current, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Show transactions for a specific category
  const handleShowTransactions = (category) => {
    setSelectedCategory(category);
    setShowTransactionsDialog(true);
  };

  // Update budget values when form is submitted
  const handleSubmitBudget = (data) => {
    console.log("Budget updated:", data);
    // Here you would update the budget data in a real app
    setIsModalOpen(false);
  };

  // Get transactions for the selected category
  const categoryTransactions = useMemo(() => {
    return mockTransactions.filter(
      t => t.budgetMonth === selectedMonth && t.category === selectedCategory && t.amount < 0
    );
  }, [selectedMonth, selectedCategory]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <CardTitle className="text-xl font-bold">Budget Tracking</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select Month" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-3">
        {/* Overall Budget Summary */}
        <div className="mb-6 p-4 border rounded-md bg-muted/20">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Overall Budget</h4>
            <div className="text-sm">
              <span>£{totalSpent.toFixed(2)}</span>
              <span className="mx-1 text-muted-foreground">/</span>
              <span>£{totalBudget.toFixed(2)}</span>
            </div>
          </div>
          <Progress 
            value={overallPercentage} 
            max={100}
            className="h-2.5 bg-gray-200"
            indicatorClassName={overallPercentage > 100 ? "bg-red-600" : "bg-green-600"}
          />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{overallPercentage.toFixed(0)}% of budget used</span>
            <span>
              {overallPercentage > 100 
                ? `£${(totalSpent - totalBudget).toFixed(2)} over budget` 
                : `£${(totalBudget - totalSpent).toFixed(2)} remaining`}
            </span>
          </div>
        </div>
        
        {/* Category Budgets */}
        <div className="space-y-6">
          {budgetData.map((item, idx) => (
            <div key={idx} className="border rounded-md p-4 hover:bg-muted/20 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${budgetCategories[item.category]?.color || 'bg-gray-500'}`}></div>
                  <h4 className="text-sm font-medium">{item.category}</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          {item.category === 'Essentials' && 'Necessary expenses like rent, utilities, groceries, and insurance.'}
                          {item.category === 'Lifestyle' && 'Discretionary spending on entertainment, dining out, shopping, and travel.'}
                          {item.category === 'Savings' && 'Money set aside for future goals, investments, and emergency funds.'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Badge 
                    variant="outline" 
                    className="ml-2 text-xs font-normal"
                  >
                    {item.transactions.length} transactions
                  </Badge>
                </div>
                <div className="text-sm">
                  <span>£{item.current.toFixed(2)}</span>
                  <span className="mx-1 text-muted-foreground">/</span>
                  <span>£{item.target.toFixed(2)}</span>
                </div>
              </div>
              
              <Progress 
                value={item.percentage} 
                max={100}
                className="h-2.5 bg-gray-200"
                indicatorClassName={item.isOverBudget ? "bg-red-600" : "bg-green-600"}
              />
              
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>{item.percentage.toFixed(0)}% of budget used</span>
                <span>
                  {item.isOverBudget 
                    ? `£${(item.current - item.target).toFixed(2)} over budget` 
                    : `£${(item.target - item.current).toFixed(2)} remaining`}
                </span>
              </div>
              
              <Button 
                variant="link" 
                size="sm" 
                className="mt-2 px-0 h-auto text-xs"
                onClick={() => handleShowTransactions(item.category)}
              >
                View transactions <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsModalOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Adjust Budget
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Future Planning
            </Button>
            <Button variant="default">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Adjust Budget Modal */}
        <ModalForm
          title="Adjust Budget"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fields={[
            { 
              name: "month", 
              label: "Month", 
              type: "select", 
              options: MONTHS.map(m => ({ value: m.value, label: m.label })),
              defaultValue: selectedMonth
            },
            { 
              name: "essentials", 
              label: "Essentials Budget (£)", 
              type: "number", 
              defaultValue: budgetData.find(b => b.category === "Essentials")?.target.toString() || "1200" 
            },
            { 
              name: "lifestyle", 
              label: "Lifestyle Budget (£)", 
              type: "number", 
              defaultValue: budgetData.find(b => b.category === "Lifestyle")?.target.toString() || "500" 
            },
            { 
              name: "savings", 
              label: "Savings Budget (£)", 
              type: "number", 
              defaultValue: budgetData.find(b => b.category === "Savings")?.target.toString() || "500" 
            }
          ]}
          onSubmit={handleSubmitBudget}
        />

        {/* Transactions Dialog */}
        <Dialog open={showTransactionsDialog} onOpenChange={setShowTransactionsDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCategory} Transactions</DialogTitle>
              <DialogDescription>
                Viewing transactions for {MONTHS.find(m => m.value === selectedMonth)?.label}
              </DialogDescription>
            </DialogHeader>
            
            <div className="rounded-md border overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Subcategory</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryTransactions.length > 0 ? (
                      categoryTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {transaction.subcategory}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            £{Math.abs(transaction.amount).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No transactions found for this category
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-muted-foreground">
                Total: £{categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}
              </span>
              <Button variant="outline" size="sm" onClick={() => setShowTransactionsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
