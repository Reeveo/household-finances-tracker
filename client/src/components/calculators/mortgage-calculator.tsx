import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type MortgageCalculatorProps = {
  onCalculate: (data: MortgageData) => void;
};

export type MortgageData = {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  startDate: string;
  monthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
  endDate: string;
};

export function MortgageCalculator({ onCalculate }: MortgageCalculatorProps) {
  const [loanAmount, setLoanAmount] = useState(250000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState(25);
  const [startDate, setStartDate] = useState(getFormattedDate(new Date()));
  
  function getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  function calculateMortgage() {
    // Calculate monthly payment
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    const x = Math.pow(1 + monthlyInterestRate, numberOfPayments);
    const monthlyPayment = (loanAmount * x * monthlyInterestRate) / (x - 1);
    
    // Calculate total interest paid
    const totalPayments = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayments - loanAmount;
    
    // Calculate end date
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setFullYear(endDateObj.getFullYear() + loanTerm);
    
    // Format end date as 'MMM YYYY'
    const endDateFormatted = endDateObj.toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    });
    
    const results: MortgageData = {
      loanAmount,
      interestRate,
      loanTerm,
      startDate,
      monthlyPayment,
      totalInterest,
      totalPayments,
      endDate: endDateFormatted
    };
    
    onCalculate(results);
  }
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4">Calculate Monthly Payments</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="mortgage-amount">Loan Amount (£)</Label>
            <Input 
              id="mortgage-amount" 
              type="number" 
              placeholder="e.g. 250000" 
              value={loanAmount}
              onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
            />
          </div>
          
          <div>
            <Label htmlFor="mortgage-interest">Interest Rate (%)</Label>
            <Input 
              id="mortgage-interest" 
              type="number" 
              placeholder="e.g. 4.5" 
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
            />
          </div>
          
          <div>
            <Label htmlFor="mortgage-term">Loan Term (Years)</Label>
            <Input 
              id="mortgage-term" 
              type="number" 
              placeholder="e.g. 25" 
              value={loanTerm}
              onChange={(e) => setLoanTerm(parseInt(e.target.value))}
            />
          </div>
          
          <div>
            <Label htmlFor="mortgage-start">Start Date</Label>
            <Input 
              id="mortgage-start" 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <Button 
            className="w-full"
            onClick={calculateMortgage}
          >
            Calculate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
