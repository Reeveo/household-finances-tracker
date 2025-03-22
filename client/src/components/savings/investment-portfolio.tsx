import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Sample data
const portfolioData = [
  { name: "Stocks", value: 24500 },
  { name: "Bonds", value: 10000 },
  { name: "ETFs", value: 15730 },
  { name: "Crypto", value: 4000 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function InvestmentPortfolio() {
  const totalInvested = 45850;
  const currentValue = 54230;
  const totalReturn = ((currentValue - totalInvested) / totalInvested * 100).toFixed(1);
  const annualReturn = "7.2";

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-border rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}: £${payload[0].value.toLocaleString()}`}</p>
          <p className="text-xs text-muted-foreground">
            {`${(payload[0].value / portfolioData.reduce((sum, entry) => sum + entry.value, 0) * 100).toFixed(1)}% of portfolio`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Investment Portfolio</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="text-xs text-muted">Total Invested</div>
            <div className="text-lg font-semibold">£{totalInvested.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Current Value</div>
            <div className="text-lg font-semibold">£{currentValue.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Total Return</div>
            <div className="text-lg font-semibold text-success">+{totalReturn}%</div>
          </div>
          <div>
            <div className="text-xs text-muted">Annual Return</div>
            <div className="text-lg font-semibold text-success">+{annualReturn}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
