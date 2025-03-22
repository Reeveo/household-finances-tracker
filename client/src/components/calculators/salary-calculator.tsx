import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Copy, Save } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// UK tax rates and bands for 2023/2024
const TAX_RATES = {
  personal_allowance: 12570,
  basic_rate: { threshold: 50270, rate: 20 },
  higher_rate: { threshold: 125140, rate: 40 },
  additional_rate: { rate: 45 }
};

// UK National Insurance rates for 2023/2024
const NI_RATES = {
  primary_threshold: 12570,
  upper_earnings_limit: 50270,
  primary_rate: 12,
  upper_rate: 2
};

type SalaryData = {
  annualSalary: number;
  taxCode: string;
  pensionPercent: number;
  pensionAmount: number;
  usePensionPercent: boolean;
  yearlyBonus: number;
  taxableBenefits: number;
  cashAllowances: number;
  preDeductions: number;
  postDeductions: number;
};

type SalaryResult = {
  annualGross: number;
  monthlyGross: number;
  annualTaxable: number;
  
  incomeTax: {
    personalAllowance: number;
    basicRate: { amount: number; tax: number };
    higherRate: { amount: number; tax: number };
    additionalRate: { amount: number; tax: number };
    total: number;
  };
  
  nationalInsurance: {
    primaryThreshold: { amount: number; contribution: number };
    upperEarningsLimit: { amount: number; contribution: number };
    total: number;
  };
  
  pension: {
    annualContribution: number;
    monthlyContribution: number;
  };
  
  annualTakeHome: number;
  monthlyTakeHome: number;
  effectiveTaxRate: number;
};

