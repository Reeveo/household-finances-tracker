import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

type MortgageOverpaymentCalculatorProps = {
  onCalculate: (data: OverpaymentData) => void;
};

export type OverpaymentData = {
  outstandingAmount: number;
  interestRate: number;
  remainingTerm: number;
  monthlyPayment: number;
  monthlyOverpayment: number;
  annualLumpSum: number;
  overpaymentOption: string;
  
  // Calculated results
  interestSaved: number;
  termReduction: string;
  originalEndDate: string;
  newEndDate: string;
  originalTotalPayments: number;
  newTotalPayments: number;
  originalTotalInterest: number;
  newTotalInterest: number;
};

export function MortgageOverpaymentCalculator({ onCalculate }: MortgageOverpaymentCalculatorProps) {
  const [outstandingAmount, setOutstandingAmount] = useState(200000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [remainingTerm, setRemainingTerm] = useState(20);
  const [monthlyPayment, setMonthlyPayment] = useState(1265.3);
  const [monthlyOverpayment, setMonthlyOverpayment] = useState(200);
  const [annualLumpSum, setAnnualLumpSum] = useState(1000);
  const [overpaymentOption, setOverpaymentOption] = useState("reduce-term");
  
  function calculateOverpaymentImpact() {
    // Calculate original amortization
    const monthlyInterestRate = interestRate / 100 / 12;
    const totalPayments = monthlyPayment * remainingTerm * 12;
    const totalInterest = totalPayments - outstandingAmount;
    
    // Calculate new term with overpayments
    const effectiveMonthlyPayment = monthlyPayment + monthlyOverpayment;
    const monthlyLumpSumEquivalent = annualLumpSum / 12;
    const totalMonthlyOverpayment = monthlyOverpayment + monthlyLumpSumEquivalent;
    
    // For reduce term calculation
    let balance = outstandingAmount;
    let monthsRemaining = remainingTerm * 12;
    let interestPaid = 0;
    let monthsReduced = 0;
    
    while (balance > 0 && monthsRemaining > 0) {
      const interestThisMonth = balance * monthlyInterestRate;
      interestPaid += interestThisMonth;
      
      let principalThisMonth = monthlyPayment - interestThisMonth;
      if (totalMonthlyOverpayment > 0) {
        principalThisMonth += totalMonthlyOverpayment;
      }
      
      balance -= principalThisMonth;
      monthsRemaining--;
      
      if (balance <= 0) {
        monthsReduced = remainingTerm * 12 - monthsRemaining;
      }
    }
    
    // Calculate interest saved
    const newTotalInterest = interestPaid;
    const interestSaved = totalInterest - newTotalInterest;
    const newTotalPayments = newTotalInterest + outstandingAmount;
    
    // Calculate term reduction
    const years = Math.floor(monthsReduced / 12);
    const months = monthsReduced % 12;
    const termReduction = `${years} years ${months} months`;
    
    // Calculate end dates
    const currentDate = new Date();
    const originalEndDate = new Date(currentDate);
    originalEndDate.setFullYear(originalEndDate.getFullYear() + remainingTerm);
    
    const newEndDate = new Date(currentDate);
    newEndDate.setMonth(newEndDate.getMonth() + (remainingTerm * 12 - monthsReduced));
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', {
        month: 'short',
        year: 'numeric'
      });
    };
    
    const results: OverpaymentData = {
      outstandingAmount,
      interestRate,
      remainingTerm,
      monthlyPayment,
      monthlyOverpayment,
      annualLumpSum,
      overpaymentOption,
      
      interestSaved,
      termReduction,
      originalEndDate: formatDate(originalEndDate),
      newEndDate: formatDate(newEndDate),
      originalTotalPayments: totalPayments,
      newTotalPayments,
      originalTotalInterest: totalInterest,
      newTotalInterest
    };
    
    onCalculate(results);
  }
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4">Calculate Overpayment Impact</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Current Mortgage Details</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input 
                  type="number" 
                  placeholder="Outstanding Amount (£)" 
                  value={outstandingAmount}
                  onChange={(e) => setOutstandingAmount(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Input 
                  type="number" 
                  placeholder="Interest Rate (%)" 
                  value={interestRate}
                  step="0.1"
                  onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Input 
                  type="number" 
                  placeholder="Remaining Term (Years)" 
                  value={remainingTerm}
                  onChange={(e) => setRemainingTerm(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Input 
                  type="number" 
                  placeholder="Monthly Payment (£)" 
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Overpayment Options</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input 
                  type="number" 
                  placeholder="Monthly Overpayment (£)" 
                  value={monthlyOverpayment}
                  onChange={(e) => setMonthlyOverpayment(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Input 
                  type="number" 
                  placeholder="Annual Lump Sum (£)" 
                  value={annualLumpSum}
                  onChange={(e) => setAnnualLumpSum(parseFloat(e.target.value))}
                />
              </div>
              <div className="col-span-2">
                <Select 
                  value={overpaymentOption}
                  onValueChange={setOverpaymentOption}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reduce-term">Reduce term</SelectItem>
                    <SelectItem value="reduce-payment">Reduce monthly payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={calculateOverpaymentImpact}
          >
            Calculate Savings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
