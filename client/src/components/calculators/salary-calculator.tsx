import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  ArrowLeftRight, 
  Calculator, 
  CalendarClock, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  HelpCircle, 
  Info, 
  PiggyBank, 
  PoundSterling, 
  Save, 
  TrendingUp, 
  X 
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// UK Tax Years
enum TaxYear {
  Y2023_2024 = "2023-2024",
  Y2024_2025 = "2024-2025",
}

// UK tax rates and bands for different tax years
const TAX_RATES = {
  [TaxYear.Y2023_2024]: {
    personal_allowance: 12570,
    basic_rate: { threshold: 50270, rate: 20 },
    higher_rate: { threshold: 125140, rate: 40 },
    additional_rate: { rate: 45 }
  },
  [TaxYear.Y2024_2025]: {
    personal_allowance: 12570,
    basic_rate: { threshold: 50270, rate: 20 },
    higher_rate: { threshold: 125140, rate: 40 },
    additional_rate: { rate: 45 }
  }
};

// UK National Insurance rates for different tax years
const NI_RATES = {
  [TaxYear.Y2023_2024]: {
    primary_threshold: 12570,
    upper_earnings_limit: 50270,
    primary_rate: 12,
    upper_rate: 2
  },
  [TaxYear.Y2024_2025]: {
    primary_threshold: 12570,
    upper_earnings_limit: 50270,
    primary_rate: 10, // Reduced from 12% to 10% from January 6, 2024
    upper_rate: 2
  }
};

// Common UK tax codes
const COMMON_TAX_CODES = [
  { code: "1257L", description: "Standard tax-free Personal Allowance" },
  { code: "BR", description: "All income taxed at basic rate (20%)" },
  { code: "D0", description: "All income taxed at higher rate (40%)" },
  { code: "D1", description: "All income taxed at additional rate (45%)" },
  { code: "NT", description: "No tax deducted from this income" },
  { code: "K", description: "Reduced tax-free allowance (K prefix)" },
  { code: "S", description: "Scottish tax rates apply" },
  { code: "0T", description: "No Personal Allowance" },
];

// Salary payment frequencies
const PAYMENT_FREQUENCIES = [
  { value: "monthly", label: "Monthly", divisor: 12 },
  { value: "weekly", label: "Weekly", divisor: 52 },
  { value: "fourWeekly", label: "Four-Weekly", divisor: 13 },
  { value: "daily", label: "Daily (5 days/week)", divisor: 260 },
  { value: "hourly", label: "Hourly (37.5hrs/week)", divisor: 1950 },
];

// Student Loan types
const STUDENT_LOAN_TYPES = [
  { value: "none", label: "No Student Loan" },
  { value: "plan1", label: "Plan 1", threshold: 22015, rate: 9 },
  { value: "plan2", label: "Plan 2", threshold: 27295, rate: 9 },
  { value: "plan4", label: "Plan 4 (Scotland)", threshold: 27660, rate: 9 },
  { value: "plan5", label: "Plan 5 (Northern Ireland)", threshold: 25000, rate: 9 },
  { value: "postgrad", label: "Postgraduate Loan", threshold: 21000, rate: 6 },
];

// Pension scheme types
const PENSION_SCHEMES = [
  { value: "relief-at-source", label: "Relief at Source" },
  { value: "net-pay", label: "Net Pay Arrangement" },
  { value: "salary-sacrifice", label: "Salary Sacrifice" },
];

// Student Loan Details
type StudentLoanDetails = {
  plan: string;
  amount: number;
};

// Enhanced Salary Data Type
type SalaryData = {
  // Basic Details
  annualSalary: number;
  salaryFrequency: string;
  salaryPeriodValue: number;
  taxYear: TaxYear;
  taxCode: string;
  
  // Pension Settings
  pensionPercent: number;
  pensionAmount: number;
  usePensionPercent: boolean;
  pensionScheme: string;
  
  // Additional Income & Benefits
  yearlyBonus: number;
  taxableBenefits: number;
  cashAllowances: number;
  
  // Deductions
  preDeductions: number; // Pre-tax deductions beyond pension contributions
  postDeductions: number; // Post-tax deductions like salary sacrifice
  
  // Student Loan
  studentLoan: string;
  hasPostgraduateLoan: boolean;
  
  // Meta Info
  label?: string; // For comparison (e.g. "Current Salary", "New Offer")
  color?: string; // For visualization
};

// Enhanced Salary Result Type
type SalaryResult = {
  // Totals - Annual
  annualGross: number;
  annualTaxable: number;
  annualTakeHome: number;
  
  // Totals - Monthly/Weekly/etc.
  periodGross: number;
  periodTakeHome: number;
  
  // Income Tax Breakdown
  incomeTax: {
    personalAllowance: number;
    basicRate: { amount: number; tax: number };
    higherRate: { amount: number; tax: number };
    additionalRate: { amount: number; tax: number };
    total: number;
  };
  
  // National Insurance Breakdown
  nationalInsurance: {
    primaryThreshold: { amount: number; contribution: number };
    upperEarningsLimit: { amount: number; contribution: number };
    total: number;
  };
  
  // Pension Contribution
  pension: {
    annualContribution: number;
    periodContribution: number;
    taxRelief: number;
  };
  
  // Student Loan Breakdown
  studentLoan?: {
    plan: string; 
    amount: number;
  };
  
  postgraduateLoan?: {
    amount: number;
  };
  
  // Rates and Factors
  effectiveTaxRate: number;
  marginalTaxRate: number;
  
  // Period Breakdown (for visualizations)
  periodBreakdown: {
    incomeTax: number;
    nationalInsurance: number;
    pension: number;
    studentLoan: number;
    takeHome: number;
  };
};

