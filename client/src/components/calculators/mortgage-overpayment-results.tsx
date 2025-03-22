import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { OverpaymentData } from "./mortgage-overpayment-calculator";
import { useState, useEffect } from "react";

type MortgageOverpaymentResultsProps = {
  overpaymentData: OverpaymentData;
};

export function MortgageOverpaymentResults({ overpaymentData }: MortgageOverpaymentResultsProps) {
  const { 
    outstandingAmount,
    interestRate, 
    remainingTerm,
    monthlyPayment,
    monthlyOverpayment,
    annualLumpSum,
    interestSaved,
    termReduction
  } = overpaymentData;
  
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate chart data for loan balance with and without overpayments
    const monthlyInterestRate = interestRate / 100 / 12;
    const monthlyLumpSum = annualLumpSum / 12;
    
    const data = [];
    let standardBalance = outstandingAmount;
    let overpaymentBalance = outstandingAmount;
    
    for (let year = 0; year <= remainingTerm; year++) {
      // For standard repayment
      if (standardBalance > 0) {
        for (let month = 0; month < 12; month++) {
          if (standardBalance <= 0) break;
          
          const interestThisMonth = standardBalance * monthlyInterestRate;
          const principalThisMonth = monthlyPayment - interestThisMonth;
          standardBalance -= principalThisMonth;
          
          if (standardBalance < 0) standardBalance = 0;
        }
      }
      
      // For overpayment
      if (overpaymentBalance > 0) {
        for (let month = 0; month < 12; month++) {
          if (overpaymentBalance <= 0) break;
          
          const interestThisMonth = overpaymentBalance * monthlyInterestRate;
          const principalThisMonth = monthlyPayment - interestThisMonth + monthlyOverpayment + monthlyLumpSum;
          overpaymentBalance -= principalThisMonth;
          
          if (overpaymentBalance < 0) overpaymentBalance = 0;
        }
      }
      
      data.push({
        year: `Year ${year}`,
        standard: Math.round(standardBalance),
        overpayment: Math.round(overpaymentBalance)
      });
    }
    
    setChartData(data);
  }, [overpaymentData]);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4">Overpayment Impact</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted mb-1">Interest Saved</div>
              <div className="text-2xl font-bold text-success">£{Math.round(interestSaved).toLocaleString()}</div>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted mb-1">Term Reduction</div>
              <div className="text-2xl font-bold">{termReduction}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Mortgage Balance Comparison</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis
                    tickFormatter={(value) => `£${value/1000}k`}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value) => [`£${parseInt(value as string).toLocaleString()}`, ""]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    name="Without Overpayments"
                    dataKey="standard"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    name="With Overpayments"
                    dataKey="overpayment"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center space-x-4 mt-2 justify-center">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span className="text-sm text-muted">Without Overpayments</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-sm text-muted">With Overpayments</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
