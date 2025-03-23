import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/financial-calculations";
import { 
  CalendarIcon, 
  LandmarkIcon, 
  WalletIcon, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  ShoppingBasket,
  Home,
  Coffee,
  Zap,
  Briefcase,
  PiggyBank,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { format } from "date-fns";

// Map categories to badge colors and icons
const categoryConfig: Record<string, {
  bg: string;
  text: string;
  border: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = {
  Essentials: { 
    bg: 'bg-blue-100', 
    text: 'text-blue-800', 
    border: 'border-blue-200',
    icon: Home
  },
  Income: { 
    bg: 'bg-green-100', 
    text: 'text-green-800', 
    border: 'border-green-200',
    icon: Briefcase 
  },
  Lifestyle: { 
    bg: 'bg-amber-100', 
    text: 'text-amber-800', 
    border: 'border-amber-200',
    icon: Coffee 
  },
  Savings: { 
    bg: 'bg-purple-100', 
    text: 'text-purple-800', 
    border: 'border-purple-200',
    icon: PiggyBank 
  },
};

// Map subcategories to icons
const subcategoryIcons = {
  Groceries: ShoppingBasket,
  Housing: Home,
  Utilities: Zap,
  "Dining Out": Coffee,
  // Add more subcategory mappings as needed
};

type TransactionWithUI = {
  id: number;
  date: string;
  formattedDate: string;
  description: string;
  amount: number;
  category: string;
  subcategory: string | null;
  paymentMethod: string | null;
  merchant: string;
};

export function RecentTransactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // Fetch transactions from API
  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Process transactions for UI display
  const processedTransactions: TransactionWithUI[] = transactions 
    ? transactions.map(transaction => {
        const date = new Date(transaction.date);
        const merchant = extractMerchant(transaction.description);
        
        return {
          id: transaction.id,
          date: transaction.date,
          formattedDate: format(date, 'dd MMM yyyy'),
          description: transaction.description,
          amount: parseFloat(transaction.amount),
          category: transaction.category,
          subcategory: transaction.subcategory,
          paymentMethod: transaction.paymentMethod,
          merchant: merchant || "Unknown",
        };
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
    : [];
  
  // Filter transactions based on search query and category filter
  const filteredTransactions = processedTransactions.filter(transaction => {
    const matchesSearch = searchQuery === "" || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.subcategory && transaction.subcategory.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = categoryFilter === "All" || transaction.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Helper function to extract merchant name from description
  function extractMerchant(description: string): string {
    // Common patterns in bank statements: "PAYMENT TO XXX", "PURCHASE AT XXX", etc.
    const patterns = [
      /PAYMENT TO (.+?)(?:\s+REF|\s*$)/i,
      /PURCHASE AT (.+?)(?:\s+ON|\s*$)/i,
      /(?:DEPOSIT|TRANSFER) FROM (.+?)(?:\s+REF|\s*$)/i,
      /(.+?)(?:\s+-|\s*$)/i,
    ];
    
    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // If no pattern matches, use the first 15 chars as the merchant name
    return description.substring(0, 15).trim();
  }
  
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-destructive">Failed to load transactions</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (processedTransactions.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
            <p className="text-muted-foreground mb-4">You haven't added any transactions yet.</p>
            <Link href="/income-expenses">
              <Button>
                Add Transactions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            Recent Transactions
            <Badge variant="outline" className="ml-2 text-xs font-normal">
              Last 30 days
            </Badge>
          </h3>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-8 h-9 text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select defaultValue="All" onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 w-[130px] sm:w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Essentials">Essentials</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                <SelectItem value="Savings">Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto -mx-5 px-5">
          {/* Desktop view */}
          <table className="w-full hidden md:table">
            <thead>
              <tr className="bg-muted/10 text-xs text-muted-foreground border-b border-border">
                <th className="text-left font-medium p-2 pl-4 rounded-l-md">Date</th>
                <th className="text-left font-medium p-2">Merchant</th>
                <th className="text-left font-medium p-2">Description</th>
                <th className="text-left font-medium p-2">Category</th>
                <th className="text-right font-medium p-2 pr-4 rounded-r-md">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-muted/5 cursor-pointer">
                  <td className="p-2 pl-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <CalendarIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground/70" />
                      {transaction.formattedDate}
                    </div>
                  </td>
                  <td className="p-2 text-sm">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-[10px] bg-muted">
                          {transaction.merchant.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{transaction.merchant}</span>
                    </div>
                  </td>
                  <td className="p-2 text-sm">{transaction.description}</td>
                  <td className="p-2 text-sm">
                    <Badge 
                      variant="outline"
                      className={`
                        ${categoryConfig[transaction.category]?.bg || 'bg-gray-100'} 
                        ${categoryConfig[transaction.category]?.text || 'text-gray-800'}
                        ${categoryConfig[transaction.category]?.border || 'border-gray-200'}
                      `}
                    >
                      <span className="flex items-center">
                        {(() => {
                          const Icon = categoryConfig[transaction.category]?.icon;
                          return Icon && <Icon className="h-3 w-3 mr-1" />;
                        })()}
                        {transaction.category}
                      </span>
                    </Badge>
                  </td>
                  <td className={`p-2 pr-4 text-sm font-medium text-right ${transaction.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                    <div className="flex items-center justify-end">
                      {transaction.amount >= 0 ? (
                        <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-success" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 mr-1 text-destructive" />
                      )}
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Mobile view */}
          <div className="md:hidden space-y-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-muted/5 rounded-md p-3 border border-border/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="text-[10px] bg-muted">
                        {transaction.merchant.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{transaction.merchant}</div>
                      <div className="text-xs text-muted-foreground">{transaction.description}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${transaction.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {transaction.formattedDate}
                  </div>
                  <Badge 
                    variant="outline"
                    className={`
                      ${categoryConfig[transaction.category]?.bg || 'bg-gray-100'} 
                      ${categoryConfig[transaction.category]?.text || 'text-gray-800'}
                      ${categoryConfig[transaction.category]?.border || 'border-gray-200'}
                      text-xs
                    `}
                  >
                    <span className="flex items-center">
                      {(() => {
                        const Icon = categoryConfig[transaction.category]?.icon;
                        return Icon && <Icon className="h-2.5 w-2.5 mr-1" />;
                      })()}
                      {transaction.category}
                    </span>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="py-10 text-center">
            <div className="text-sm text-muted-foreground">No transactions found</div>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("All");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-5 py-3 border-t flex justify-between">
        <div className="text-xs text-muted-foreground">
          Showing {filteredTransactions.length} of {processedTransactions.length} transactions
        </div>
        <Link href="/income-expense">
          <Button variant="link" size="sm" className="text-xs p-0 h-auto">
            View all transactions
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
