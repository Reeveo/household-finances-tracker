import { Sidebar } from "@/components/layout/sidebar";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { MonthlySpendingChart } from "@/components/dashboard/monthly-spending-chart";
import { SavingsChart } from "@/components/dashboard/savings-chart";
import { NetWorthChart } from "@/components/dashboard/net-worth-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const lastUpdated = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-3 lg:p-6 overflow-y-auto">
        <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm text-muted-foreground">Last updated: Today, {lastUpdated}</span>
              <Button variant="secondary" size="sm" className="h-8 text-xs">
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <SummaryCards />

          {/* Main Dashboard Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
