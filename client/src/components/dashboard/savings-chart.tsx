import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

// Sample data
const savingsData = {
  "6 Months": [
    { month: 'Jan', Savings: 8500, Investments: 15200 },
    { month: 'Feb', Savings: 9200, Investments: 16800 },
    { month: 'Mar', Savings: 9850, Investments: 18500 },
    { month: 'Apr', Savings: 10400, Investments: 20400 },
    { month: 'May', Savings: 11200, Investments: 22800 },
    { month: 'Jun', Savings: 12000, Investments: 24500 },
  ],
  "1 Year": [
    { month: 'Jul', Savings: 7500, Investments: 13000 },
    { month: 'Aug', Savings: 7800, Investments: 13900 },
    { month: 'Sep', Savings: 8000, Investments: 14300 },
    { month: 'Oct', Savings: 8200, Investments: 14800 },
    { month: 'Nov', Savings: 8350, Investments: 15000 },
    { month: 'Dec', Savings: 8450, Investments: 15100 },
    { month: 'Jan', Savings: 8500, Investments: 15200 },
    { month: 'Feb', Savings: 9200, Investments: 16800 },
    { month: 'Mar', Savings: 9850, Investments: 18500 },
    { month: 'Apr', Savings: 10400, Investments: 20400 },
    { month: 'May', Savings: 11200, Investments: 22800 },
    { month: 'Jun', Savings: 12000, Investments: 24500 },
  ],
  "5 Years": [
    { month: '2019', Savings: 5000, Investments: 8000 },
    { month: '2020', Savings: 7000, Investments: 12000 },
    { month: '2021', Savings: 9000, Investments: 16000 },
    { month: '2022', Savings: 11000, Investments: 20000 },
    { month: '2023', Savings: 12000, Investments: 24500 },
  ]
};

export function SavingsChart() {
  const [timeRange, setTimeRange] = useState("6 Months");
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Savings & Investment Trends</h3>
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6 Months">6 Months</SelectItem>
              <SelectItem value="1 Year">1 Year</SelectItem>
              <SelectItem value="5 Years">5 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={savingsData[timeRange as keyof typeof savingsData]}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => `£${value}`}
                width={60}
              />
              <Tooltip 
                formatter={(value) => [`£${value}`, ""]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="Savings"
                stroke="#0d9488"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="Investments"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
