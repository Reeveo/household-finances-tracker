import { useState, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarIcon, Search, Plus, Filter, RefreshCcw, Edit, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

// Month options for budget assignment - dynamically generated
const getMonthOptions = () => {
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

const MONTHS = getMonthOptions();

// Transaction category options
const CATEGORIES = [
  'Essentials',
  'Lifestyle',
  'Savings',
  'Income'
];

// Sub-categories for different main categories
const SUB_CATEGORIES: Record<string, string[]> = {
  'Essentials': ['Rent/Mortgage', 'Utilities', 'Groceries', 'Transport', 'Insurance', 'Healthcare', 'Debt Repayment'],
  'Lifestyle': ['Dining Out', 'Entertainment', 'Shopping', 'Travel', 'Gifts', 'Subscriptions', 'Hobbies'],
  'Savings': ['Emergency Fund', 'Retirement', 'Investment', 'Property', 'Education', 'Future Goals'],
  'Income': ['Salary', 'Side Hustle', 'Investment Income', 'Rental Income', 'Benefits', 'Gifts Received', 'Tax Refund']
};

// Sample data for recent transactions
const transactions = [
  {
    id: 1,
    date: '2023-06-12',
    description: 'Groceries - Tesco',
    merchant: 'Tesco',
    merchantLogo: 'tesco.svg',
    category: 'Essentials',
    subcategory: 'Groceries',
    amount: -82.47,
    paymentMethod: 'Credit Card',
    isRecurring: false,
    budgetMonth: 'current',
    notes: '',
  },
  {
    id: 2,
    date: '2023-06-10',
    description: 'Monthly Salary',
    merchant: 'Acme Inc',
    merchantLogo: 'acme.svg',
    category: 'Income',
    subcategory: 'Salary',
    amount: 3850.00,
    paymentMethod: 'Bank Transfer',
    isRecurring: true,
    frequency: 'Monthly',
    budgetMonth: 'current',
    notes: 'Main job salary',
  },
  {
    id: 3,
    date: '2023-06-09',
    description: 'Coffee Shop',
    merchant: 'Costa Coffee',
    merchantLogo: 'costa.svg',
    category: 'Lifestyle',
    subcategory: 'Dining Out',
    amount: -4.85,
    paymentMethod: 'Debit Card',
    isRecurring: false,
    budgetMonth: 'current',
    notes: '',
  },
  {
    id: 4,
    date: '2023-06-07',
    description: 'Electricity Bill',
    merchant: 'British Gas',
    merchantLogo: 'britishgas.svg',
    category: 'Essentials',
    subcategory: 'Utilities',
    amount: -78.32,
    paymentMethod: 'Direct Debit',
    isRecurring: true,
    frequency: 'Monthly',
    budgetMonth: 'current',
    notes: 'Monthly electricity bill',
  },
  {
    id: 5,
    date: '2023-06-05',
    description: 'Investment Deposit',
    merchant: 'Vanguard',
    merchantLogo: 'vanguard.svg',
    category: 'Savings',
    subcategory: 'Investment',
    amount: -400.00,
    paymentMethod: 'Bank Transfer',
    isRecurring: true,
    frequency: 'Monthly',
    budgetMonth: 'current',
    notes: 'Monthly investment into index fund',
  },
  {
    id: 6,
    date: '2023-06-03',
    description: 'Mobile Phone Bill',
    merchant: 'Vodafone',
    merchantLogo: 'vodafone.svg',
    category: 'Essentials',
    subcategory: 'Utilities',
    amount: -35.99,
    paymentMethod: 'Direct Debit',
    isRecurring: true,
    frequency: 'Monthly',
    budgetMonth: 'current',
    notes: '',
  },
];

// Category styling config with icons and colors
const categoryConfig: Record<string, { color: string; bgColor: string }> = {
  'Essentials': { color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-100' },
  'Lifestyle': { color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-100' },
  'Savings': { color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-100' },
  'Income': { color: 'text-green-600', bgColor: 'bg-green-50 border-green-100' }
};

// Form validation schema for adding/editing transactions
const transactionSchema = z.object({
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

type TransactionFormValues = z.infer<typeof transactionSchema>;

type Transaction = {
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

export function TransactionManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>(transactions);

  // Form for adding/editing transactions
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      merchant: "",
      amount: 0,
      category: "",
      subcategory: "",
      paymentMethod: "Debit Card",
      isRecurring: false,
      hasEndDate: false,
      budgetMonth: "current",
      notes: "",
    }
  });

  // Reset form when dialog opens/closes
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingTransaction(null);
    }
    setShowAddDialog(open);
  };

  // Set form values when editing a transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    
    const formData: any = {
      description: transaction.description,
      merchant: transaction.merchant,
      date: new Date(transaction.date),
      amount: transaction.amount < 0 ? Math.abs(transaction.amount) : transaction.amount,
      category: transaction.category,
      subcategory: transaction.subcategory,
      paymentMethod: transaction.paymentMethod,
      isRecurring: transaction.isRecurring,
      frequency: transaction.frequency,
      hasEndDate: transaction.hasEndDate || false,
      budgetMonth: transaction.budgetMonth,
      notes: transaction.notes,
    };
    
    // Add endDate if it exists
    if (transaction.endDate) {
      formData.endDate = new Date(transaction.endDate);
    }
    
    form.reset(formData);
    setShowAddDialog(true);
  };

  // Handle form submission
  const onSubmit = (data: TransactionFormValues) => {
    // Format the amount (negative for expenses, positive for income)
    const formattedAmount = data.category === 'Income' 
      ? Math.abs(data.amount) 
      : -Math.abs(data.amount);

    if (editingTransaction) {
      // Update existing transaction
      const updatedTransactions = localTransactions.map(t => 
        t.id === editingTransaction.id 
          ? { 
              ...t, 
              description: data.description,
              merchant: data.merchant,
              date: data.date.toISOString().split('T')[0],
              amount: formattedAmount,
              category: data.category,
              subcategory: data.subcategory,
              paymentMethod: data.paymentMethod || 'Debit Card',
              isRecurring: data.isRecurring,
              frequency: data.isRecurring ? data.frequency : undefined,
              hasEndDate: data.isRecurring ? data.hasEndDate : false,
              endDate: (data.isRecurring && data.hasEndDate && data.endDate) 
                ? data.endDate.toISOString().split('T')[0] 
                : undefined,
              budgetMonth: data.budgetMonth,
              notes: data.notes || '',
            } 
          : t
      );
      setLocalTransactions(updatedTransactions);
    } else {
      // Add new transaction
      const newTransaction: Transaction = {
        id: Math.max(...localTransactions.map(t => t.id)) + 1,
        description: data.description,
        merchant: data.merchant,
        date: data.date.toISOString().split('T')[0],
        amount: formattedAmount,
        category: data.category,
        subcategory: data.subcategory,
        paymentMethod: data.paymentMethod || 'Debit Card',
        isRecurring: data.isRecurring,
        frequency: data.isRecurring ? data.frequency : undefined,
        hasEndDate: data.isRecurring ? data.hasEndDate : false,
        endDate: (data.isRecurring && data.hasEndDate && data.endDate) 
          ? data.endDate.toISOString().split('T')[0] 
          : undefined,
        merchantLogo: '',
        budgetMonth: data.budgetMonth,
        notes: data.notes || '',
      };
      setLocalTransactions([...localTransactions, newTransaction]);
    }

    // Close dialog and reset form
    handleDialogChange(false);
  };

  // Update subcategory options when category changes
  const watchedCategory = form.watch("category");
  const subcategoryOptions = watchedCategory ? SUB_CATEGORIES[watchedCategory] || [] : [];

  // Filter transactions based on search query, category filter, and month filter
  const filteredTransactions = useMemo(() => {
    return localTransactions.filter(transaction => {
      const matchesSearch = searchQuery === "" || 
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = categoryFilter === "All" || transaction.category === categoryFilter;
      const matchesMonth = monthFilter === "All" || transaction.budgetMonth === monthFilter;
      
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [localTransactions, searchQuery, categoryFilter, monthFilter]);

  // Get isMobile from useIsMobile hook
  const { isMobile } = useIsMobile ? useIsMobile() : { isMobile: false };

  return (
    <Card className="shadow-sm relative">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Transaction Management</CardTitle>
        <Button
          onClick={() => handleDialogChange(true)}
          className={`flex items-center ${isMobile ? 'fixed bottom-6 right-6 z-50 rounded-full shadow-lg w-12 h-12 p-0 justify-center' : ''}`}
          size={isMobile ? "icon" : "default"}
        >
          {isMobile ? (
            <Plus className="h-6 w-6" />
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </>
          )}
        </Button>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-5">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="relative flex-1 w-full sm:w-auto sm:max-w-md">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search transactions..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <div className="flex items-center">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  <span>
                    {categoryFilter === "All" ? "All Categories" : categoryFilter}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-2" />
                  <span>
                    {monthFilter === "All" ? "All Budget Months" : 
                      MONTHS.find(m => m.value === monthFilter)?.label || monthFilter}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Budget Months</SelectItem>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("All");
                setMonthFilter("All");
              }}
              className="flex-shrink-0"
            >
              <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-md border overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead className="whitespace-nowrap w-[100px]">Date</TableHead>
                  <TableHead className="whitespace-nowrap w-[150px]">Merchant</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="whitespace-nowrap w-[100px]">Category</TableHead>
                  <TableHead className="whitespace-nowrap w-[120px]">Budget Month</TableHead>
                  <TableHead className="whitespace-nowrap text-right w-[100px]">Amount</TableHead>
                  <TableHead className="text-right w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {transaction.merchant}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              {transaction.description}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{transaction.description}</p>
                            {transaction.notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Note: {transaction.notes}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`${categoryConfig[transaction.category].bgColor} ${categoryConfig[transaction.category].color}`}
                      >
                        {transaction.subcategory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {MONTHS.find(m => m.value === transaction.budgetMonth)?.label.split(' ')[0] || 'Current'} Month
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                        {transaction.amount < 0 ? '-' : ''}£{Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditTransaction(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p>No transactions found</p>
                        <Button 
                          variant="link" 
                          className="mt-2"
                          onClick={() => {
                            setSearchQuery("");
                            setCategoryFilter("All");
                            setMonthFilter("All");
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 py-3 border-t flex justify-between">
        <div className="text-xs text-muted-foreground">
          Showing {filteredTransactions.length} of {localTransactions.length} transactions
        </div>
        <div className="text-xs text-muted-foreground">
          {localTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)} spent this month
        </div>
      </CardFooter>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
            <DialogDescription>
              {editingTransaction 
                ? "Edit the details of this transaction." 
                : "Enter the details of the new transaction."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Basic Details */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (£)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Weekly grocery shopping" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="merchant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merchant</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Tesco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category and Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!watchedCategory}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subcategoryOptions.map((subcategory) => (
                            <SelectItem key={subcategory} value={subcategory}>
                              {subcategory}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget Month Selection */}
              <FormField
                control={form.control}
                name="budgetMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Month</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Assign this transaction to a specific budget month for tracking
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Recurring Transaction Options */}
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Recurring Transaction</FormLabel>
                      <FormDescription>
                        Check if this is a regular payment or income
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch('isRecurring') && (
                <>
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                            <SelectItem value="Annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hasEndDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Has End Date</FormLabel>
                          <FormDescription>
                            Specify if this recurring transaction has an end date
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch('hasEndDate') && (
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick an end date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}

              {/* Optional Details */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Debit Card">Debit Card</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Direct Debit">Direct Debit</SelectItem>
                        <SelectItem value="Standing Order">Standing Order</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Any additional details..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">
                  {editingTransaction ? "Save Changes" : "Add Transaction"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}