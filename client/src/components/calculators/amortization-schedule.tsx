import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { MortgageData } from "./mortgage-calculator";

type AmortizationScheduleProps = {
  mortgageData: MortgageData;
};

type YearlyData = {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
};

export function AmortizationSchedule({ mortgageData }: AmortizationScheduleProps) {
  const { 
    loanAmount, 
    interestRate, 
    loanTerm,
    monthlyPayment
  } = mortgageData;
  
  const [amortizationData, setAmortizationData] = useState<YearlyData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 5;
  
  useEffect(() => {
    calculateAmortizationSchedule();
  }, [mortgageData]);
  
  function calculateAmortizationSchedule() {
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    let balance = loanAmount;
    const yearlyData: YearlyData[] = [];
    
    for (let year = 1; year <= loanTerm; year++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      
      for (let month = 1; month <= 12; month++) {
        const interestPayment = balance * monthlyInterestRate;
        const principalPayment = monthlyPayment - interestPayment;
        
        yearPrincipal += principalPayment;
        yearInterest += interestPayment;
        balance -= principalPayment;
        
        if (balance < 0) balance = 0;
      }
      
      yearlyData.push({
        year,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        remainingBalance: balance
      });
    }
    
    setAmortizationData(yearlyData);
  }
  
  const totalPages = Math.ceil(amortizationData.length / rowsPerPage);
  const displayData = amortizationData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4">Amortization Schedule</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/10 text-sm text-muted border-b border-border">
                <th className="text-left font-medium p-2">Year</th>
                <th className="text-left font-medium p-2">Principal Paid</th>
                <th className="text-left font-medium p-2">Interest Paid</th>
                <th className="text-left font-medium p-2">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayData.map((row) => (
                <tr key={row.year}>
                  <td className="p-2 text-sm">{row.year}</td>
                  <td className="p-2 text-sm">£{Math.round(row.principalPaid).toLocaleString()}</td>
                  <td className="p-2 text-sm">£{Math.round(row.interestPaid).toLocaleString()}</td>
                  <td className="p-2 text-sm">£{Math.round(row.remainingBalance).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between mt-4">
          <Button 
            variant="link" 
            className="text-secondary p-0"
          >
            <Download className="h-4 w-4 mr-1" />
            Download Full Schedule
          </Button>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
