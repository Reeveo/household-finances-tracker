import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ComposedChart,
  Area,
  Legend,
  ReferenceLine
} from "recharts";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Enhanced sample data with growth rate and projections
const netWorthData = [
  { month: 'Jan', Assets: 110000, Liabilities: 42000, NetWorth: 68000, Growth: 0 },
  { month: 'Feb', Assets: 112500, Liabilities: 41500, NetWorth: 71000, Growth: 4.4 },
  { month: 'Mar', Assets: 115000, Liabilities: 41000, NetWorth: 74000, Growth: 4.2 },
  { month: 'Apr', Assets: 118000, Liabilities: 40500, NetWorth: 77500, Growth: 4.7 },
  { month: 'May', Assets: 121000, Liabilities: 40000, NetWorth: 81000, Growth: 4.5 },
  { month: 'Jun', Assets: 123500, Liabilities: 39500, NetWorth: 84000, Growth: 3.7 },
  { month: 'Jul', Assets: 126000, Liabilities: 39000, NetWorth: 87000, Growth: 3.6 },
  { month: 'Aug', Assets: 128750, Liabilities: 38500, NetWorth: 90250, Growth: 3.7 },
  // Projected data
  { month: 'Sep', Assets: 131500, Liabilities: 38000, NetWorth: 93500, Growth: 3.6, isProjected: true },
  { month: 'Oct', Assets: 134000, Liabilities: 37500, NetWorth: 96500, Growth: 3.2, isProjected: true },
  { month: 'Nov', Assets: 136500, Liabilities: 37000, NetWorth: 99500, Growth: 3.1, isProjected: true },
  { month: 'Dec', Assets: 139000, Liabilities: 36500, NetWorth: 102500, Growth: 3.0, isProjected: true },
];

// Asset breakdown data
const assetBreakdown = [
  { name: "Cash", value: 22000, percentage: 17.1 },
  { name: "Investments", value: 46750, percentage: 36.3 },
  { name: "Property", value: 45000, percentage: 35.0 },
  { name: "Pension", value: 15000, percentage: 11.6 },
];

// Liability breakdown data
const liabilityBreakdown = [
  { name: "Mortgage", value: 32000, percentage: 83.1 },
  { name: "Credit Cards", value: 2500, percentage: 6.5 },
  { name: "Loans", value: 4000, percentage: 10.4 },
];

