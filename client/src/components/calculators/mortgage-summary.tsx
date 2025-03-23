import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { MortgageData } from "./mortgage-calculator";
import { AlertCircle, Home, Calendar, Percent, TrendingUp } from "lucide-react";

type MortgageSummaryProps = {
  mortgageData: MortgageData;
};

export function MortgageSummary({ mortgageData }: MortgageSummaryProps) {
  const { 
    loanAmount,
    propertyValue, 
    monthlyPayment, 
    totalInterest, 
    totalPayments,
    endDate,
    mortgageType,
    repaymentType,
    ltv,
    loanTerm,
    interestRate
  } = mortgageData;
  
  // Data for the pie chart
  const breakdownData = [
    { name: "Principal", value: loanAmount, color: "#4f46e5" },
    { name: "Interest", value: totalInterest, color: "#f97316" }
  ];
  
  // Data for the yearly costs chart (simplified for this example)
  const yearlyData = Array.from({ length: 5 }, (_, i) => ({
    year: `Year ${i + 1}`,
    principal: Math.round((loanAmount / loanTerm) * 0.9 * (1 + (i * 0.02))),
    interest: Math.round(totalInterest / loanTerm * (1 - (i * 0.05)))
  }));

  // Get mortgage type label
  const getMortgageTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      "fixed": "Fixed Rate",
      "variable": "Variable Rate",
      "tracker": "Tracker",
      "discount": "Discount",
      "offset": "Offset"
    };
    return types[type] || type;
  };

  // Get repayment type label
  const getRepaymentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      "repayment": "Capital Repayment",
      "interest-only": "Interest Only",
      "part-and-part": "Part & Part"
    };
    return types[type] || type;
  };

  // Get LTV badge color based on value
  const getLtvBadgeColor = (ltv: number) => {
    if (ltv <= 60) return "bg-green-100 text-green-800";
    if (ltv <= 75) return "bg-blue-100 text-blue-800";
    if (ltv <= 85) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-border rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}: £${payload[0].value.toLocaleString()}`}</p>
          <p className="text-xs text-muted-foreground">
            {`${(payload[0].value / totalPayments * 100).toFixed(1)}% of total`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Mortgage Summary</CardTitle>
          <div className="flex space-x-2">
            <Badge variant="outline" className="capitalize flex gap-1 items-center">
              <Home className="h-3 w-3" />
              {getMortgageTypeLabel(mortgageType)}
            </Badge>
            <Badge variant="outline" className="capitalize flex gap-1 items-center">
              <TrendingUp className="h-3 w-3" />
              {getRepaymentTypeLabel(repaymentType)}
            </Badge>
            <Badge className={`capitalize flex gap-1 items-center ${getLtvBadgeColor(ltv)}`}>
              <Percent className="h-3 w-3" />
              {ltv.toFixed(1)}% LTV
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-0">
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted-foreground mb-1">Monthly Payment</div>
              <div className="text-2xl font-bold">£{monthlyPayment.toFixed(2)}</div>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted-foreground mb-1">Interest Rate</div>
              <div className="text-2xl font-bold">{interestRate.toFixed(2)}%</div>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted-foreground mb-1">Loan Amount</div>
              <div className="text-2xl font-bold">£{loanAmount.toLocaleString()}</div>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted-foreground mb-1">Property Value</div>
              <div className="text-2xl font-bold">£{propertyValue.toLocaleString()}</div>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted-foreground mb-1">Total Interest</div>
              <div className="text-2xl font-bold">£{totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted-foreground mb-1">Total Payments</div>
              <div className="text-2xl font-bold">£{totalPayments.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted-foreground mb-1">Term Length</div>
              <div className="text-2xl font-bold">{loanTerm} years</div>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>End Date</span>
              </div>
              <div className="text-2xl font-bold">{endDate}</div>
            </div>
          </div>
          
          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="breakdown">Payment Breakdown</TabsTrigger>
              <TabsTrigger value="yearly">Yearly Costs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="breakdown" className="space-y-4 pt-4">
              {repaymentType === "interest-only" && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center text-sm mb-3">
                  <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                  <p>With interest-only mortgages, you'll need to repay the £{loanAmount.toLocaleString()} principal at the end of the term.</p>
                </div>
              )}
              
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100">
                  <div className="text-sm text-muted-foreground">Principal</div>
                  <div className="text-xl font-semibold text-indigo-700">£{loanAmount.toLocaleString()}</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-md border border-orange-100">
                  <div className="text-sm text-muted-foreground">Interest</div>
                  <div className="text-xl font-semibold text-orange-700">£{totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="yearly" className="pt-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={yearlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `£${value.toLocaleString()}`} />
                    <Tooltip 
                      formatter={(value: number) => [`£${value.toLocaleString()}`, undefined]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                    <Bar name="Principal Repayment" dataKey="principal" fill="#4f46e5" />
                    <Bar name="Interest Payment" dataKey="interest" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: This is a simplified view of the first 5 years. See the amortization schedule for the full breakdown.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
