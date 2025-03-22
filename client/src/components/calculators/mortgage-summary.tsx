import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { MortgageData } from "./mortgage-calculator";

type MortgageSummaryProps = {
  mortgageData: MortgageData;
};

export function MortgageSummary({ mortgageData }: MortgageSummaryProps) {
  const { 
    loanAmount, 
    monthlyPayment, 
    totalInterest, 
    totalPayments,
    endDate
  } = mortgageData;
  
  // Data for the pie chart
  const breakdownData = [
    { name: "Principal", value: loanAmount },
    { name: "Interest", value: totalInterest }
  ];
  
  const COLORS = ['#0088FE', '#FF8042'];

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
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4">Mortgage Summary</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted mb-1">Monthly Payment</div>
              <div className="text-2xl font-bold">£{monthlyPayment.toFixed(2)}</div>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted mb-1">Total Interest</div>
              <div className="text-2xl font-bold">£{totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted mb-1">Total Payments</div>
              <div className="text-2xl font-bold">£{totalPayments.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted mb-1">Mortgage End Date</div>
              <div className="text-xl font-bold">{endDate}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Payment Breakdown</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
