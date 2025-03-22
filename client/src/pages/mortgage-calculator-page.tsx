import { Sidebar } from "@/components/layout/sidebar";
import { MortgageCalculator, MortgageData } from "@/components/calculators/mortgage-calculator";
import { MortgageSummary } from "@/components/calculators/mortgage-summary";
import { AmortizationSchedule } from "@/components/calculators/amortization-schedule";
import { useState } from "react";

export default function MortgageCalculatorPage() {
  const [mortgageResults, setMortgageResults] = useState<MortgageData | null>(null);
  
  const handleCalculate = (data: MortgageData) => {
    setMortgageResults(data);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Mortgage Calculator</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mortgage Calculator Form */}
            <MortgageCalculator onCalculate={handleCalculate} />
            
            {/* Mortgage Results */}
            {mortgageResults && (
              <MortgageSummary mortgageData={mortgageResults} />
            )}
          </div>
          
          {/* Amortization Schedule */}
          {mortgageResults && (
            <AmortizationSchedule mortgageData={mortgageResults} />
          )}
        </div>
      </main>
    </div>
  );
}
