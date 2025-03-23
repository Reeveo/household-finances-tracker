import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  CalendarIcon, 
  Filter, 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  ArrowUpDown,
  Download,
  Search,
  RefreshCw
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, subMonths, subWeeks, subYears, isWithinInterval, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SPENDING_CATEGORY_COLORS, CATEGORY_COLORS } from "@/lib/utils/chart-colors";
import { CATEGORIES, SUB_CATEGORIES } from "@/lib/utils/categorization";
import { formatCurrency } from "@/lib/utils/financial-calculations";

type Transaction = {
  id: number;
  userId: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  subcategory: string | null;
  merchant: string;
  isRecurring: boolean;
  budgetMonth: string;
};

type DateRange = {
  from: Date;
  to: Date;
};

type FilterState = {
  dateRange: DateRange;
  categories: string[];
  amountRange: [number, number];
  searchTerm: string;
  merchantFilter: string;
  isRecurring: boolean | null;
};

type CategoryTotals = {
  category: string;
  total: number;
  percentage: number;
  color: string;
};

type SubcategoryTotals = {
  subcategory: string;
  category: string;
  total: number;
  percentage: number;
  color: string;
};

type TimeSeriesData = {
  date: string;
  total: number;
  [key: string]: number | string;
};

type MerchantTotals = {
  merchant: string;
  count: number;
  total: number;
  average: number;
};

const DEFAULT_AMOUNT_RANGE: [number, number] = [0, 5000];
const DEFAULT_DATE_RANGE = {
  from: subMonths(new Date(), 3),
  to: new Date()
};

const PREDEFINED_RANGES = [
  { name: "Last 30 days", from: subMonths(new Date(), 1), to: new Date() },
  { name: "Last 90 days", from: subMonths(new Date(), 3), to: new Date() },
  { name: "Last 6 months", from: subMonths(new Date(), 6), to: new Date() },
  { name: "This year", from: new Date(new Date().getFullYear(), 0, 1), to: new Date() },
  { name: "Last year", from: subYears(new Date(), 1), to: new Date() },
];

