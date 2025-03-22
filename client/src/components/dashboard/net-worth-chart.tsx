import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data
const netWorthData = [
  { month: 'Jan', Assets: 110000, Liabilities: 42000, NetWorth: 68000 },
  { month: 'Feb', Assets: 112500, Liabilities: 41500, NetWorth: 71000 },
  { month: 'Mar', Assets: 115000, Liabilities: 41000, NetWorth: 74000 },
  { month: 'Apr', Assets: 118000, Liabilities: 40500, NetWorth: 77500 },
  { month: 'May', Assets: 121000, Liabilities: 40000, NetWorth: 81000 },
  { month: 'Jun', Assets: 123500, Liabilities: 39500, NetWorth: 84000 },
  { month: 'Jul', Assets: 126000, Liabilities: 39000, NetWorth: 87000 },
  { month: 'Aug', Assets: 128750, Liabilities: 38500, NetWorth: 90250 },
];

export function NetWorthChart() {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Net Worth Changes</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="text-sm text-muted">Assets</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-sm text-muted">Liabilities</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span className="text-sm text-muted">Net Worth</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={netWorthData}
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
                tickFormatter={(value) => `£${value/1000}k`}
                width={60}
              />
              <Tooltip 
                formatter={(value) => [`£${value}`, ""]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="Assets"
                stroke="#0d9488"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="Liabilities"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="NetWorth"
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
