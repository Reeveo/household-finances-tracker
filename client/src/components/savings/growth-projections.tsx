import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// Function to calculate compound interest
function calculateCompoundGrowth(principal: number, monthlyContribution: number, ratePercent: number, years: number) {
  const monthlyRate = ratePercent / 100 / 12;
  const totalMonths = years * 12;
  
  const data = Array(years + 1).fill(0).map((_, yearIndex) => {
    const monthsAtThisPoint = yearIndex * 12;
    let total = principal;
    
    for (let month = 0; month < monthsAtThisPoint; month++) {
      total = total * (1 + monthlyRate) + monthlyContribution;
    }
    
    return {
      year: `Year ${yearIndex}`,
      conservative: Math.round(principal * Math.pow(1 + 0.04, yearIndex) + 
        monthlyContribution * 12 * ((Math.pow(1 + 0.04, yearIndex) - 1) / 0.04) * (1 + 0.04)),
      moderate: Math.round(principal * Math.pow(1 + 0.07, yearIndex) + 
        monthlyContribution * 12 * ((Math.pow(1 + 0.07, yearIndex) - 1) / 0.07) * (1 + 0.07)),
      aggressive: Math.round(principal * Math.pow(1 + 0.10, yearIndex) + 
        monthlyContribution * 12 * ((Math.pow(1 + 0.10, yearIndex) - 1) / 0.10) * (1 + 0.10))
    };
  });
  
  return data;
}

export function GrowthProjections() {
  const [projectionPeriod, setProjectionPeriod] = useState("5");
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [returnRate, setReturnRate] = useState(7);
  const [data, setData] = useState<any[]>([]);
  
  // Recalculate projections when inputs change
  useEffect(() => {
    const principal = 45000; // Initial investment
    const years = parseInt(projectionPeriod);
    
    const projectionData = calculateCompoundGrowth(principal, monthlyContribution, returnRate, years);
    setData(projectionData);
  }, [projectionPeriod, monthlyContribution, returnRate]);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Savings Growth Projections</h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm">Projection Period:</label>
            <Select value={projectionPeriod} onValueChange={setProjectionPeriod}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Years</SelectItem>
                <SelectItem value="10">10 Years</SelectItem>
                <SelectItem value="15">15 Years</SelectItem>
                <SelectItem value="20">20 Years</SelectItem>
                <SelectItem value="25">25 Years</SelectItem>
                <SelectItem value="30">30 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
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
              <Line
                type="monotone"
                name="Conservative (4%)"
                dataKey="conservative"
                stroke="#0d9488"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                name="Moderate (7%)"
                dataKey="moderate"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                name="Aggressive (10%)"
                dataKey="aggressive"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 border border-border rounded-md bg-gray-50">
            <h4 className="font-medium mb-2">Conservative (4%)</h4>
            <div className="text-xl font-bold mb-1">£{data[parseInt(projectionPeriod)]?.conservative.toLocaleString() || '0'}</div>
            <div className="text-sm text-muted">After {projectionPeriod} years</div>
          </div>
          <div className="p-4 border border-border rounded-md bg-gray-50">
            <h4 className="font-medium mb-2">Moderate (7%)</h4>
            <div className="text-xl font-bold mb-1">£{data[parseInt(projectionPeriod)]?.moderate.toLocaleString() || '0'}</div>
            <div className="text-sm text-muted">After {projectionPeriod} years</div>
          </div>
          <div className="p-4 border border-border rounded-md bg-gray-50">
            <h4 className="font-medium mb-2">Aggressive (10%)</h4>
            <div className="text-xl font-bold mb-1">£{data[parseInt(projectionPeriod)]?.aggressive.toLocaleString() || '0'}</div>
            <div className="text-sm text-muted">After {projectionPeriod} years</div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Contribution</label>
              <div className="flex items-center">
                <span className="mr-2">£</span>
                <Slider
                  min={100}
                  max={2000}
                  step={50}
                  value={[monthlyContribution]}
                  onValueChange={(values) => setMonthlyContribution(values[0])}
                  className="flex-1"
                />
                <span className="ml-2">{monthlyContribution}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Return Rate (%)</label>
              <div className="flex items-center">
                <Slider
                  min={1}
                  max={15}
                  step={0.5}
                  value={[returnRate]}
                  onValueChange={(values) => setReturnRate(values[0])}
                  className="flex-1"
                />
                <span className="ml-2">{returnRate}%</span>
              </div>
            </div>
          </div>
          <Button 
            variant="secondary" 
            className="mt-4"
            onClick={() => {
              // Recalculation happens automatically via useEffect, but we could add additional logic here
              console.log("Recalculating with:", {monthlyContribution, returnRate, projectionPeriod});
            }}
          >
            Recalculate Projection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
