import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CheckCircle } from "lucide-react";
import { PensionData } from "./pension-calculator";
import { useState, useEffect } from "react";

type PensionResultsProps = {
  pensionData: PensionData;
};

export function PensionResults({ pensionData }: PensionResultsProps) {
  const {
    currentAge,
    retirementAge,
    currentPension,
    annualReturn,
    monthlyContribution,
    employerContribution,
    estimatedPensionPot,
    estimatedAnnualIncome,
    isOnTrack
  } = pensionData;
  
  const [projectionData, setProjectionData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate pension projection data
    const data = [];
    const yearsToRetirement = retirementAge - currentAge;
    const totalMonthlyContribution = monthlyContribution + employerContribution;
    
    let runningPension = currentPension;
    for (let year = 0; year <= yearsToRetirement; year++) {
      // Add contributions for the year
      runningPension += totalMonthlyContribution * 12;
      
      // Apply growth
      runningPension *= (1 + annualReturn / 100);
      
      data.push({
        age: currentAge + year,
        pensionValue: Math.round(runningPension)
      });
    }
    
    setProjectionData(data);
  }, [pensionData]);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4">Pension Projection</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted mb-1">Estimated Pension Pot</div>
              <div className="text-2xl font-bold">£{estimatedPensionPot.toLocaleString()}</div>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-gray-50">
              <div className="text-sm text-muted mb-1">Estimated Annual Income</div>
              <div className="text-2xl font-bold">£{estimatedAnnualIncome.toLocaleString()}</div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Pension Growth Projection</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={projectionData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="age" 
                    label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `£${value/1000}k`}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value) => [`£${parseInt(value as string).toLocaleString()}`, ""]}
                    labelFormatter={(label) => `Age: ${label}`}
                  />
                  <Line
                    type="monotone"
                    name="Pension Value"
                    dataKey="pensionValue"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className={`flex items-center justify-between p-4 border rounded-md ${
            isOnTrack 
              ? "border-success/30 bg-success/10" 
              : "border-destructive/30 bg-destructive/10"
          }`}>
            <div className="flex items-center">
              {isOnTrack ? (
                <>
                  <CheckCircle className="w-6 h-6 text-success mr-2" />
                  <span className="font-medium">You're on track to meet your retirement goals!</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 text-destructive mr-2" />
                  <span className="font-medium">You may need to increase your pension contributions.</span>
                </>
              )}
            </div>
            <button className="text-xs text-secondary font-medium hover:underline">See Details</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
