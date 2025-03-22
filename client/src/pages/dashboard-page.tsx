import { Sidebar } from "@/components/layout/sidebar";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { MonthlySpendingChart } from "@/components/dashboard/monthly-spending-chart";
import { SavingsChart } from "@/components/dashboard/savings-chart";
import { NetWorthChart } from "@/components/dashboard/net-worth-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const lastUpdated = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted">Last updated: Today, {lastUpdated}</span>
              <Button variant="secondary" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <SummaryCards />

          {/* Main Dashboard Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlySpendingChart />
            <SavingsChart />
          </div>
          
          {/* Net Worth Trend */}
          <NetWorthChart />
          
          {/* Recent Transactions */}
          <RecentTransactions />
        </div>
      </main>
    </div>
  );
}
