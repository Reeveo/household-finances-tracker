import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PieChart, Pie } from "recharts";

// Enhanced sample data with additional analytics
const monthlySpendingData = [
  { month: 'Jan', Essentials: 1250, Lifestyle: 850, Savings: 400, Total: 2500 },
  { month: 'Feb', Essentials: 1180, Lifestyle: 780, Savings: 450, Total: 2410 },
  { month: 'Mar', Essentials: 1320, Lifestyle: 920, Savings: 400, Total: 2640 },
  { month: 'Apr', Essentials: 1280, Lifestyle: 980, Savings: 380, Total: 2640 },
  { month: 'May', Essentials: 1350, Lifestyle: 1050, Savings: 420, Total: 2820 },
  { month: 'Jun', Essentials: 1420, Lifestyle: 1100, Savings: 400, Total: 2920 }
];

// Subcategory breakdown for current month
const subcategoryData = [
  { name: "Housing", value: 850, category: "Essentials" },
  { name: "Utilities", value: 220, category: "Essentials" },
  { name: "Groceries", value: 350, category: "Essentials" },
  { name: "Dining Out", value: 380, category: "Lifestyle" },
  { name: "Entertainment", value: 240, category: "Lifestyle" },
  { name: "Shopping", value: 280, category: "Lifestyle" },
  { name: "Travel", value: 200, category: "Lifestyle" },
  { name: "Emergency Fund", value: 250, category: "Savings" },
  { name: "Investments", value: 150, category: "Savings" },
];

// Category colors with consistent mapping
const CATEGORY_COLORS = {
  Essentials: "#3b82f6", // Blue
  Lifestyle: "#22c55e", // Green
  Savings: "#8b5cf6",   // Purple
};

// Generate subcategory colors based on main category color
const SUBCATEGORY_COLORS = {
  Housing: "#4b91f7",
  Utilities: "#2a75f5",
  Groceries: "#1a65e5",
  "Dining Out": "#32d56e",
  Entertainment: "#22b54e",
  Shopping: "#12952e",
  Travel: "#02750e",
  "Emergency Fund": "#9b6cf7",
  Investments: "#7b4cf7",
};

export function MonthlySpendingChart() {
  const [timeRange, setTimeRange] = useState("6 Months");
  const [viewType, setViewType] = useState("bar");
  const [selectedMonth, setSelectedMonth] = useState("Jun");
  
  const categories = useMemo(() => [
    { name: "Essentials", color: CATEGORY_COLORS.Essentials },
    { name: "Lifestyle", color: CATEGORY_COLORS.Lifestyle },
    { name: "Savings", color: CATEGORY_COLORS.Savings }
  ], []);
  
  // Calculate trends and insights
  const lastMonthData = monthlySpendingData[monthlySpendingData.length - 1];
  const previousMonthData = monthlySpendingData[monthlySpendingData.length - 2];
  
  const trends = useMemo(() => {
    return categories.map(category => {
      const currentValue = lastMonthData[category.name];
      const previousValue = previousMonthData[category.name];
      const change = ((currentValue - previousValue) / previousValue) * 100;
      const percentOfTotal = (currentValue / lastMonthData.Total) * 100;
      
      return {
        category: category.name,
        currentValue,
        previousValue,
        change: change.toFixed(1),
        percentOfTotal: percentOfTotal.toFixed(1),
        isIncreasing: change > 0,
        color: category.color
      };
    });
  }, [categories]);
  
  // Filter subcategory data for pie chart based on selected month (in a real app, this would be dynamic)
  const currentMonthSubcategories = subcategoryData;
  
  // Custom tooltip component for better visualization
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-semibold">{label}</p>
          <div className="space-y-1.5 mt-1.5">
            {payload.map((entry) => (
              <div key={entry.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">
                  {entry.name}: £{entry.value}
                </span>
              </div>
            ))}
            {payload.length > 1 && (
              <div className="border-t border-border mt-1.5 pt-1.5">
                <div className="text-sm font-semibold">
                  Total: £{payload.reduce((sum, entry) => sum + entry.value, 0)}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold">Spending Breakdown</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs defaultValue="bar" className="h-8" onValueChange={setViewType}>
              <TabsList className="grid grid-cols-2 h-8">
                <TabsTrigger value="bar" className="text-xs px-2">Bar Chart</TabsTrigger>
                <TabsTrigger value="pie" className="text-xs px-2">Pie Chart</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select defaultValue="6 Months" onValueChange={setTimeRange}>
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3 Months">3 Months</SelectItem>
                <SelectItem value="6 Months">6 Months</SelectItem>
                <SelectItem value="1 Year">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mb-2 flex flex-wrap gap-2">
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
        
        {viewType === "bar" ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlySpendingData}
                margin={{
                  top: 20,
                  right: 5,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `£${value}`}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {categories.map((category) => (
                  <Bar 
                    key={category.name} 
                    dataKey={category.name} 
                    stackId="a" 
                    fill={category.color}
                    name={category.name}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            <div className="flex-1">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentMonthSubcategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={1}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {currentMonthSubcategories.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={SUBCATEGORY_COLORS[entry.name] || CATEGORY_COLORS[entry.category]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`£${value}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="flex-1 mt-4 md:mt-0 md:ml-4">
              <h4 className="text-sm font-medium mb-2">June Spending Analysis</h4>
              <div className="text-xs text-muted-foreground mb-2">
                Compare how current spending in each category has changed from last month
              </div>
              <div className="space-y-3">
                {trends.map((trend) => (
                  <div key={trend.category} className="border border-border rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{trend.category}</span>
                      <Badge 
                        variant="outline"
                        className={trend.isIncreasing ? "text-destructive border-destructive" : "text-success border-success"}
                      >
                        {trend.isIncreasing ? "+" : ""}{trend.change}%
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <span className="text-muted-foreground text-xs">
                        £{trend.currentValue} ({trend.percentOfTotal}% of total)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-5 py-3 border-t flex justify-between">
        <div className="text-xs text-muted-foreground">
          {viewType === "bar" ? "Showing spending by category over time" : "Showing detailed breakdown for June"}
        </div>
        <Button variant="link" size="sm" className="text-xs p-0 h-auto">
          View full analysis
        </Button>
      </CardFooter>
    </Card>
  );
}
