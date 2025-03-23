import { Sidebar } from "@/components/layout/sidebar";
import { IncomeSourcesChart } from "@/components/income-expense/income-sources-chart";
import { ExpenseChart } from "@/components/income-expense/expense-chart";
import { BudgetTracking } from "@/components/income-expense/budget-tracking";
import { TransactionManagement } from "@/components/income-expense/transaction-management";
import { CategoryManagement } from "@/components/income-expense/category-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVImport } from "@/components/income-expense/csv-import";
import { useEffect } from "react";
import { initCategorizationEngine } from "@/lib/utils/categorization";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart } from "lucide-react";

export default function IncomeExpensePage() {
  // Initialize categorization engine when page loads
  useEffect(() => {
    initCategorizationEngine();
  }, []);
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Income & Expense Tracker</h1>
            <Link href="/transaction-analytics">
              <Button variant="outline" className="gap-2 hover:bg-muted">
                <BarChart className="h-4 w-4" />
                <span>Advanced Analytics</span>
              </Button>
            </Link>
          </div>
          
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-6 space-y-6">
              {/* Income & Expense Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IncomeSourcesChart />
                <ExpenseChart />
              </div>
              
              {/* Budget Tracking */}
              <BudgetTracking />
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-6">
              {/* Transaction Management */}
              <TransactionManagement />
            </TabsContent>
            
            <TabsContent value="categories" className="mt-6">
              {/* Category Management */}
              <CategoryManagement />
            </TabsContent>
            
            <TabsContent value="import" className="mt-6">
              {/* CSV Import */}
              <CSVImport />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
