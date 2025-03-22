import { Sidebar } from "@/components/layout/sidebar";
import { SavingsOverview } from "@/components/savings/savings-overview";
import { InvestmentPortfolio } from "@/components/savings/investment-portfolio";
import { GrowthProjections } from "@/components/savings/growth-projections";

export default function SavingsInvestmentsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Savings & Investment Tracker</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Savings Summary */}
            <div className="lg:col-span-1">
              <SavingsOverview />
            </div>
            
            {/* Investments Summary */}
            <div className="lg:col-span-2">
              <InvestmentPortfolio />
            </div>
          </div>
          
          {/* Growth Projections */}
          <GrowthProjections />
        </div>
      </main>
    </div>
  );
}
