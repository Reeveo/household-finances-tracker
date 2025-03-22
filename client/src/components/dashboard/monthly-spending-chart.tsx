import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

// Sample data
const monthlySpendingData = [
  { month: 'Jan', Essentials: 1250, Lifestyle: 850, Savings: 400 },
  { month: 'Feb', Essentials: 1180, Lifestyle: 780, Savings: 450 },
  { month: 'Mar', Essentials: 1320, Lifestyle: 920, Savings: 400 },
  { month: 'Apr', Essentials: 1280, Lifestyle: 980, Savings: 380 },
  { month: 'May', Essentials: 1350, Lifestyle: 1050, Savings: 420 },
  { month: 'Jun', Essentials: 1420, Lifestyle: 1100, Savings: 400 },
];

export function MonthlySpendingChart() {
  const categories = useMemo(() => [
    { name: "Essentials", color: "#3b82f6" },
    { name: "Lifestyle", color: "#22c55e" },
    { name: "Savings", color: "#8b5cf6" }
  ], []);
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Monthly Spending Breakdown</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge 
                key={category.name}
                variant="outline"
                className="bg-opacity-20"
                style={{ 
                  backgroundColor: `${category.color}20`, 
                  color: category.color,
                  borderColor: category.color
                }}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlySpendingData}
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
              {categories.map((category) => (
                <Bar 
                  key={category.name} 
                  dataKey={category.name} 
                  stackId="a" 
                  fill={category.color} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
