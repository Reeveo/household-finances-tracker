import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Info, PoundSterling } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type MortgageCalculatorProps = {
  onCalculate: (data: MortgageData) => void;
};

export type MortgageData = {
  loanAmount: number;
  propertyValue: number;
  interestRate: number;
  loanTerm: number;
  startDate: string;
  monthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
  endDate: string;
  mortgageType: string;
  repaymentType: string;
  ltv: number; // Loan to Value ratio
  initialPeriod: number; // Initial fixed/discount rate period
  initialRate: number; // Initial interest rate
  svr: number; // Standard Variable Rate after initial period
};

// UK-specific mortgage types
const MORTGAGE_TYPES = [
  { value: "fixed", label: "Fixed Rate" },
  { value: "variable", label: "Variable Rate" },
  { value: "tracker", label: "Tracker" },
  { value: "discount", label: "Discount" },
  { value: "offset", label: "Offset" }
];

// Fixed rate periods
const FIXED_PERIODS = [
  { value: "2", label: "2 Year Fixed" },
  { value: "3", label: "3 Year Fixed" },
  { value: "5", label: "5 Year Fixed" },
  { value: "10", label: "10 Year Fixed" }
];

export function MortgageCalculator({ onCalculate }: MortgageCalculatorProps) {
  // Basic mortgage details
  const [propertyValue, setPropertyValue] = useState(300000);
  const [loanAmount, setLoanAmount] = useState(240000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState(25);
  const [startDate, setStartDate] = useState(getFormattedDate(new Date()));
  
  // Advanced mortgage options
  const [mortgageType, setMortgageType] = useState("fixed");
  const [repaymentType, setRepaymentType] = useState("repayment");
  const [initialPeriod, setInitialPeriod] = useState(5);
  const [initialRate, setInitialRate] = useState(4.0);
  const [svr, setSvr] = useState(5.5);
  const [calculateInitialRate, setCalculateInitialRate] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState("basic");
  const [showLtvWarning, setShowLtvWarning] = useState(false);

  // Calculate LTV (Loan to Value) ratio
  const ltv = (loanAmount / propertyValue) * 100;

  // Check LTV and show warning if over 90%
  useEffect(() => {
    setShowLtvWarning(ltv > 90);
  }, [loanAmount, propertyValue, ltv]);

  // Update loan amount when property value changes (maintaining the same LTV)
  useEffect(() => {
    if (propertyValue > 0) {
      const newLoanAmount = Math.round((ltv / 100) * propertyValue);
      if (!isNaN(newLoanAmount) && isFinite(newLoanAmount)) {
        setLoanAmount(newLoanAmount);
      }
    }
  }, [propertyValue]);

  function getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  function calculateMortgage() {
    // Calculate monthly payment
    let effectiveRate = interestRate;
    
    if (calculateInitialRate && mortgageType === "fixed") {
      // Weighted average rate calculation for the entire term
      const initialMonths = initialPeriod * 12;
      const remainingMonths = (loanTerm * 12) - initialMonths;
      effectiveRate = ((initialRate * initialMonths) + (svr * remainingMonths)) / (loanTerm * 12);
    }
    
    const monthlyInterestRate = effectiveRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    // For interest-only mortgages, monthly payment is just the interest
    let monthlyPayment;
    let totalPayments;
    
    if (repaymentType === "interest-only") {
      monthlyPayment = loanAmount * monthlyInterestRate;
      totalPayments = (monthlyPayment * numberOfPayments) + loanAmount; // Add principal at the end
    } else {
      // Standard repayment formula
      const x = Math.pow(1 + monthlyInterestRate, numberOfPayments);
      monthlyPayment = (loanAmount * x * monthlyInterestRate) / (x - 1);
      totalPayments = monthlyPayment * numberOfPayments;
    }
    
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
      propertyValue,
      interestRate: effectiveRate,
      loanTerm,
      startDate,
      monthlyPayment,
      totalInterest,
      totalPayments,
      endDate: endDateFormatted,
      mortgageType,
      repaymentType,
      ltv,
      initialPeriod,
      initialRate,
      svr
    };
    
    onCalculate(results);
  }
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4">Calculate Monthly Payments</h3>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="property-value">Property Value (£)</Label>
              <Input 
                id="property-value" 
                type="number" 
                placeholder="e.g. 300000" 
                value={propertyValue}
                onChange={(e) => setPropertyValue(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="mortgage-amount">Loan Amount (£)</Label>
                <span className="text-xs text-muted-foreground">
                  LTV: <span className={ltv > 90 ? "text-red-500 font-semibold" : ""}>{ltv.toFixed(1)}%</span>
                </span>
              </div>
              <Input 
                id="mortgage-amount" 
                type="number" 
                placeholder="e.g. 240000" 
                value={loanAmount}
                onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                className={showLtvWarning ? "border-red-500" : ""}
              />
              {showLtvWarning && (
                <p className="text-xs text-red-500 mt-1">
                  High LTV mortgages typically have higher interest rates and may require additional insurance.
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="repayment-type">Repayment Type</Label>
              <Select
                value={repaymentType}
                onValueChange={setRepaymentType}
              >
                <SelectTrigger id="repayment-type">
                  <SelectValue placeholder="Select repayment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repayment">Capital Repayment</SelectItem>
                  <SelectItem value="interest-only">Interest Only</SelectItem>
                  <SelectItem value="part-and-part">Part & Part</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="mortgage-interest">Interest Rate (%)</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input 
                    id="mortgage-interest" 
                    type="number" 
                    placeholder="e.g. 4.5" 
                    step="0.01"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-10 w-10">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Current typical rates: 4.0-5.5% for 2-year fixes, 3.8-5.25% for 5-year fixes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div>
              <Label htmlFor="mortgage-term">Loan Term (Years)</Label>
              <div className="pt-2 pb-6">
                <Slider
                  id="mortgage-term"
                  min={5}
                  max={37} // Extended to 37 years
                  step={1}
                  value={[loanTerm]}
                  onValueChange={(value) => setLoanTerm(value[0])}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 years</span>
                <span>{loanTerm} years</span>
                <span>37 years</span>
              </div>
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
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="mortgage-type">Mortgage Type</Label>
              <Select
                value={mortgageType}
                onValueChange={setMortgageType}
              >
                <SelectTrigger id="mortgage-type">
                  <SelectValue placeholder="Select mortgage type" />
                </SelectTrigger>
                <SelectContent>
                  {MORTGAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {mortgageType === "fixed" && (
              <>
                <div>
                  <Label htmlFor="fixed-period">Fixed Rate Period</Label>
                  <Select
                    value={initialPeriod.toString()}
                    onValueChange={(val) => setInitialPeriod(parseInt(val))}
                  >
                    <SelectTrigger id="fixed-period">
                      <SelectValue placeholder="Select fixed period" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIXED_PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="calculate-avg-rate" className="flex-1">Calculate weighted average rate</Label>
                  <Switch
                    id="calculate-avg-rate"
                    checked={calculateInitialRate}
                    onCheckedChange={setCalculateInitialRate}
                  />
                </div>
                
                {calculateInitialRate && (
                  <>
                    <div>
                      <Label htmlFor="initial-rate">Initial Rate (%)</Label>
                      <Input 
                        id="initial-rate" 
                        type="number" 
                        step="0.01"
                        value={initialRate}
                        onChange={(e) => setInitialRate(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="svr-rate">Standard Variable Rate (%)</Label>
                      <Input 
                        id="svr-rate" 
                        type="number" 
                        step="0.01"
                        value={svr}
                        onChange={(e) => setSvr(parseFloat(e.target.value) || 0)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        The rate your mortgage will revert to after the fixed period ends.
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
            
            {(mortgageType === "tracker" || mortgageType === "variable") && (
              <div>
                <Label>Bank of England Base Rate</Label>
                <div className="p-3 bg-muted rounded-md text-sm">
                  Current base rate: <span className="font-medium">4.25%</span> (as of March 2025)
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tracker mortgages are typically base rate + 0.75-2.0% depending on LTV.
                </p>
              </div>
            )}
            
            {mortgageType === "offset" && (
              <div>
                <Label htmlFor="savings-amount">Linked Savings (£)</Label>
                <Input 
                  id="savings-amount" 
                  type="number" 
                  placeholder="e.g. 20000" 
                  defaultValue={0}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Savings in a linked account that reduce the interest charged on your mortgage.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Button 
          className="w-full"
          onClick={calculateMortgage}
        >
          <PoundSterling className="mr-2 h-4 w-4" />
          Calculate Mortgage
        </Button>
      </CardContent>
    </Card>
  );
}
