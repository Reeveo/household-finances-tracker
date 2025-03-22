import { Sidebar } from "@/components/layout/sidebar";
import { MortgageOverpaymentCalculator, OverpaymentData } from "@/components/calculators/mortgage-overpayment-calculator";
import { MortgageOverpaymentResults } from "@/components/calculators/mortgage-overpayment-results";
import { OverpaymentAnalysis } from "@/components/calculators/overpayment-analysis";
import { useState } from "react";

export default function MortgageOverpaymentPage() {
  const [overpaymentResults, setOverpaymentResults] = useState<OverpaymentData | null>(null);
  
  const handleCalculate = (data: OverpaymentData) => {
    setOverpaymentResults(data);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Mortgage Overpayment Calculator</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overpayment Calculator Form */}
            <MortgageOverpaymentCalculator onCalculate={handleCalculate} />
            
            {/* Overpayment Results */}
            {overpaymentResults && (
              <MortgageOverpaymentResults overpaymentData={overpaymentResults} />
            )}
          </div>
          
          {/* Overpayment Details */}
          {overpaymentResults && (
            <OverpaymentAnalysis overpaymentData={overpaymentResults} />
          )}
        </div>
      </main>
    </div>
  );
}
