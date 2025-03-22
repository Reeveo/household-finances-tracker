import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type PensionCalculatorProps = {
  onCalculate: (data: PensionData) => void;
};

export type PensionData = {
  currentAge: number;
  retirementAge: number;
  currentPension: number;
  annualReturn: number;
  monthlyContribution: number;
  employerContribution: number;
  desiredIncome: number;
  
  // Calculated results
  estimatedPensionPot: number;
  estimatedAnnualIncome: number;
  isOnTrack: boolean;
  yearsToRetirement: number;
  potAt65: number;
  incomeAt65: number;
  potAt70: number;
  incomeAt70: number;
};

export function PensionCalculator({ onCalculate }: PensionCalculatorProps) {
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(67);
  const [currentPension, setCurrentPension] = useState(45000);
  const [annualReturn, setAnnualReturn] = useState(5);
  const [monthlyContribution, setMonthlyContribution] = useState(400);
  const [employerContribution, setEmployerContribution] = useState(200);
  const [desiredIncome, setDesiredIncome] = useState(25000);
  
  function calculateProjection() {
    const yearsToRetirement = retirementAge - currentAge;
    const totalMonthlyContribution = monthlyContribution + employerContribution;
    const monthlyRate = annualReturn / 100 / 12;
    
    // Calculate future value of current pension
    let pensionPot = currentPension * Math.pow(1 + annualReturn / 100, yearsToRetirement);
    
    // Add future value of monthly contributions
    for (let year = 0; year < yearsToRetirement; year++) {
      for (let month = 0; month < 12; month++) {
        pensionPot += totalMonthlyContribution;
        pensionPot *= (1 + monthlyRate);
      }
    }
    
    // Calculate theoretical income (using 4% safe withdrawal rate)
    const annualIncome = pensionPot * 0.04;
    
    // Calculate values for specific retirement ages
    const calculatePotAtAge = (age: number) => {
      const years = age - currentAge;
      let pot = currentPension * Math.pow(1 + annualReturn / 100, years);
      
      for (let year = 0; year < years; year++) {
        for (let month = 0; month < 12; month++) {
          pot += totalMonthlyContribution;
          pot *= (1 + monthlyRate);
        }
      }
      
      return pot;
    };
    
    const potAt65 = calculatePotAtAge(65);
    const incomeAt65 = potAt65 * 0.04;
    
    const potAt70 = calculatePotAtAge(70);
    const incomeAt70 = potAt70 * 0.04;
    
    const results: PensionData = {
      currentAge,
      retirementAge,
      currentPension,
      annualReturn,
      monthlyContribution,
      employerContribution,
      desiredIncome,
      
      estimatedPensionPot: Math.round(pensionPot),
      estimatedAnnualIncome: Math.round(annualIncome),
      isOnTrack: annualIncome >= desiredIncome,
      yearsToRetirement,
      potAt65: Math.round(potAt65),
      incomeAt65: Math.round(incomeAt65),
      potAt70: Math.round(potAt70),
      incomeAt70: Math.round(incomeAt70)
    };
    
    onCalculate(results);
  }
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4">Calculate Retirement Savings</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Personal Details</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input 
                  type="number" 
                  placeholder="Current Age" 
                  value={currentAge}
                  onChange={(e) => setCurrentAge(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Input 
                  type="number" 
                  placeholder="Planned Retirement Age" 
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Current Pension</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input 
                  type="number" 
                  placeholder="Current Value (£)" 
                  value={currentPension}
                  onChange={(e) => setCurrentPension(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Input 
                  type="number" 
                  placeholder="Annual Return (%)" 
                  value={annualReturn}
                  step="0.1"
                  onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Monthly Contributions</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input 
                  type="number" 
                  placeholder="Your Contribution (£)" 
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Input 
                  type="number" 
                  placeholder="Employer Contribution (£)" 
                  value={employerContribution}
                  onChange={(e) => setEmployerContribution(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Retirement Goals</Label>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Input 
                  type="number" 
                  placeholder="Desired Annual Income (£)" 
                  value={desiredIncome}
                  onChange={(e) => setDesiredIncome(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={calculateProjection}
          >
            Calculate Projection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
