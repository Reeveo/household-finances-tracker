import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Calendar, RefreshCcw } from "lucide-react";
import { CATEGORIES, MONTHS } from './types';

interface TransactionFiltersProps {
  searchQuery: string;
  categoryFilter: string;
  monthFilter: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onReset: () => void;
}

export function TransactionFilters({
  searchQuery,
  categoryFilter,
  monthFilter,
  onSearchChange,
  onCategoryChange,
  onMonthChange,
  onReset,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:w-auto sm:max-w-md">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search transactions..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          data-testid="transaction-search"
        />
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-[150px]" data-testid="category-filter">
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
        
        {/* Month Filter */}
        <Select value={monthFilter} onValueChange={onMonthChange}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="month-filter">
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
        
        {/* Reset Button */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={onReset}
          className="flex-shrink-0"
          data-testid="reset-filters"
        >
          <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
          Reset
        </Button>
      </div>
    </div>
  );
} 