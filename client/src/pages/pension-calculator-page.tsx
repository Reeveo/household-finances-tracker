import { Sidebar } from "@/components/layout/sidebar";
import { PensionCalculator, PensionData } from "@/components/calculators/pension-calculator";
import { PensionResults } from "@/components/calculators/pension-results";
import { RetirementAnalysis } from "@/components/calculators/retirement-analysis";
import { useState } from "react";

export default function PensionCalculatorPage() {
  const [pensionResults, setPensionResults] = useState<PensionData | null>(null);
  
  const handleCalculate = (data: PensionData) => {
    setPensionResults(data);
  };
  
  const handleRecalculate = (updates: Partial<PensionData>) => {
    if (pensionResults) {
      const updatedData = {
        ...pensionResults,
        ...updates
      };
      handleCalculate(updatedData);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Pension Calculator</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pension Calculator Form */}
            <PensionCalculator onCalculate={handleCalculate} />
            
            {/* Pension Results */}
            {pensionResults && (
              <PensionResults pensionData={pensionResults} />
            )}
          </div>
          
          {/* Retirement Analysis */}
          {pensionResults && (
            <RetirementAnalysis 
              pensionData={pensionResults}
              onRecalculate={handleRecalculate}
            />
          )}
        </div>
      </main>
    </div>
  );
}
