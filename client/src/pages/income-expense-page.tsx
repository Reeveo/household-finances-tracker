import { Sidebar } from "@/components/layout/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { initCategorizationEngine } from "@/lib/utils/categorization";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

// Import simplified components
import { IncomeSourcesChartSimple } from "@/components/income-expense/income-sources-chart-simple";
import { ExpenseChartSimple } from "@/components/income-expense/expense-chart-simple";
import { BudgetTrackingSimple } from "@/components/income-expense/budget-tracking-simple";
import { TransactionManagementSimple } from "@/components/income-expense/transaction-management-simple";
import { CategoryManagementSimple } from "@/components/income-expense/category-management-simple";
import { CSVImportSimple } from "@/components/income-expense/csv-import-simple";

export default function IncomeExpensePage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Initialize categorization engine when page loads
  useEffect(() => {
    initCategorizationEngine();
    
    // Check URL hash for tab selection
    const hash = window.location.hash.replace('#', '');
    if (['dashboard', 'transactions', 'categories', 'import'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);
  
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
    // Update URL hash for bookmarking
    window.location.hash = value;
  };

  // Handle errors from any tab component
  const handleTabError = (error: Error, info: React.ErrorInfo) => {
    console.error('Tab component error:', error, info);
  };
  
  // Simple tab content that's guaranteed to render
  const TabFallback = ({ name }: { name: string }) => (
    <div className="p-6 bg-white border rounded-md shadow-sm">
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        {name} Tab Content
      </h3>
      <p className="text-gray-600">
        We're having trouble displaying this content. Please try refreshing the page.
      </p>
    </div>
  );
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Income & Expense Tracker</h1>
            <Link to="/analytics">
              <Button 
                variant="outline" 
                className="gap-2 hover:bg-muted h-10 text-sm sm:text-base py-2 px-3 sm:py-2 sm:px-4 w-full sm:w-auto"
              >
                <BarChart className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Advanced Analytics</span>
              </Button>
            </Link>
          </div>
          
          {/* Simple buttons as a fallback */}
          <div className="md:hidden flex flex-wrap gap-2 mb-4">
            <Button 
              variant={activeTab === "dashboard" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleTabChange("dashboard")}
              className="flex-1"
            >
              Dashboard
            </Button>
            <Button 
              variant={activeTab === "transactions" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleTabChange("transactions")}
              className="flex-1"
            >
              Transactions
            </Button>
            <Button 
              variant={activeTab === "categories" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleTabChange("categories")}
              className="flex-1"
            >
              Categories
            </Button>
            <Button 
              variant={activeTab === "import" ? "primary" : "outline"}
              size="sm"
              onClick={() => handleTabChange("import")}
              className="flex-1"
            >
              Import
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-4 text-xs sm:text-sm hidden md:grid">
              <TabsTrigger 
                value="dashboard" 
                className="px-1 sm:px-3 py-1.5 h-9 sm:h-10"
                onClick={() => console.log("Dashboard tab clicked")}
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="px-1 sm:px-3 py-1.5 h-9 sm:h-10"
                onClick={() => console.log("Transactions tab clicked")}
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="px-1 sm:px-3 py-1.5 h-9 sm:h-10"
                onClick={() => console.log("Categories tab clicked")}
              >
                Categories
              </TabsTrigger>
              <TabsTrigger 
                value="import" 
                className="px-1 sm:px-3 py-1.5 h-9 sm:h-10"
                onClick={() => console.log("Import tab clicked")}
              >
                Import
              </TabsTrigger>
            </TabsList>
            
            {activeTab === "dashboard" && (
              <div className="mt-6 space-y-6">
                <ErrorBoundary 
                  onError={handleTabError}
                  fallback={<TabFallback name="Dashboard" />}
                >
                  {/* Income & Expense Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ErrorBoundary fallback={<div className="p-4 border rounded">Unable to load Income Sources chart</div>}>
                      <IncomeSourcesChartSimple />
                    </ErrorBoundary>
                    <ErrorBoundary fallback={<div className="p-4 border rounded">Unable to load Expense chart</div>}>
                      <ExpenseChartSimple />
                    </ErrorBoundary>
                  </div>
                  
                  {/* Budget Tracking */}
                  <ErrorBoundary fallback={<div className="p-4 border rounded">Unable to load Budget Tracking</div>}>
                    <BudgetTrackingSimple />
                  </ErrorBoundary>
                </ErrorBoundary>
              </div>
            )}
            
            {activeTab === "transactions" && (
              <div className="mt-6">
                <ErrorBoundary 
                  onError={handleTabError}
                  fallback={<TabFallback name="Transactions" />}
                >
                  <TransactionManagementSimple />
                </ErrorBoundary>
              </div>
            )}
            
            {activeTab === "categories" && (
              <div className="mt-6">
                <ErrorBoundary 
                  onError={handleTabError}
                  fallback={<TabFallback name="Categories" />}
                >
                  <CategoryManagementSimple />
                </ErrorBoundary>
              </div>
            )}
            
            {activeTab === "import" && (
              <div className="mt-6">
                <ErrorBoundary 
                  onError={handleTabError}
                  fallback={<TabFallback name="Import" />}
                >
                  <CSVImportSimple />
                </ErrorBoundary>
              </div>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
