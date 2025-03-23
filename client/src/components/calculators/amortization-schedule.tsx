import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Download, FileText, Printer, Calendar, BarChart3 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from "recharts";
import { useState, useEffect, useMemo } from "react";
import { MortgageData } from "./mortgage-calculator";

type AmortizationScheduleProps = {
  mortgageData: MortgageData;
};

type YearlyData = {
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPrincipalPaid: number; // Cumulative
  totalInterestPaid: number; // Cumulative
  remainingBalance: number;
  paymentDate: string; // End of year date
};

type ChartViewType = "balance" | "payments" | "cumulative" | "ratio";

export function AmortizationSchedule({ mortgageData }: AmortizationScheduleProps) {
  const { 
    loanAmount, 
    interestRate, 
    loanTerm,
    monthlyPayment,
    startDate,
    repaymentType,
    mortgageType
  } = mortgageData;
  
  const [amortizationData, setAmortizationData] = useState<YearlyData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [yearViewMode, setYearViewMode] = useState<"all" | "five" | "ten">("five");
  const [chartView, setChartView] = useState<ChartViewType>("balance");
  const rowsPerPage = 5;
  
  useEffect(() => {
    calculateAmortizationSchedule();
  }, [mortgageData]);
  
  function calculateAmortizationSchedule() {
    if (!loanAmount || !interestRate || !loanTerm || !monthlyPayment) return;

    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const startDateObj = new Date(startDate);
    
    let balance = loanAmount;
    const yearlyData: YearlyData[] = [];
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;
    
    // For interest-only mortgages
    const isInterestOnly = repaymentType === "interest-only";

    for (let year = 1; year <= loanTerm; year++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      
      for (let month = 1; month <= 12; month++) {
        const interestPayment = balance * monthlyInterestRate;
        
        let principalPayment;
        if (isInterestOnly) {
          // For interest-only, principal is only paid in the final year
          principalPayment = (year === loanTerm && month === 12) ? balance : 0;
        } else {
          principalPayment = monthlyPayment - interestPayment;
        }
        
        yearPrincipal += principalPayment;
        yearInterest += interestPayment;
        balance -= principalPayment;
        
        if (balance < 0) balance = 0;
      }
      
      cumulativePrincipal += yearPrincipal;
      cumulativeInterest += yearInterest;
      
      // Calculate the end date for this year
      const yearEndDate = new Date(startDateObj);
      yearEndDate.setFullYear(yearEndDate.getFullYear() + year);
      
      yearlyData.push({
        year,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        totalPrincipalPaid: cumulativePrincipal,
        totalInterestPaid: cumulativeInterest,
        remainingBalance: balance,
        paymentDate: yearEndDate.toLocaleDateString('en-GB', {
          month: 'short',
          year: 'numeric'
        })
      });
    }
    
    setAmortizationData(yearlyData);
  }
  
  // Filter data based on view mode
  const filteredData = useMemo(() => {
    if (yearViewMode === "all") return amortizationData;
    const years = yearViewMode === "five" ? 5 : 10;
    return amortizationData.slice(0, years);
  }, [amortizationData, yearViewMode]);
  
  // Chart data preparation
  const chartData = useMemo(() => {
    // Transform data for different chart views
    switch(chartView) {
      case "balance":
        return filteredData.map(d => ({
          year: d.year,
          balance: Math.round(d.remainingBalance),
          date: d.paymentDate
        }));
      case "payments":
        return filteredData.map(d => ({
          year: d.year,
          principal: Math.round(d.principalPaid),
          interest: Math.round(d.interestPaid),
          date: d.paymentDate
        }));
      case "cumulative":
        return filteredData.map(d => ({
          year: d.year,
          principal: Math.round(d.totalPrincipalPaid),
          interest: Math.round(d.totalInterestPaid),
          date: d.paymentDate
        }));
      case "ratio":
        return filteredData.map(d => ({
          year: d.year,
          principalRatio: Math.round((d.totalPrincipalPaid / (d.totalPrincipalPaid + d.totalInterestPaid)) * 100),
          interestRatio: Math.round((d.totalInterestPaid / (d.totalPrincipalPaid + d.totalInterestPaid)) * 100),
          date: d.paymentDate
        }));
      default:
        return [];
    }
  }, [filteredData, chartView]);
  
  // Pagination
  const totalPages = Math.ceil(amortizationData.length / rowsPerPage);
  const displayData = amortizationData.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Amortization Schedule</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="table" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Visualization
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="table">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/10 text-sm text-muted-foreground border-b border-border">
                    <th className="text-left font-medium p-2">Year</th>
                    <th className="text-left font-medium p-2">Date</th>
                    <th className="text-left font-medium p-2">Principal Paid</th>
                    <th className="text-left font-medium p-2">Interest Paid</th>
                    <th className="text-left font-medium p-2">Total Paid</th>
                    <th className="text-left font-medium p-2">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayData.map((row) => (
                    <tr key={row.year} className="hover:bg-muted/5">
                      <td className="p-2 text-sm">{row.year}</td>
                      <td className="p-2 text-sm">{row.paymentDate}</td>
                      <td className="p-2 text-sm">£{Math.round(row.principalPaid).toLocaleString()}</td>
                      <td className="p-2 text-sm">£{Math.round(row.interestPaid).toLocaleString()}</td>
                      <td className="p-2 text-sm">£{Math.round(row.principalPaid + row.interestPaid).toLocaleString()}</td>
                      <td className="p-2 text-sm">£{Math.round(row.remainingBalance).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage + 1} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chart">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="flex gap-2 items-center">
                  <span className="text-sm">Chart Type:</span>
                  <Select
                    value={chartView}
                    onValueChange={(value: ChartViewType) => setChartView(value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balance">Balance Over Time</SelectItem>
                      <SelectItem value="payments">Annual Payments</SelectItem>
                      <SelectItem value="cumulative">Cumulative Totals</SelectItem>
                      <SelectItem value="ratio">Payment Ratio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 items-center">
                  <span className="text-sm">Show Years:</span>
                  <Select
                    value={yearViewMode}
                    onValueChange={(value: "all" | "five" | "ten") => setYearViewMode(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="five">First 5 Years</SelectItem>
                      <SelectItem value="ten">First 10 Years</SelectItem>
                      <SelectItem value="all">All Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="h-80 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartView === "balance" ? (
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 25 }}>
                      <defs>
                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }} 
                      />
                      <YAxis 
                        tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} 
                        label={{ value: 'Balance', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`£${Number(value).toLocaleString()}`, 'Remaining Balance']}
                        labelFormatter={(label: any) => `Year ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#4f46e5" 
                        fillOpacity={1} 
                        fill="url(#balanceGradient)" 
                        name="Remaining Balance"
                      />
                    </AreaChart>
                  ) : chartView === "ratio" ? (
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }} 
                      />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip 
                        formatter={(value: any) => [`${value}%`, undefined]}
                        labelFormatter={(label: any) => `Year ${label}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="principalRatio" 
                        stackId="1" 
                        stroke="#4f46e5" 
                        fill="#4f46e5" 
                        name="Principal %"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="interestRatio" 
                        stackId="1" 
                        stroke="#f97316" 
                        fill="#f97316" 
                        name="Interest %"
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }} 
                      />
                      <YAxis 
                        tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} 
                        label={{ value: 'Amount (£)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`£${Number(value).toLocaleString()}`, undefined]}
                        labelFormatter={(label: any) => `Year ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="principal" 
                        stroke="#4f46e5" 
                        activeDot={{ r: 8 }} 
                        name="Principal"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="interest" 
                        stroke="#f97316" 
                        name="Interest"
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
              
              <div className="text-sm text-muted-foreground mt-2">
                {chartView === "balance" && "This chart shows how your mortgage balance decreases over time."}
                {chartView === "payments" && "This chart shows the breakdown of your annual payments into principal and interest."}
                {chartView === "cumulative" && "This chart shows the cumulative total of principal and interest paid over time."}
                {chartView === "ratio" && "This chart shows the ratio of principal to interest in your total payment amount."}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