export function NetWorthChart() {
  const [timeRange, setTimeRange] = useState("1 Year");
  const [chartType, setChartType] = useState("standard");
  const [showProjections, setShowProjections] = useState(true);
  
  // Calculate growth metrics
  const currentNetWorth = netWorthData[7].NetWorth;
  const startNetWorth = netWorthData[0].NetWorth;
  const totalGrowth = ((currentNetWorth - startNetWorth) / startNetWorth) * 100;
  const avgMonthlyGrowth = totalGrowth / 7; // 7 months of historical data
  
  // Filter data based on projections toggle
  const displayData = showProjections 
    ? netWorthData 
    : netWorthData.filter(item => !item.isProjected);
    
  // Custom tooltip for better visualization
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isProjected = data.isProjected;
      
      return (
        <div className="bg-background border border-border p-4 rounded-md shadow-md">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{label}</p>
            {isProjected && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                Projected
              </Badge>
            )}
          </div>
          
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Assets:</span>
              <span className="text-sm font-medium">£{(data.Assets).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Liabilities:</span>
              <span className="text-sm font-medium">£{(data.Liabilities).toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium">Net Worth:</span>
                <span className="text-sm font-semibold">£{(data.NetWorth).toLocaleString()}</span>
              </div>
              {data.Growth > 0 && (
                <div className="flex items-center justify-between gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">Monthly Growth:</span>
                  <span className="text-xs text-success flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {data.Growth}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <CardTitle className="text-lg flex flex-wrap items-center gap-1.5">
              Net Worth Trend
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Net worth is calculated as your total assets minus your total liabilities.
                      Projections are based on your current growth rate.
                    </p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </CardTitle>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={chartType} onValueChange={setChartType} className="h-8">
              <TabsList className="grid grid-cols-2 h-8">
                <TabsTrigger value="standard" className="text-xs px-2">Line Chart</TabsTrigger>
                <TabsTrigger value="area" className="text-xs px-2">Area Chart</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6 Months">6 Months</SelectItem>
                <SelectItem value="1 Year">1 Year</SelectItem>
                <SelectItem value="3 Years">3 Years</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => setShowProjections(!showProjections)}
            >
              {showProjections ? "Hide Projections" : "Show Projections"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-2">
        <div className="space-y-4">
          {/* Summary metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/20 rounded-md p-3">
              <div className="text-sm text-muted-foreground">Current Net Worth</div>
              <div className="text-xl font-bold mt-1">£{currentNetWorth.toLocaleString()}</div>
            </div>
            
            <div className="bg-muted/20 rounded-md p-3">
              <div className="text-sm text-muted-foreground">YTD Growth</div>
              <div className="text-xl font-bold mt-1 flex items-center text-success">
                <TrendingUp className="w-4 h-4 mr-1" />
                {totalGrowth.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-md p-3">
              <div className="text-sm text-muted-foreground">Monthly Avg</div>
              <div className="text-xl font-bold mt-1 flex items-center text-success">
                <TrendingUp className="w-4 h-4 mr-1" />
                {avgMonthlyGrowth.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-md p-3">
              <div className="text-sm text-muted-foreground">Projected EOY</div>
              <div className="text-xl font-bold mt-1">£{netWorthData[11].NetWorth.toLocaleString()}</div>
            </div>
          </div>
          
          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "standard" ? (
                <LineChart
                  data={displayData}
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
                    tickFormatter={(value) => `£${value/1000}k`}
                    width={45}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  {showProjections && (
                    <ReferenceLine 
                      x="Aug" 
                      stroke="#888"
                      strokeDasharray="3 3"
                      label={{ value: 'Current', position: 'insideTop', fill: '#888', fontSize: 12 }}
                    />
                  )}
                  
                  <Line
                    type="monotone"
                    dataKey="Assets"
                    name="Assets"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="Liabilities"
                    name="Liabilities"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="NetWorth"
                    name="Net Worth"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              ) : (
                <ComposedChart
                  data={displayData}
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
                    tickFormatter={(value) => `£${value/1000}k`}
                    width={45}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  {showProjections && (
                    <ReferenceLine 
                      x="Aug" 
                      stroke="#888" 
                      strokeDasharray="3 3"
                      label={{ value: 'Current', position: 'insideTop', fill: '#888', fontSize: 12 }}
                    />
                  )}
                  
                  <Area
                    type="monotone"
                    dataKey="Assets"
                    name="Assets"
                    fill="#0d948820"
                    stroke="#0d9488"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Liabilities"
                    name="Liabilities"
                    fill="#ef444420"
                    stroke="#ef4444"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="NetWorth"
                    name="Net Worth"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {/* Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <h4 className="text-sm font-medium mb-2">Asset Breakdown</h4>
              <div className="space-y-2">
                {assetBreakdown.map((asset) => (
                  <div key={asset.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span className="text-sm">{asset.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{asset.percentage}%</span>
                      <span className="text-sm font-medium">£{asset.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Liability Breakdown</h4>
              <div className="space-y-2">
                {liabilityBreakdown.map((liability) => (
                  <div key={liability.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-sm">{liability.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{liability.percentage}%</span>
                      <span className="text-sm font-medium">£{liability.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 py-3 border-t flex justify-between">
        <div className="text-xs text-muted-foreground">
          Last updated: August 28, 2023
        </div>
        <Button variant="link" size="sm" className="text-xs p-0 h-auto flex items-center">
          View detailed analysis
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
