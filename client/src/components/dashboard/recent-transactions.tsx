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
  PiggyBank
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

// Enhanced sample data with merchant logos and subcategories
const transactions = [
  {
    id: 1,
    date: '12 Jun 2023',
    description: 'Groceries - Tesco',
    merchant: 'Tesco',
    merchantLogo: 'tesco.svg',
    category: 'Essentials',
    subcategory: 'Groceries',
    amount: -82.47,
    paymentMethod: 'Credit Card',
    recurring: false,
  },
  {
    id: 2,
    date: '10 Jun 2023',
    description: 'Monthly Salary',
    merchant: 'Acme Inc',
    merchantLogo: 'acme.svg',
    category: 'Income',
    subcategory: 'Salary',
    amount: 3850.00,
    paymentMethod: 'Bank Transfer',
    recurring: true,
    frequency: 'Monthly',
  },
  {
    id: 3,
    date: '09 Jun 2023',
    description: 'Coffee Shop',
    merchant: 'Costa Coffee',
    merchantLogo: 'costa.svg',
    category: 'Lifestyle',
    subcategory: 'Dining Out',
    amount: -4.85,
    paymentMethod: 'Debit Card',
    recurring: false,
  },
  {
    id: 4,
    date: '07 Jun 2023',
    description: 'Electricity Bill',
    merchant: 'British Gas',
    merchantLogo: 'britishgas.svg',
    category: 'Essentials',
    subcategory: 'Utilities',
    amount: -78.32,
    paymentMethod: 'Direct Debit',
    recurring: true,
    frequency: 'Monthly',
  },
  {
    id: 5,
    date: '05 Jun 2023',
    description: 'Investment Deposit',
    merchant: 'Vanguard',
    merchantLogo: 'vanguard.svg',
    category: 'Savings',
    subcategory: 'Investments',
    amount: -400.00,
    paymentMethod: 'Bank Transfer',
    recurring: true,
    frequency: 'Monthly',
  },
  {
    id: 6,
    date: '03 Jun 2023',
    description: 'Rent Payment',
    merchant: 'Landlord',
    merchantLogo: '',
    category: 'Essentials',
    subcategory: 'Housing',
    amount: -1200.00,
    paymentMethod: 'Standing Order',
    recurring: true,
    frequency: 'Monthly',
  },
];

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

export function RecentTransactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // Filter transactions based on search query and category filter
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchQuery === "" || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = categoryFilter === "All" || transaction.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
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
                      {transaction.date}
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
                        ${categoryConfig[transaction.category].bg} 
                        ${categoryConfig[transaction.category].text}
                        ${categoryConfig[transaction.category].border}
                      `}
                    >
                      <span className="flex items-center">
                        {(() => {
                          const Icon = categoryConfig[transaction.category].icon;
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
                    {transaction.date}
                  </div>
                  <Badge 
                    variant="outline"
                    className={`
                      ${categoryConfig[transaction.category].bg} 
                      ${categoryConfig[transaction.category].text}
                      ${categoryConfig[transaction.category].border}
                      text-xs
                    `}
                  >
                    <span className="flex items-center">
                      {(() => {
                        const Icon = categoryConfig[transaction.category].icon;
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
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
        <Link href="/income-expenses">
          <Button variant="link" size="sm" className="text-xs p-0 h-auto">
            View all transactions
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
