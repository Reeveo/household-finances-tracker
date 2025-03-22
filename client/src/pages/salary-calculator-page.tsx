import { Sidebar } from "@/components/layout/sidebar";
import { SalaryCalculator } from "@/components/calculators/salary-calculator";

export default function SalaryCalculatorPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">Salary Calculator</h1>
          
          {/* Salary Calculator */}
          <SalaryCalculator />
        </div>
      </main>
    </div>
  );
}