export function SalaryCalculator() {
  const [activeTab, setActiveTab] = useState("single");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTaxYear, setSelectedTaxYear] = useState<TaxYear>(TaxYear.Y2024_2025);
  
  // Default values for new salary
  const getDefaultSalaryData = (label?: string, color?: string): SalaryData => ({
    // Basic Details
    annualSalary: 60000,
    salaryFrequency: "monthly",
    salaryPeriodValue: 5000,
    taxYear: selectedTaxYear,
    taxCode: "1257L",
    
    // Pension Settings
    pensionPercent: 5,
    pensionAmount: 3000,
    usePensionPercent: true,
    pensionScheme: "relief-at-source",
    
    // Additional Income & Benefits
    yearlyBonus: 0,
    taxableBenefits: 0,
    cashAllowances: 0,
    
    // Deductions
    preDeductions: 0,
    postDeductions: 0,
    
    // Student Loan
    studentLoan: "none",
    hasPostgraduateLoan: false,
    
    // Meta
    label,
    color
  });
  
  // Single Salary Calculation
  const [salary, setSalary] = useState<SalaryData>(getDefaultSalaryData("Current Salary", "#4f46e5"));
  const [salaryResult, setSalaryResult] = useState<SalaryResult | null>(null);
  
  // Comparison Salary Calculation
  const [compareSalary, setCompareSalary] = useState<SalaryData>(getDefaultSalaryData("New Offer", "#f97316"));
  
  const [compareSalaryResult, setCompareSalaryResult] = useState<SalaryResult | null>(null);
  
  // Helper functions
  const extractPersonalAllowance = (taxCode: string, taxYear: TaxYear = TaxYear.Y2024_2025): number => {
    // Handle special tax codes
    if (taxCode === "BR" || taxCode === "D0" || taxCode === "D1" || taxCode === "0T") {
      return 0; // No personal allowance
    }
    
    // Extract numbers from tax code (e.g., 1257L -> 12570)
    const match = taxCode.match(/^(\d+)[A-Z]$/);
    if (match) {
      return parseInt(match[1]) * 10;
    }
    
    // Default to standard personal allowance for the selected tax year
    return TAX_RATES[taxYear].personal_allowance;
  };
  
  // Utility functions
  const formatCurrency = (amount: number): string => {
    return `£${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };
  
  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(2)}%`;
  };
  
  const getPeriodValue = (annual: number, frequency: string): number => {
    const period = PAYMENT_FREQUENCIES.find(p => p.value === frequency);
    if (!period) return annual / 12; // Default to monthly
    return annual / period.divisor;
  };
  
  // Calculate student loan repayment
  const calculateStudentLoanRepayment = (
    annualSalary: number, 
    studentLoanPlan: string, 
    hasPostgradLoan: boolean
  ): { plan?: StudentLoanDetails; postgrad?: StudentLoanDetails } => {
    const result: { plan?: StudentLoanDetails; postgrad?: StudentLoanDetails } = {};
    
    // Calculate main student loan repayment
    if (studentLoanPlan !== "none") {
      const loanType = STUDENT_LOAN_TYPES.find(l => l.value === studentLoanPlan);
      if (loanType && annualSalary > loanType.threshold) {
        const amount = ((annualSalary - loanType.threshold) * loanType.rate) / 100;
        result.plan = { plan: studentLoanPlan, amount };
      }
    }
    
    // Calculate postgraduate loan repayment if applicable
    if (hasPostgradLoan) {
      const pgLoanType = STUDENT_LOAN_TYPES.find(l => l.value === "postgrad");
      if (pgLoanType && annualSalary > pgLoanType.threshold) {
        const amount = ((annualSalary - pgLoanType.threshold) * pgLoanType.rate) / 100;
        result.postgrad = { plan: "postgrad", amount };
      }
    }
    
    return result;
  };
  
  // Enhanced salary calculation
  const calculateSalary = (data: SalaryData): SalaryResult => {
    // Get tax rate structures for selected tax year
    const taxRates = TAX_RATES[data.taxYear || TaxYear.Y2024_2025];
    const niRates = NI_RATES[data.taxYear || TaxYear.Y2024_2025];
    
    // Extract personal allowance from tax code
    const personalAllowance = extractPersonalAllowance(data.taxCode, data.taxYear);
    
    // Calculate pension contribution
    const pensionContribution = data.usePensionPercent
      ? (data.annualSalary * data.pensionPercent) / 100
      : data.pensionAmount;
    
    // Calculate gross income
    const annualGross = 
      data.annualSalary + 
      data.yearlyBonus + 
      data.cashAllowances;
    
    // Calculate taxable income
    const annualTaxable = 
      data.annualSalary + 
      data.yearlyBonus + 
      data.taxableBenefits - 
      pensionContribution - 
      data.preDeductions;
    
    // Calculate income tax
    let remainingTaxable = annualTaxable;
    let totalTax = 0;
    
    // Adjust personal allowance (reduces by £1 for every £2 over £100,000)
    let adjustedPersonalAllowance = personalAllowance;
    if (annualTaxable > 100000) {
      const excess = annualTaxable - 100000;
      const reduction = Math.min(personalAllowance, Math.floor(excess / 2));
      adjustedPersonalAllowance -= reduction;
    }
    
    // Personal allowance (0%)
    const personalAllowanceAmount = Math.min(adjustedPersonalAllowance, remainingTaxable);
    remainingTaxable -= personalAllowanceAmount;
    
    // Basic rate (20%)
    const basicRateAmount = Math.min(
      taxRates.basic_rate.threshold - adjustedPersonalAllowance,
      remainingTaxable
    );
    const basicRateTax = (basicRateAmount * taxRates.basic_rate.rate) / 100;
    remainingTaxable -= basicRateAmount;
    totalTax += basicRateTax;
    
    // Higher rate (40%)
    const higherRateAmount = Math.min(
      taxRates.higher_rate.threshold - taxRates.basic_rate.threshold,
      remainingTaxable
    );
    const higherRateTax = (higherRateAmount * taxRates.higher_rate.rate) / 100;
    remainingTaxable -= higherRateAmount;
    totalTax += higherRateTax;
    
    // Additional rate (45%)
    const additionalRateAmount = remainingTaxable;
    const additionalRateTax = (additionalRateAmount * taxRates.additional_rate.rate) / 100;
    totalTax += additionalRateTax;
    
    // Calculate National Insurance
    let niContribution = 0;
    let remainingForNI = data.annualSalary; // Only salary is subject to NI
    
    // Below primary threshold (0%)
    const belowPrimaryAmount = Math.min(niRates.primary_threshold, remainingForNI);
    remainingForNI -= belowPrimaryAmount;
    
    // Between primary threshold and upper earnings limit (10% for 2024/25, was 12%)
    const primaryAmount = Math.min(
      niRates.upper_earnings_limit - niRates.primary_threshold,
      remainingForNI
    );
    const primaryContribution = (primaryAmount * niRates.primary_rate) / 100;
    remainingForNI -= primaryAmount;
    niContribution += primaryContribution;
    
    // Above upper earnings limit (2%)
    const upperAmount = remainingForNI;
    const upperContribution = (upperAmount * niRates.upper_rate) / 100;
    niContribution += upperContribution;
    
    // Calculate student loan repayments
    const studentLoanRepayments = calculateStudentLoanRepayment(
      data.annualSalary,
      data.studentLoan,
      data.hasPostgraduateLoan
    );
    
    const studentLoanTotal = (studentLoanRepayments.plan?.amount || 0) + 
                            (studentLoanRepayments.postgrad?.amount || 0);
    
    // Calculate pension tax relief (for Relief at Source schemes)
    const pensionTaxRelief = data.pensionScheme === "relief-at-source" 
      ? pensionContribution * 0.2 // Basic rate tax relief
      : 0;
    
    // Calculate take-home pay
    const annualTakeHome = 
      annualGross - 
      totalTax - 
      niContribution - 
      pensionContribution - 
      studentLoanTotal -
      data.postDeductions;
    
    // Calculate period value based on salary frequency
    const periodDivisor = PAYMENT_FREQUENCIES.find(p => p.value === data.salaryFrequency)?.divisor || 12;
    const periodGross = annualGross / periodDivisor;
    const periodTakeHome = annualTakeHome / periodDivisor;
    
    // Calculate effective and marginal tax rates
    const effectiveTaxRate = ((totalTax + niContribution) / annualGross) * 100;
    
    // Determine marginal tax rate based on income level
    let marginalTaxRate = 0;
    if (annualTaxable > taxRates.higher_rate.threshold) {
      marginalTaxRate = taxRates.additional_rate.rate;
    } else if (annualTaxable > taxRates.basic_rate.threshold) {
      marginalTaxRate = taxRates.higher_rate.rate;
    } else if (annualTaxable > 0) {
      marginalTaxRate = taxRates.basic_rate.rate;
    }
    
    // Prepare period breakdown for visualization
    const periodBreakdown = {
      incomeTax: totalTax / periodDivisor,
      nationalInsurance: niContribution / periodDivisor,
      pension: pensionContribution / periodDivisor,
      studentLoan: studentLoanTotal / periodDivisor,
      takeHome: periodTakeHome
    };
    
    return {
      // Totals - Annual
      annualGross,
      annualTaxable,
      annualTakeHome,
      
      // Totals - Period (Monthly/Weekly/etc.)
      periodGross,
      periodTakeHome,
      
      // Income Tax Breakdown
      incomeTax: {
        personalAllowance: adjustedPersonalAllowance,
        basicRate: { amount: basicRateAmount, tax: basicRateTax },
        higherRate: { amount: higherRateAmount, tax: higherRateTax },
        additionalRate: { amount: additionalRateAmount, tax: additionalRateTax },
        total: totalTax
      },
      
      // National Insurance Breakdown
      nationalInsurance: {
        primaryThreshold: { amount: primaryAmount, contribution: primaryContribution },
        upperEarningsLimit: { amount: upperAmount, contribution: upperContribution },
        total: niContribution
      },
      
      // Pension Contribution
      pension: {
        annualContribution: pensionContribution,
        periodContribution: pensionContribution / periodDivisor,
        taxRelief: pensionTaxRelief
      },
      
      // Student Loan (if applicable)
      ...(studentLoanRepayments.plan && { studentLoan: studentLoanRepayments.plan }),
      ...(studentLoanRepayments.postgrad && { postgraduateLoan: studentLoanRepayments.postgrad }),
      
      // Rates and Factors
      effectiveTaxRate,
      marginalTaxRate,
      
      // Period Breakdown (for visualizations)
      periodBreakdown
    };
  };
  
  // Handle form updates
  const handleSalaryChange = (field: keyof SalaryData, value: string | boolean) => {
    setSalary(prev => {
      const newData = { ...prev };
      
      if (field === 'usePensionPercent') {
        newData[field] = value as boolean;
      } else {
        // Convert numeric string values to numbers
        if (typeof value === 'string' && !isNaN(parseFloat(value))) {
          (newData as any)[field] = parseFloat(value);
        } else {
          (newData as any)[field] = value;
        }
      }
      
      return newData;
    });
  };
  
  const handleCompareSalaryChange = (field: keyof SalaryData, value: string | boolean) => {
    setCompareSalary(prev => {
      const newData = { ...prev };
      
      if (field === 'usePensionPercent') {
        newData[field] = value as boolean;
      } else {
        // Convert numeric string values to numbers
        if (typeof value === 'string' && !isNaN(parseFloat(value))) {
          (newData as any)[field] = parseFloat(value);
        } else {
          (newData as any)[field] = value;
        }
      }
      
      return newData;
    });
  };
  
  // Calculate button handlers
  const handleCalculate = () => {
    const result = calculateSalary(salary);
    setSalaryResult(result);
  };
  
  const handleCompareCalculate = () => {
    const result1 = calculateSalary(salary);
    const result2 = calculateSalary(compareSalary);
    
    setSalaryResult(result1);
    setCompareSalaryResult(result2);
  };
  
  // Save for comparison
  const saveForComparison = () => {
    setActiveTab("compare");
    setCompareSalary(salary);
    if (salaryResult) {
      setCompareSalaryResult(salaryResult);
    }
  };
  
  // On mount, calculate the default salary
  useEffect(() => {
    handleCalculate();
  }, []);
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-5 w-5" />
          UK Salary Calculator
        </CardTitle>
        <CardDescription>
          Calculate take-home pay with the latest {selectedTaxYear} tax rates and thresholds
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="single">Single Salary</TabsTrigger>
            <TabsTrigger value="compare">Compare Salaries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Section */}
              <div className="space-y-4">
                {/* Tax Year Selection */}
                <div className="mb-4">
                  <Select
                    value={salary.taxYear}
                    onValueChange={(value) => handleSalaryChange('taxYear', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tax year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Tax Year</SelectLabel>
                        <SelectItem value={TaxYear.Y2024_2025}>2024-2025 (Current)</SelectItem>
                        <SelectItem value={TaxYear.Y2023_2024}>2023-2024 (Previous)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Salary and Payment Frequency */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="annualSalary">Annual Salary</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                      <Input
                        id="annualSalary"
                        type="number"
                        className="pl-8"
                        value={salary.annualSalary}
                        onChange={(e) => handleSalaryChange('annualSalary', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="salaryFrequency">Payment Frequency</Label>
                      <Select
                        value={salary.salaryFrequency}
                        onValueChange={(value) => handleSalaryChange('salaryFrequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="taxCode">Tax Code</Label>
                      <div className="relative">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute inset-y-0 right-0 h-full"
                              >
                                <HelpCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="w-80 p-2">
                              <div className="space-y-2">
                                <h4 className="font-medium">Common UK Tax Codes</h4>
                                <ul className="space-y-1 text-xs">
                                  {COMMON_TAX_CODES.map(code => (
                                    <li key={code.code} className="flex justify-between">
                                      <span className="font-semibold">{code.code}</span>
                                      <span>{code.description}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Input
                          id="taxCode"
                          type="text"
                          value={salary.taxCode}
                          className="pr-8"
                          onChange={(e) => handleSalaryChange('taxCode', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pension Settings */}
                <Card className="border-dashed border-muted">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-md flex items-center">
                      <PiggyBank className="mr-2 h-4 w-4" />
                      Pension Contribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <Select
                        value={salary.pensionScheme}
                        onValueChange={(value) => handleSalaryChange('pensionScheme', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pension scheme" />
                        </SelectTrigger>
                        <SelectContent>
                          {PENSION_SCHEMES.map((scheme) => (
                            <SelectItem key={scheme.value} value={scheme.value}>
                              {scheme.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex items-center space-x-2 ml-2">
                        <Label>£</Label>
                        <Switch
                          checked={salary.usePensionPercent}
                          onCheckedChange={(checked) => handleSalaryChange('usePensionPercent', checked)}
                        />
                        <Label>%</Label>
                      </div>
                    </div>
                    
                    {salary.usePensionPercent ? (
                      <div className="relative">
                        <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">%</span>
                        <Input
                          type="number"
                          value={salary.pensionPercent}
                          onChange={(e) => handleSalaryChange('pensionPercent', e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                        <Input
                          type="number"
                          className="pl-8"
                          value={salary.pensionAmount}
                          onChange={(e) => handleSalaryChange('pensionAmount', e.target.value)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Student Loan */}
                <Card className="border-dashed border-muted">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-md flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Student Loan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-3">
                    <Select
                      value={salary.studentLoan}
                      onValueChange={(value) => handleSalaryChange('studentLoan', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Student loan plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDENT_LOAN_TYPES.map((plan) => (
                          <SelectItem key={plan.value} value={plan.value}>
                            {plan.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="hasPostgraduateLoan"
                        checked={salary.hasPostgraduateLoan}
                        onCheckedChange={(checked) => handleSalaryChange('hasPostgraduateLoan', checked)}
                      />
                      <Label htmlFor="hasPostgraduateLoan">
                        Postgraduate Loan
                      </Label>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Additional Income & Benefits */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="yearlyBonus">Yearly Bonus</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                      <Input
                        id="yearlyBonus"
                        type="number"
                        className="pl-8"
                        value={salary.yearlyBonus}
                        onChange={(e) => handleSalaryChange('yearlyBonus', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxableBenefits">Taxable Benefits</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                      <Input
                        id="taxableBenefits"
                        type="number"
                        className="pl-8"
                        value={salary.taxableBenefits}
                        onChange={(e) => handleSalaryChange('taxableBenefits', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cashAllowances">Cash Allowances</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                    <Input
                      id="cashAllowances"
                      type="number"
                      className="pl-8"
                      value={salary.cashAllowances}
                      onChange={(e) => handleSalaryChange('cashAllowances', e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Deductions */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1">
                      <Label htmlFor="preDeductions">Pre-Tax Deductions</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px] text-xs">Deductions made before tax calculation, such as salary sacrifice schemes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                      <Input
                        id="preDeductions"
                        type="number"
                        className="pl-8"
                        value={salary.preDeductions}
                        onChange={(e) => handleSalaryChange('preDeductions', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1">
                      <Label htmlFor="postDeductions">Post-Tax Deductions</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px] text-xs">Deductions made after tax calculation, such as season ticket loans</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">£</span>
                      <Input
                        id="postDeductions"
                        type="number"
                        className="pl-8"
                        value={salary.postDeductions}
                        onChange={(e) => handleSalaryChange('postDeductions', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleCalculate} className="w-full" size="lg">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate Salary
                </Button>
              </div>
              
              {/* Results Section */}
              {salaryResult && (
                <div className="space-y-4">
                  {/* Period and Annual Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-medium text-gray-600">
                          {salary.salaryFrequency === "monthly" ? "Monthly" : 
                           salary.salaryFrequency === "weekly" ? "Weekly" :
                           salary.salaryFrequency === "fourWeekly" ? "Four-Weekly" :
                           salary.salaryFrequency === "daily" ? "Daily" : "Hourly"} Take-Home
                        </h3>
                        <div className="text-3xl font-bold mt-1 text-blue-700">{formatCurrency(salaryResult.periodTakeHome)}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatPercentage(salaryResult.effectiveTaxRate)} effective tax rate
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-medium text-gray-600">Annual Take-Home</h3>
                        <div className="text-3xl font-bold mt-1 text-emerald-700">{formatCurrency(salaryResult.annualTakeHome)}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCurrency(salaryResult.annualGross)} gross per year
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Breakdown Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <PoundSterling className="mr-2 h-5 w-5" />
                        Salary Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Salary and Tax Summary */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Gross Salary:</span>
                            <span className="font-medium">{formatCurrency(salaryResult.annualGross)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Taxable Pay:</span>
                            <span className="font-medium">{formatCurrency(salaryResult.annualTaxable)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Income Tax:</span>
                            <span className="font-medium text-red-600">-{formatCurrency(salaryResult.incomeTax.total)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>National Insurance:</span>
                            <span className="font-medium text-red-600">-{formatCurrency(salaryResult.nationalInsurance.total)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pension Contribution:</span>
                            <span className="font-medium text-blue-600">-{formatCurrency(salaryResult.pension.annualContribution)}</span>
                          </div>
                          
                          {/* Student Loan Section */}
                          {salaryResult.studentLoan && (
                            <div className="flex justify-between text-sm">
                              <span>Student Loan ({salaryResult.studentLoan.plan}):</span>
                              <span className="font-medium text-red-600">-{formatCurrency(salaryResult.studentLoan.amount)}</span>
                            </div>
                          )}
                          
                          {salaryResult.postgraduateLoan && (
                            <div className="flex justify-between text-sm">
                              <span>Postgraduate Loan:</span>
                              <span className="font-medium text-red-600">-{formatCurrency(salaryResult.postgraduateLoan.amount)}</span>
                            </div>
                          )}
                          
                          {/* Only show deductions if they exist */}
                          {salary.postDeductions > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Post-Tax Deductions:</span>
                              <span className="font-medium text-red-600">-{formatCurrency(salary.postDeductions)}</span>
                            </div>
                          )}
                          
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Annual Take-Home Pay:</span>
                            <span className="text-emerald-700">{formatCurrency(salaryResult.annualTakeHome)}</span>
                          </div>
                        </div>
                        
                        {/* Visualization of Split */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">How Your Salary is Split</h3>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Take-Home Pay</span>
                              <span>{formatPercentage((salaryResult.annualTakeHome / salaryResult.annualGross) * 100)}</span>
                            </div>
                            <Progress 
                              value={(salaryResult.annualTakeHome / salaryResult.annualGross) * 100} 
                              className="h-2 bg-gray-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Income Tax</span>
                              <span>{formatPercentage((salaryResult.incomeTax.total / salaryResult.annualGross) * 100)}</span>
                            </div>
                            <Progress 
                              value={(salaryResult.incomeTax.total / salaryResult.annualGross) * 100} 
                              className="h-2 bg-red-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>National Insurance</span>
                              <span>{formatPercentage((salaryResult.nationalInsurance.total / salaryResult.annualGross) * 100)}</span>
                            </div>
                            <Progress 
                              value={(salaryResult.nationalInsurance.total / salaryResult.annualGross) * 100} 
                              className="h-2 bg-orange-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Pension</span>
                              <span>{formatPercentage((salaryResult.pension.annualContribution / salaryResult.annualGross) * 100)}</span>
                            </div>
                            <Progress 
                              value={(salaryResult.pension.annualContribution / salaryResult.annualGross) * 100} 
                              className="h-2 bg-blue-200"
                            />
                          </div>
                          
                          {/* Only show if student loan exists */}
                          {(salaryResult.studentLoan || salaryResult.postgraduateLoan) && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Student Loan</span>
                                <span>{formatPercentage((salaryResult.periodBreakdown.studentLoan * 12 / salaryResult.annualGross) * 100)}</span>
                              </div>
                              <Progress 
                                value={(salaryResult.periodBreakdown.studentLoan * 12 / salaryResult.annualGross) * 100} 
                                className="h-2 bg-purple-200"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 border-t flex justify-between">
                      <div>
                        <Badge variant="outline" className="mr-2">
                          {salary.taxYear}
                        </Badge>
                        <Badge variant="outline">
                          Tax Code: {salary.taxCode}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={saveForComparison}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Save for Comparison
                        </Button>
                        <Button
                          onClick={() => setShowDetails(!showDetails)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {showDetails ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5 mr-1" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5 mr-1" />
                              Show Details
                            </>
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                  
                  {/* Detailed Tax Breakdown */}
                  {showDetails && (
                    <div className="space-y-4">
                      {/* Income Tax Breakdown */}
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">Income Tax Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Band</TableHead>
                                <TableHead>Taxable Amount</TableHead>
                                <TableHead>Tax Rate</TableHead>
                                <TableHead className="text-right">Tax Paid</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">Personal Allowance</TableCell>
                                <TableCell>{formatCurrency(salaryResult.incomeTax.personalAllowance)}</TableCell>
                                <TableCell>0%</TableCell>
                                <TableCell className="text-right">£0.00</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Basic Rate</TableCell>
                                <TableCell>{formatCurrency(salaryResult.incomeTax.basicRate.amount)}</TableCell>
                                <TableCell>20%</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.incomeTax.basicRate.tax)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Higher Rate</TableCell>
                                <TableCell>{formatCurrency(salaryResult.incomeTax.higherRate.amount)}</TableCell>
                                <TableCell>40%</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.incomeTax.higherRate.tax)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Additional Rate</TableCell>
                                <TableCell>{formatCurrency(salaryResult.incomeTax.additionalRate.amount)}</TableCell>
                                <TableCell>45%</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.incomeTax.additionalRate.tax)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium" colSpan={3}>Total Income Tax</TableCell>
                                <TableCell className="text-right font-semibold">{formatCurrency(salaryResult.incomeTax.total)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                      
                      {/* National Insurance Breakdown */}
                      <Card>
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base">National Insurance Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Band</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead className="text-right">Contribution</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell className="font-medium">Between PT and UEL</TableCell>
                                <TableCell>{formatCurrency(salaryResult.nationalInsurance.primaryThreshold.amount)}</TableCell>
                                <TableCell>{salary.taxYear === TaxYear.Y2024_2025 ? '10%' : '12%'}</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.nationalInsurance.primaryThreshold.contribution)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium">Above UEL</TableCell>
                                <TableCell>{formatCurrency(salaryResult.nationalInsurance.upperEarningsLimit.amount)}</TableCell>
                                <TableCell>2%</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.nationalInsurance.upperEarningsLimit.contribution)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="font-medium" colSpan={3}>Total National Insurance</TableCell>
                                <TableCell className="text-right font-semibold">{formatCurrency(salaryResult.nationalInsurance.total)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                      
                      {/* Additional Tax Info */}
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <h3 className="text-sm font-medium text-gray-500">Marginal Tax Rate</h3>
                            <div className="text-xl font-bold mt-1">{formatPercentage(salaryResult.marginalTaxRate)}</div>
                            <p className="text-xs text-gray-500 mt-1">
                              Tax rate on your next pound earned
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <h3 className="text-sm font-medium text-gray-500">Effective Tax Rate</h3>
                            <div className="text-xl font-bold mt-1">{formatPercentage(salaryResult.effectiveTaxRate)}</div>
                            <p className="text-xs text-gray-500 mt-1">
                              Overall tax rate on your income
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <h3 className="text-sm font-medium text-gray-500">Pension Contribution</h3>
                            <div className="text-xl font-bold mt-1">{formatCurrency(salaryResult.pension.periodContribution)} / period</div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatCurrency(salaryResult.pension.annualContribution)} annually
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      {/* Student Loan Info */}
                      {(salaryResult.studentLoan || salaryResult.postgraduateLoan) && (
                        <Card>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base">Student Loan Repayments</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Threshold</TableHead>
                                  <TableHead>Rate</TableHead>
                                  <TableHead className="text-right">Annual Repayment</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {salaryResult.studentLoan && (
                                  <TableRow>
                                    <TableCell className="font-medium">Plan {salaryResult.studentLoan.plan}</TableCell>
                                    <TableCell>
                                      {formatCurrency(STUDENT_LOAN_TYPES.find(loan => loan.value === salaryResult.studentLoan?.plan)?.threshold || 0)}
                                    </TableCell>
                                    <TableCell>
                                      {formatPercentage(STUDENT_LOAN_TYPES.find(loan => loan.value === salaryResult.studentLoan?.plan)?.rate || 0)}
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(salaryResult.studentLoan.amount)}</TableCell>
                                  </TableRow>
                                )}
                                {salaryResult.postgraduateLoan && (
                                  <TableRow>
                                    <TableCell className="font-medium">Postgraduate Loan</TableCell>
                                    <TableCell>
                                      {formatCurrency(STUDENT_LOAN_TYPES.find(loan => loan.value === 'postgrad')?.threshold || 0)}
                                    </TableCell>
                                    <TableCell>
                                      {formatPercentage(STUDENT_LOAN_TYPES.find(loan => loan.value === 'postgrad')?.rate || 0)}
                                    </TableCell>
                                    <TableCell className="text-right">{formatCurrency(salaryResult.postgraduateLoan.amount)}</TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="compare" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* First Salary */}
              <div className="space-y-4">
                <h3 className="font-semibold border-b pb-2">Salary 1</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="annualSalary1">Annual Salary (£)</Label>
                    <Input
                      id="annualSalary1"
                      type="number"
                      value={salary.annualSalary}
                      onChange={(e) => handleSalaryChange('annualSalary', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxCode1">Tax Code</Label>
                    <Input
                      id="taxCode1"
                      type="text"
                      value={salary.taxCode}
                      onChange={(e) => handleSalaryChange('taxCode', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Pension Contribution</Label>
                    <div className="flex items-center space-x-2">
                      <Label>£</Label>
                      <Switch
                        checked={salary.usePensionPercent}
                        onCheckedChange={(checked) => handleSalaryChange('usePensionPercent', checked)}
                      />
                      <Label>%</Label>
                    </div>
                  </div>
                  
                  {salary.usePensionPercent ? (
                    <Input
                      type="number"
                      value={salary.pensionPercent}
                      onChange={(e) => handleSalaryChange('pensionPercent', e.target.value)}
                    />
                  ) : (
                    <Input
                      type="number"
                      value={salary.pensionAmount}
                      onChange={(e) => handleSalaryChange('pensionAmount', e.target.value)}
                    />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="yearlyBonus1">Yearly Bonus (£)</Label>
                    <Input
                      id="yearlyBonus1"
                      type="number"
                      value={salary.yearlyBonus}
                      onChange={(e) => handleSalaryChange('yearlyBonus', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxableBenefits1">Taxable Benefits (£)</Label>
                    <Input
                      id="taxableBenefits1"
                      type="number"
                      value={salary.taxableBenefits}
                      onChange={(e) => handleSalaryChange('taxableBenefits', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cashAllowances1">Cash Allowances (£)</Label>
                  <Input
                    id="cashAllowances1"
                    type="number"
                    value={salary.cashAllowances}
                    onChange={(e) => handleSalaryChange('cashAllowances', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="preDeductions1">Pre-Tax Deductions (£)</Label>
                    <Input
                      id="preDeductions1"
                      type="number"
                      value={salary.preDeductions}
                      onChange={(e) => handleSalaryChange('preDeductions', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postDeductions1">Post-Tax Deductions (£)</Label>
                    <Input
                      id="postDeductions1"
                      type="number"
                      value={salary.postDeductions}
                      onChange={(e) => handleSalaryChange('postDeductions', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Second Salary */}
              <div className="space-y-4">
                <h3 className="font-semibold border-b pb-2">Salary 2</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="annualSalary2">Annual Salary (£)</Label>
                    <Input
                      id="annualSalary2"
                      type="number"
                      value={compareSalary.annualSalary}
                      onChange={(e) => handleCompareSalaryChange('annualSalary', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxCode2">Tax Code</Label>
                    <Input
                      id="taxCode2"
                      type="text"
                      value={compareSalary.taxCode}
                      onChange={(e) => handleCompareSalaryChange('taxCode', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Pension Contribution</Label>
                    <div className="flex items-center space-x-2">
                      <Label>£</Label>
                      <Switch
                        checked={compareSalary.usePensionPercent}
                        onCheckedChange={(checked) => handleCompareSalaryChange('usePensionPercent', checked)}
                      />
                      <Label>%</Label>
                    </div>
                  </div>
                  
                  {compareSalary.usePensionPercent ? (
                    <Input
                      type="number"
                      value={compareSalary.pensionPercent}
                      onChange={(e) => handleCompareSalaryChange('pensionPercent', e.target.value)}
                    />
                  ) : (
                    <Input
                      type="number"
                      value={compareSalary.pensionAmount}
                      onChange={(e) => handleCompareSalaryChange('pensionAmount', e.target.value)}
                    />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="yearlyBonus2">Yearly Bonus (£)</Label>
                    <Input
                      id="yearlyBonus2"
                      type="number"
                      value={compareSalary.yearlyBonus}
                      onChange={(e) => handleCompareSalaryChange('yearlyBonus', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxableBenefits2">Taxable Benefits (£)</Label>
                    <Input
                      id="taxableBenefits2"
                      type="number"
                      value={compareSalary.taxableBenefits}
                      onChange={(e) => handleCompareSalaryChange('taxableBenefits', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cashAllowances2">Cash Allowances (£)</Label>
                  <Input
                    id="cashAllowances2"
                    type="number"
                    value={compareSalary.cashAllowances}
                    onChange={(e) => handleCompareSalaryChange('cashAllowances', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="preDeductions2">Pre-Tax Deductions (£)</Label>
                    <Input
                      id="preDeductions2"
                      type="number"
                      value={compareSalary.preDeductions}
                      onChange={(e) => handleCompareSalaryChange('preDeductions', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postDeductions2">Post-Tax Deductions (£)</Label>
                    <Input
                      id="postDeductions2"
                      type="number"
                      value={compareSalary.postDeductions}
                      onChange={(e) => handleCompareSalaryChange('postDeductions', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={handleCompareCalculate} className="w-full max-w-md">
                Compare Salaries
              </Button>
            </div>
            
            {/* Comparison Results */}
            {salaryResult && compareSalaryResult && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-4">Salary Comparison</h3>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead></TableHead>
                          <TableHead>Salary 1</TableHead>
                          <TableHead>Salary 2</TableHead>
                          <TableHead>Difference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Annual Gross</TableCell>
                          <TableCell>{formatCurrency(salaryResult.annualGross)}</TableCell>
                          <TableCell>{formatCurrency(compareSalaryResult.annualGross)}</TableCell>
                          <TableCell className={
                            compareSalaryResult.annualGross - salaryResult.annualGross > 0 
                              ? "text-green-600" 
                              : "text-red-600"
                          }>
                            {formatCurrency(compareSalaryResult.annualGross - salaryResult.annualGross)}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell className="font-medium">Monthly Gross</TableCell>
                          <TableCell>{formatCurrency(salaryResult.monthlyGross)}</TableCell>
                          <TableCell>{formatCurrency(compareSalaryResult.monthlyGross)}</TableCell>
                          <TableCell className={
                            compareSalaryResult.monthlyGross - salaryResult.monthlyGross > 0 
                              ? "text-green-600" 
                              : "text-red-600"
                          }>
                            {formatCurrency(compareSalaryResult.monthlyGross - salaryResult.monthlyGross)}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell className="font-medium">Income Tax</TableCell>
                          <TableCell>{formatCurrency(salaryResult.incomeTax.total)}</TableCell>
                          <TableCell>{formatCurrency(compareSalaryResult.incomeTax.total)}</TableCell>
                          <TableCell className={
                            compareSalaryResult.incomeTax.total - salaryResult.incomeTax.total < 0 
                              ? "text-green-600" 
                              : "text-red-600"
                          }>
                            {formatCurrency(compareSalaryResult.incomeTax.total - salaryResult.incomeTax.total)}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell className="font-medium">National Insurance</TableCell>
                          <TableCell>{formatCurrency(salaryResult.nationalInsurance.total)}</TableCell>
                          <TableCell>{formatCurrency(compareSalaryResult.nationalInsurance.total)}</TableCell>
                          <TableCell className={
                            compareSalaryResult.nationalInsurance.total - salaryResult.nationalInsurance.total < 0 
                              ? "text-green-600" 
                              : "text-red-600"
                          }>
                            {formatCurrency(compareSalaryResult.nationalInsurance.total - salaryResult.nationalInsurance.total)}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell className="font-medium">Pension Contribution</TableCell>
                          <TableCell>{formatCurrency(salaryResult.pension.annualContribution)}</TableCell>
                          <TableCell>{formatCurrency(compareSalaryResult.pension.annualContribution)}</TableCell>
                          <TableCell>
                            {formatCurrency(compareSalaryResult.pension.annualContribution - salaryResult.pension.annualContribution)}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow className="bg-gray-50">
                          <TableCell className="font-bold">Annual Take-Home</TableCell>
                          <TableCell className="font-bold">{formatCurrency(salaryResult.annualTakeHome)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(compareSalaryResult.annualTakeHome)}</TableCell>
                          <TableCell className={`font-bold ${
                            compareSalaryResult.annualTakeHome - salaryResult.annualTakeHome > 0 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`}>
                            {formatCurrency(compareSalaryResult.annualTakeHome - salaryResult.annualTakeHome)}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow className="bg-gray-50">
                          <TableCell className="font-bold">Monthly Take-Home</TableCell>
                          <TableCell className="font-bold">{formatCurrency(salaryResult.monthlyTakeHome)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(compareSalaryResult.monthlyTakeHome)}</TableCell>
                          <TableCell className={`font-bold ${
                            compareSalaryResult.monthlyTakeHome - salaryResult.monthlyTakeHome > 0 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`}>
                            {formatCurrency(compareSalaryResult.monthlyTakeHome - salaryResult.monthlyTakeHome)}
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell className="font-medium">Effective Tax Rate</TableCell>
                          <TableCell>{formatPercentage(salaryResult.effectiveTaxRate)}</TableCell>
                          <TableCell>{formatPercentage(compareSalaryResult.effectiveTaxRate)}</TableCell>
                          <TableCell className={
                            compareSalaryResult.effectiveTaxRate - salaryResult.effectiveTaxRate < 0 
                              ? "text-green-600" 
                              : "text-red-600"
                          }>
                            {formatPercentage(compareSalaryResult.effectiveTaxRate - salaryResult.effectiveTaxRate)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}