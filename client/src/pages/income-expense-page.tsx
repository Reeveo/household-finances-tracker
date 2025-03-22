import { Sidebar } from "@/components/layout/sidebar";
import { IncomeSourcesChart } from "@/components/income-expense/income-sources-chart";
import { ExpenseChart } from "@/components/income-expense/expense-chart";
import { BudgetTracking } from "@/components/income-expense/budget-tracking";

export default function IncomeExpensePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Income & Expense Tracker</h1>
          
          {/* Income & Expense Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeSourcesChart />
            <ExpenseChart />
          </div>
          
          {/* Budget Tracking */}
          <BudgetTracking />
        </div>
      </main>
    </div>
  );
}
