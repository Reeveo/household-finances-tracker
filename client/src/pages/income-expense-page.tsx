import { Sidebar } from "@/components/layout/sidebar";
import { IncomeSourcesChart } from "@/components/income-expense/income-sources-chart";
import { ExpenseChart } from "@/components/income-expense/expense-chart";
import { BudgetTracking } from "@/components/income-expense/budget-tracking";
import { TransactionManagement } from "@/components/income-expense/transaction-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVImport } from "@/components/income-expense/csv-import";

export default function IncomeExpensePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Income & Expense Tracker</h1>
          
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