export function TransactionAnalytics() {
  const isMobileState = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  const [filterOpen, setFilterOpen] = useState(false);
  const [chartType, setChartType] = useState("bar");
  
  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    dateRange: DEFAULT_DATE_RANGE,
    categories: [],
    amountRange: DEFAULT_AMOUNT_RANGE,
    searchTerm: "",
    merchantFilter: "",
    isRecurring: null,
  });

  // Fetch transactions data
  const { data: transactions, isLoading, isError, refetch } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  // Calculate max amount for range slider
  const maxAmount = useMemo(() => {
    if (!transactions || transactions.length === 0) return 5000;
    return Math.ceil(Math.max(...transactions.map(t => Math.abs(t.amount))) / 100) * 100;
  }, [transactions]);

  // Update amount range when max amount changes
  useEffect(() => {
    if (maxAmount > DEFAULT_AMOUNT_RANGE[1]) {
      setFilters(prev => ({...prev, amountRange: [prev.amountRange[0], maxAmount]}));
    }
  }, [maxAmount]);

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(transaction => {
      const txDate = new Date(transaction.date);
      const amount = Math.abs(transaction.amount);
      
      // Date range filter
      const dateInRange = isWithinInterval(txDate, {
        start: filters.dateRange.from,
        end: filters.dateRange.to
      });
      
      // Category filter
      const categoryMatch = filters.categories.length === 0 || 
        filters.categories.includes(transaction.category);
      
      // Amount range filter
      const amountInRange = amount >= filters.amountRange[0] && 
        amount <= filters.amountRange[1];
      
      // Search term filter
      const searchMatch = !filters.searchTerm || 
        transaction.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        transaction.merchant.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (transaction.subcategory && transaction.subcategory.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      // Merchant filter
      const merchantMatch = !filters.merchantFilter || 
        transaction.merchant.toLowerCase().includes(filters.merchantFilter.toLowerCase());
      
      // Recurring filter
      const recurringMatch = filters.isRecurring === null || 
        transaction.isRecurring === filters.isRecurring;
      
      return dateInRange && categoryMatch && amountInRange && searchMatch && 
        merchantMatch && recurringMatch;
    });
  }, [transactions, filters]);

  // Calculate expenses and income from filtered transactions
  const { expenses, income } = useMemo(() => {
    if (!filteredTransactions) return { expenses: 0, income: 0 };
    
    return filteredTransactions.reduce((acc, transaction) => {
      if (transaction.amount < 0) {
        acc.expenses += Math.abs(transaction.amount);
      } else {
        acc.income += Number(transaction.amount);
      }
      return acc;
    }, { expenses: 0, income: 0 });
  }, [filteredTransactions]);

  // Category totals
  const categoryTotals = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) return [];
    
    const expenseTransactions = filteredTransactions.filter(t => t.amount < 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totals = CATEGORIES.map((category, index) => {
      const categoryTransactions = expenseTransactions.filter(t => t.category === category);
      const total = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
      
      return {
        category,
        total,
        percentage,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
    
    return totals;
  }, [filteredTransactions]);

  // Subcategory totals
  const subcategoryTotals = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) return [];
    
    const expenseTransactions = filteredTransactions.filter(t => t.amount < 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const subcategories: Record<string, SubcategoryTotals> = {};
    
    expenseTransactions.forEach(transaction => {
      const key = `${transaction.category}-${transaction.subcategory || 'Other'}`;
      if (!subcategories[key]) {
        const categoryIndex = CATEGORIES.indexOf(transaction.category);
        subcategories[key] = {
          subcategory: transaction.subcategory || 'Other',
          category: transaction.category,
          total: 0,
          percentage: 0,
          color: CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length],
        };
      }
      subcategories[key].total += Math.abs(transaction.amount);
    });
    
    return Object.values(subcategories).map(subcat => ({
      ...subcat,
      percentage: totalExpenses > 0 ? (subcat.total / totalExpenses) * 100 : 0,
    })).sort((a, b) => b.total - a.total);
  }, [filteredTransactions]);

  // Time series data (by day/week/month)
  const getTimeSeriesData = (interval: 'day' | 'week' | 'month') => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      return [];
    }
    
    const dateFormat = interval === 'day' ? 'yyyy-MM-dd' :
      interval === 'week' ? "'Week' w, yyyy" : 'MMM yyyy';
    
    const dataByDate: Record<string, { date: string, total: number, [key: string]: number | string }> = {};
    
    filteredTransactions.forEach(transaction => {
      if (transaction.amount >= 0) return; // Skip income transactions
      
      const date = new Date(transaction.date);
      const formattedDate = format(date, dateFormat);
      
      if (!dataByDate[formattedDate]) {
        dataByDate[formattedDate] = {
          date: formattedDate,
          total: 0,
        };
        // Initialize all categories to 0
        CATEGORIES.forEach(category => {
          dataByDate[formattedDate][category] = 0;
        });
      }
      
      const amount = Math.abs(transaction.amount);
      dataByDate[formattedDate].total += amount;
      dataByDate[formattedDate][transaction.category] = 
        (dataByDate[formattedDate][transaction.category] as number || 0) + amount;
    });
    
    return Object.values(dataByDate).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  };

  // Get time series data based on chosen interval
  const timeSeriesData = useMemo(() => {
    const rangeStart = filters.dateRange.from;
    const rangeEnd = filters.dateRange.to;
    const diffDays = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 31) {
      return getTimeSeriesData('day');
    } else if (diffDays <= 120) {
      return getTimeSeriesData('week');
    } else {
      return getTimeSeriesData('month');
    }
  }, [filteredTransactions, filters.dateRange]);

  // Merchant data
  const merchantData = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) return [];
    
    const merchants: Record<string, MerchantTotals> = {};
    
    filteredTransactions.forEach(transaction => {
      if (transaction.amount >= 0) return; // Skip income transactions
      
      const { merchant } = transaction;
      if (!merchants[merchant]) {
        merchants[merchant] = {
          merchant,
          count: 0,
          total: 0,
          average: 0,
        };
      }
      
      merchants[merchant].count += 1;
      merchants[merchant].total += Math.abs(transaction.amount);
    });
    
    // Calculate average and sort by total
    return Object.values(merchants)
      .map(m => ({
        ...m,
        average: m.total / m.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 merchants
  }, [filteredTransactions]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: DEFAULT_DATE_RANGE,
      categories: [],
      amountRange: [0, maxAmount],
      searchTerm: "",
      merchantFilter: "",
      isRecurring: null,
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return;
    
    // Column headers
    const headers = [
      'Date', 'Merchant', 'Description', 'Category', 'Subcategory', 
      'Amount', 'Is Recurring', 'Budget Month'
    ];
    
    // Convert transactions to CSV rows
    const csvRows = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        `"${t.merchant.replace(/"/g, '""')}"`,
        `"${t.description.replace(/"/g, '""')}"`,
        t.category,
        t.subcategory || 'None',
        t.amount.toFixed(2),
        t.isRecurring ? 'Yes' : 'No',
        t.budgetMonth
      ].join(','))
    ];
    
    // Create a blob and download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'transaction_analytics.csv');
    link.click();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-3">
          <div className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" />
            <CardTitle>Transaction Analytics</CardTitle>
          </div>
          <div className="flex gap-2">
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                  {Object.values(filters).some(v => 
                    Array.isArray(v) ? v.length > 0 : v !== null && v !== "" && v !== DEFAULT_DATE_RANGE
                  ) && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1 rounded-full">
                      {filters.categories.length + 
                       (filters.searchTerm ? 1 : 0) + 
                       (filters.merchantFilter ? 1 : 0) + 
                       (filters.isRecurring !== null ? 1 : 0) + 
                       ((filters.amountRange[0] > 0 || 
                        filters.amountRange[1] < maxAmount) ? 1 : 0) +
                       ((filters.dateRange.from.getTime() !== DEFAULT_DATE_RANGE.from.getTime() ||
                        filters.dateRange.to.getTime() !== DEFAULT_DATE_RANGE.to.getTime()) ? 1 : 0)
                      }
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[340px] p-4">
                <div className="space-y-4">
                  <h4 className="font-medium mb-2">Filters</h4>
                  
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="flex flex-col gap-2">
                      <Select 
                        value={PREDEFINED_RANGES.findIndex(range => 
                          range.from.getTime() === filters.dateRange.from.getTime() && 
                          range.to.getTime() === filters.dateRange.to.getTime()
                        ) !== -1 ? 
                          PREDEFINED_RANGES.findIndex(range => 
                            range.from.getTime() === filters.dateRange.from.getTime() && 
                            range.to.getTime() === filters.dateRange.to.getTime()
                          ).toString() : 
                          "custom"
                        }
                        onValueChange={(value) => {
                          if (value === "custom") return;
                          const rangeIndex = parseInt(value);
                          handleFilterChange({
                            dateRange: {
                              from: PREDEFINED_RANGES[rangeIndex].from,
                              to: PREDEFINED_RANGES[rangeIndex].to
                            }
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a date range" />
                        </SelectTrigger>
                        <SelectContent>
                          {PREDEFINED_RANGES.map((range, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {range.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex gap-2">
                        <div className="grid gap-1.5 flex-1">
                          <Label htmlFor="from" className="text-xs">From</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="from"
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal text-sm h-8"
                              >
                                {format(filters.dateRange.from, "dd MMM yyyy")}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={filters.dateRange.from}
                                onSelect={(date) => date && handleFilterChange({
                                  dateRange: { ...filters.dateRange, from: date }
                                })}
                                disabled={(date) => date > filters.dateRange.to}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="grid gap-1.5 flex-1">
                          <Label htmlFor="to" className="text-xs">To</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="to"
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal text-sm h-8"
                              >
                                {format(filters.dateRange.to, "dd MMM yyyy")}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={filters.dateRange.to}
                                onSelect={(date) => date && handleFilterChange({
                                  dateRange: { ...filters.dateRange, to: date }
                                })}
                                disabled={(date) => date < filters.dateRange.from}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <Select 
                      value={filters.categories.length === 0 ? "all" : filters.categories.join(",")}
                      onValueChange={(value) => {
                        if (value === "all") {
                          handleFilterChange({ categories: [] });
                        } else {
                          handleFilterChange({ categories: value.split(",") });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Amount Range</Label>
                      <span className="text-xs text-muted-foreground">
                        £{filters.amountRange[0]} - £{filters.amountRange[1]}
                      </span>
                    </div>
                    <Slider
                      defaultValue={filters.amountRange}
                      value={filters.amountRange}
                      min={0}
                      max={maxAmount}
                      step={10}
                      onValueChange={(value) => handleFilterChange({ amountRange: value as [number, number] })}
                      className="py-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Search Term</Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          value={filters.searchTerm}
                          onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                          className="pl-7 h-8"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Merchant</Label>
                      <Input
                        placeholder="Filter by merchant"
                        value={filters.merchantFilter}
                        onChange={(e) => handleFilterChange({ merchantFilter: e.target.value })}
                        className="h-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Transaction Type</Label>
                    <Select 
                      value={filters.isRecurring === null ? "all" : filters.isRecurring ? "recurring" : "non-recurring"}
                      onValueChange={(value) => {
                        let isRecurring = null;
                        if (value === "recurring") isRecurring = true;
                        if (value === "non-recurring") isRecurring = false;
                        handleFilterChange({ isRecurring });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Transaction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Transactions</SelectItem>
                        <SelectItem value="recurring">Recurring Only</SelectItem>
                        <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                    <Button size="sm" onClick={() => setFilterOpen(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" size="sm" className="h-8" onClick={exportToCSV}>
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </div>
        </div>
        <CardDescription>
          Analyze your transaction patterns and identify spending trends
        </CardDescription>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="w-full grid grid-cols-3 sm:w-auto sm:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Spending Trends</TabsTrigger>
            <TabsTrigger value="merchants">Top Merchants</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="pb-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-2">Failed to load transaction data</p>
            <Button variant="outline" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-2">No transactions match the current filters</p>
            <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Transactions</div>
                  <div className="text-2xl font-bold">{filteredTransactions.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Spent</div>
                  <div className="text-2xl font-bold text-red-500">-£{expenses.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total Income</div>
                  <div className="text-2xl font-bold text-green-500">£{Number(income).toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Avg. Transaction</div>
                  <div className="text-2xl font-bold">£{
                    (filteredTransactions.filter(t => t.amount < 0).length > 0) ? 
                      (expenses / filteredTransactions.filter(t => t.amount < 0).length).toFixed(2) : 
                      (0).toFixed(2)
                  }</div>
                </CardContent>
              </Card>
            </div>

            {/* Tab content */}
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Category Distribution</CardTitle>
                      <div className="flex space-x-1">
                        <Button 
                          variant={chartType === "pie" ? "secondary" : "ghost"} 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => setChartType("pie")}
                        >
                          <PieChartIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant={chartType === "bar" ? "secondary" : "ghost"} 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => setChartType("bar")}
                        >
                          <BarChartIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === "pie" ? (
                          <PieChart>
                            <Pie
                              data={categoryTotals}
                              dataKey="total"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              outerRadius={isMobileState ? 80 : 100}
                              label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                              labelLine={true}
                            >
                              {categoryTotals.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [`£${value.toFixed(2)}`, 'Amount']}
                            />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                          </PieChart>
                        ) : (
                          <BarChart
                            data={categoryTotals}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" tickFormatter={(value) => `£${value}`} />
                            <YAxis type="category" dataKey="category" width={60} />
                            <Tooltip formatter={(value: number) => [`£${value.toFixed(2)}`, 'Amount']} />
                            <Bar dataKey="total" fill="#8884d8">
                              {categoryTotals.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Subcategory breakdown */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Top Subcategories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={subcategoryTotals.slice(0, 10)}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 95, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" tickFormatter={(value) => `£${value}`} />
                          <YAxis
                            type="category"
                            dataKey="subcategory"
                            width={90}
                            tick={({ x, y, payload }) => (
                              <g transform={`translate(${x},${y})`}>
                                <text
                                  x={-5}
                                  y={0}
                                  dy={4}
                                  textAnchor="end"
                                  fill="#666"
                                  fontSize={12}
                                >
                                  {payload.value}
                                </text>
                              </g>
                            )}
                          />
                          <Tooltip
                            formatter={(value: number) => [`£${value.toFixed(2)}`, 'Amount']}
                            labelFormatter={(label) => {
                              const item = subcategoryTotals.find(sc => sc.subcategory === label);
                              return item ? `${label} (${item.category})` : label;
                            }}
                          />
                          <Bar dataKey="total" fill="#8884d8">
                            {subcategoryTotals.slice(0, 10).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-0">
              <div className="space-y-6">
                {/* Spending Over Time */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Spending Over Time</CardTitle>
                      <Select
                        value={chartType}
                        onValueChange={setChartType}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Chart Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="line">Line Chart</SelectItem>
                          <SelectItem value="area">Area Chart</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {(() => {
                          if (chartType === "bar") {
                            return (
                              <BarChart
                                data={timeSeriesData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="date"
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                  tick={{ fontSize: 12 }}
                                />
                                <YAxis tickFormatter={(value) => `£${value}`} />
                                <Tooltip formatter={(value: number) => [`£${value.toFixed(2)}`, 'Amount']} />
                                <Legend />
                                {CATEGORIES.filter(category => 
                                  timeSeriesData.some(d => (d[category] as number) > 0)
                                ).map((category, index) => (
                                  <Bar
                                    key={category}
                                    dataKey={category}
                                    stackId="a"
                                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                                  />
                                ))}
                              </BarChart>
                            );
                          } else if (chartType === "line") {
                            return (
                              <LineChart
                                data={timeSeriesData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="date"
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                  tick={{ fontSize: 12 }}
                                />
                                <YAxis tickFormatter={(value) => `£${value}`} />
                                <Tooltip formatter={(value: number) => [`£${value.toFixed(2)}`, 'Amount']} />
                                <Legend />
                                {CATEGORIES.filter(category => 
                                  timeSeriesData.some(d => (d[category] as number) > 0)
                                ).map((category, index) => (
                                  <Line
                                    key={category}
                                    type="monotone"
                                    dataKey={category}
                                    stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                                    activeDot={{ r: 8 }}
                                  />
                                ))}
                              </LineChart>
                            );
                          } else {
                            return (
                              <AreaChart
                                data={timeSeriesData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="date"
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                  tick={{ fontSize: 12 }}
                                />
                                <YAxis tickFormatter={(value) => `£${value}`} />
                                <Tooltip formatter={(value: number) => [`£${value.toFixed(2)}`, 'Amount']} />
                                <Legend />
                                {CATEGORIES.filter(category => 
                                  timeSeriesData.some(d => (d[category] as number) > 0)
                                ).map((category, index) => (
                                  <Area
                                    key={category}
                                    type="monotone"
                                    dataKey={category}
                                    stackId="1"
                                    stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                                    fillOpacity={0.6}
                                  />
                                ))}
                              </AreaChart>
                            );
                          }
                        })()}
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Recurring vs One-time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Recurring vs One-time Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "Recurring",
                                  value: filteredTransactions
                                    .filter(t => t.amount < 0 && t.isRecurring)
                                    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                                },
                                {
                                  name: "One-time",
                                  value: filteredTransactions
                                    .filter(t => t.amount < 0 && !t.isRecurring)
                                    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                                }
                              ]}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              <Cell fill="#8884d8" />
                              <Cell fill="#82ca9d" />
                            </Pie>
                            <Tooltip formatter={(value: number) => [`£${value.toFixed(2)}`, 'Amount']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Spending Heatmap</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-8">
                        <p className="text-muted-foreground mb-3">
                          Enhanced spending heatmap by day and hour coming soon
                        </p>
                        <button className="text-primary text-sm underline">
                          Request this feature
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="merchants" className="mt-0">
              <div className="space-y-6">
                {/* Top Merchants */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Top Merchants by Spend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={merchantData}
                          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" tickFormatter={(value) => `£${value}`} />
                          <YAxis 
                            type="category" 
                            dataKey="merchant" 
                            width={95}
                            tick={({ x, y, payload }) => (
                              <g transform={`translate(${x},${y})`}>
                                <text
                                  x={-5}
                                  y={0}
                                  dy={4}
                                  textAnchor="end"
                                  fill="#666"
                                  fontSize={12}
                                >
                                  {payload.value}
                                </text>
                              </g>
                            )}
                          />
                          <Tooltip
                            formatter={(value: number) => [`£${value.toFixed(2)}`, 'Total Spend']}
                            labelFormatter={(label) => {
                              const item = merchantData.find(m => m.merchant === label);
                              return item ? `${label} (${item.count} transactions)` : label;
                            }}
                          />
                          <Bar dataKey="total" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Merchant Table */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Merchant Details</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Showing top {merchantData.length} merchants
                        </span>
                        <Button variant="outline" size="sm" className="h-8">
                          <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                          Sort
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="font-medium text-left p-2 pl-4">Merchant</th>
                            <th className="font-medium text-right p-2">Transactions</th>
                            <th className="font-medium text-right p-2">Avg. Amount</th>
                            <th className="font-medium text-right p-2 pr-4">Total Spend</th>
                          </tr>
                        </thead>
                        <tbody>
                          {merchantData.map((merchant) => (
                            <tr key={merchant.merchant} className="border-t hover:bg-muted/50">
                              <td className="p-2 pl-4">{merchant.merchant}</td>
                              <td className="p-2 text-right">{merchant.count}</td>
                              <td className="p-2 text-right">£{merchant.average.toFixed(2)}</td>
                              <td className="p-2 pr-4 text-right font-medium">£{merchant.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </>
        )}
      </CardContent>
      
      <CardFooter className="border-t px-5 py-3">
        <div className="flex flex-col sm:flex-row justify-between w-full gap-2 sm:gap-0">
          <div className="text-xs text-muted-foreground">
            {filteredTransactions?.length} transactions · {format(filters.dateRange.from, "d MMM yyyy")} - {format(filters.dateRange.to, "d MMM yyyy")}
          </div>
          <div className="text-xs">
            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => refetch()}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Data
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}