export function SalaryCalculator() {
  const [activeTab, setActiveTab] = useState("single");
  const [showDetails, setShowDetails] = useState(false);
  
  // Single Salary Calculation
  const [salary, setSalary] = useState<SalaryData>({
    annualSalary: 60000,
    taxCode: "1257L",
    pensionPercent: 5,
    pensionAmount: 0,
    usePensionPercent: true,
    yearlyBonus: 0,
    taxableBenefits: 0,
    cashAllowances: 0,
    preDeductions: 0,
    postDeductions: 0
  });
  
  const [salaryResult, setSalaryResult] = useState<SalaryResult | null>(null);
  
  // Comparison Salary Calculation
  const [compareSalary, setCompareSalary] = useState<SalaryData>({
    annualSalary: 70000,
    taxCode: "1257L",
    pensionPercent: 5,
    pensionAmount: 0,
    usePensionPercent: true,
    yearlyBonus: 0,
    taxableBenefits: 0,
    cashAllowances: 0,
    preDeductions: 0,
    postDeductions: 0
  });
  
  const [compareSalaryResult, setCompareSalaryResult] = useState<SalaryResult | null>(null);
  
  // Helper functions
  const extractPersonalAllowance = (taxCode: string): number => {
    // Extract numbers from tax code (e.g., 1257L -> 12570)
    const match = taxCode.match(/^(\d+)[A-Z]$/);
    if (match) {
      return parseInt(match[1]) * 10;
    }
    return TAX_RATES.personal_allowance; // Default
  };
  
  const formatCurrency = (amount: number): string => {
    return `£${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };
  
  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(2)}%`;
  };
  
  // Calculate salary breakdown
  const calculateSalary = (data: SalaryData): SalaryResult => {
    const personalAllowance = extractPersonalAllowance(data.taxCode);
    
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
      TAX_RATES.basic_rate.threshold - adjustedPersonalAllowance,
      remainingTaxable
    );
    const basicRateTax = (basicRateAmount * TAX_RATES.basic_rate.rate) / 100;
    remainingTaxable -= basicRateAmount;
    totalTax += basicRateTax;
    
    // Higher rate (40%)
    const higherRateAmount = Math.min(
      TAX_RATES.higher_rate.threshold - TAX_RATES.basic_rate.threshold,
      remainingTaxable
    );
    const higherRateTax = (higherRateAmount * TAX_RATES.higher_rate.rate) / 100;
    remainingTaxable -= higherRateAmount;
    totalTax += higherRateTax;
    
    // Additional rate (45%)
    const additionalRateAmount = remainingTaxable;
    const additionalRateTax = (additionalRateAmount * TAX_RATES.additional_rate.rate) / 100;
    totalTax += additionalRateTax;
    
    // Calculate National Insurance
    let niContribution = 0;
    let remainingForNI = data.annualSalary; // Only salary is subject to NI
    
    // Below primary threshold (0%)
    const belowPrimaryAmount = Math.min(NI_RATES.primary_threshold, remainingForNI);
    remainingForNI -= belowPrimaryAmount;
    
    // Between primary threshold and upper earnings limit (12%)
    const primaryAmount = Math.min(
      NI_RATES.upper_earnings_limit - NI_RATES.primary_threshold,
      remainingForNI
    );
    const primaryContribution = (primaryAmount * NI_RATES.primary_rate) / 100;
    remainingForNI -= primaryAmount;
    niContribution += primaryContribution;
    
    // Above upper earnings limit (2%)
    const upperAmount = remainingForNI;
    const upperContribution = (upperAmount * NI_RATES.upper_rate) / 100;
    niContribution += upperContribution;
    
    // Calculate take-home pay
    const annualTakeHome = 
      annualGross - 
      totalTax - 
      niContribution - 
      pensionContribution - 
      data.postDeductions;
    
    const monthlyTakeHome = annualTakeHome / 12;
    const monthlyGross = annualGross / 12;
    
    // Calculate effective tax rate
    const effectiveTaxRate = ((totalTax + niContribution) / annualGross) * 100;
    
    return {
      annualGross,
      monthlyGross,
      annualTaxable,
      
      incomeTax: {
        personalAllowance: adjustedPersonalAllowance,
        basicRate: { amount: basicRateAmount, tax: basicRateTax },
        higherRate: { amount: higherRateAmount, tax: higherRateTax },
        additionalRate: { amount: additionalRateAmount, tax: additionalRateTax },
        total: totalTax
      },
      
      nationalInsurance: {
        primaryThreshold: { amount: primaryAmount, contribution: primaryContribution },
        upperEarningsLimit: { amount: upperAmount, contribution: upperContribution },
        total: niContribution
      },
      
      pension: {
        annualContribution: pensionContribution,
        monthlyContribution: pensionContribution / 12
      },
      
      annualTakeHome,
      monthlyTakeHome,
      effectiveTaxRate
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
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Salary Calculator</CardTitle>
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="annualSalary">Annual Salary (£)</Label>
                    <Input
                      id="annualSalary"
                      type="number"
                      value={salary.annualSalary}
                      onChange={(e) => handleSalaryChange('annualSalary', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxCode">Tax Code</Label>
                    <Input
                      id="taxCode"
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
                    <Label htmlFor="yearlyBonus">Yearly Bonus (£)</Label>
                    <Input
                      id="yearlyBonus"
                      type="number"
                      value={salary.yearlyBonus}
                      onChange={(e) => handleSalaryChange('yearlyBonus', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxableBenefits">Taxable Benefits (£)</Label>
                    <Input
                      id="taxableBenefits"
                      type="number"
                      value={salary.taxableBenefits}
                      onChange={(e) => handleSalaryChange('taxableBenefits', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cashAllowances">Cash Allowances (£)</Label>
                  <Input
                    id="cashAllowances"
                    type="number"
                    value={salary.cashAllowances}
                    onChange={(e) => handleSalaryChange('cashAllowances', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="preDeductions">Pre-Tax Deductions (£)</Label>
                    <Input
                      id="preDeductions"
                      type="number"
                      value={salary.preDeductions}
                      onChange={(e) => handleSalaryChange('preDeductions', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postDeductions">Post-Tax Deductions (£)</Label>
                    <Input
                      id="postDeductions"
                      type="number"
                      value={salary.postDeductions}
                      onChange={(e) => handleSalaryChange('postDeductions', e.target.value)}
                    />
                  </div>
                </div>
                
                <Button onClick={handleCalculate} className="w-full">
                  Calculate Salary
                </Button>
              </div>
              
              {/* Results Section */}
              {salaryResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-medium text-gray-500">Monthly Take-Home</h3>
                        <div className="text-2xl font-bold mt-1">{formatCurrency(salaryResult.monthlyTakeHome)}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-medium text-gray-500">Annual Take-Home</h3>
                        <div className="text-2xl font-bold mt-1">{formatCurrency(salaryResult.annualTakeHome)}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Annual Gross Salary:</span>
                          <span className="font-medium">{formatCurrency(salaryResult.annualGross)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Income Tax:</span>
                          <span className="font-medium text-red-500">-{formatCurrency(salaryResult.incomeTax.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>National Insurance:</span>
                          <span className="font-medium text-red-500">-{formatCurrency(salaryResult.nationalInsurance.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pension Contribution:</span>
                          <span className="font-medium text-blue-500">-{formatCurrency(salaryResult.pension.annualContribution)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Deductions:</span>
                          <span className="font-medium text-red-500">-{formatCurrency(salary.postDeductions)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Annual Take-Home Pay:</span>
                          <span>{formatCurrency(salaryResult.annualTakeHome)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Effective Tax Rate:</span>
                          <span>{formatPercentage(salaryResult.effectiveTaxRate)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showDetails ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide Detailed Breakdown
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show Detailed Breakdown
                        </>
                      )}
                    </button>
                    
                    {showDetails && (
                      <Card className="mt-2">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">Income Tax</h4>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell>Personal Allowance (0%)</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.incomeTax.personalAllowance)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(0)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Basic Rate (20%)</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.incomeTax.basicRate.amount)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.incomeTax.basicRate.tax)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Higher Rate (40%)</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.incomeTax.higherRate.amount)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.incomeTax.higherRate.tax)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Additional Rate (45%)</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.incomeTax.additionalRate.amount)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.incomeTax.additionalRate.tax)}</TableCell>
                              </TableRow>
                              <TableRow className="font-medium">
                                <TableCell>Total Income Tax</TableCell>
                                <TableCell></TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.incomeTax.total)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          
                          <h4 className="font-medium mt-4 mb-2">National Insurance</h4>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell>Between £12,570 - £50,270 (12%)</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.nationalInsurance.primaryThreshold.amount)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.nationalInsurance.primaryThreshold.contribution)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Above £50,270 (2%)</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.nationalInsurance.upperEarningsLimit.amount)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.nationalInsurance.upperEarningsLimit.contribution)}</TableCell>
                              </TableRow>
                              <TableRow className="font-medium">
                                <TableCell>Total National Insurance</TableCell>
                                <TableCell></TableCell>
                                <TableCell className="text-right">{formatCurrency(salaryResult.nationalInsurance.total)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={saveForComparison} className="flex items-center">
                      <Copy className="h-4 w-4 mr-1" />
                      Compare with Another Salary
                    </Button>
                  </div>
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