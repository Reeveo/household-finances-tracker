import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useState, useEffect } from "react";
import { ModalForm } from "@/components/common/modal-form";

// Sample data
const incomeData = [
  { name: "Salary", value: 3850 },
  { name: "Freelance", value: 250 },
  { name: "Investments", value: 120 },
  { name: "Other", value: 30 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function IncomeSourcesChart() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSimpleView, setShowSimpleView] = useState(window.innerWidth < 640);

  // Update view mode when window resizes
  useEffect(() => {
    const handleResize = () => {
      setShowSimpleView(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-border rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}: £${payload[0].value}`}</p>
          <p className="text-xs text-muted-foreground">
            {`${(payload[0].value / incomeData.reduce((sum, entry) => sum + entry.value, 0) * 100).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate total income
  const totalIncome = incomeData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-3 sm:p-5">
        <h3 className="text-lg font-semibold mb-2 sm:mb-4">Income Sources</h3>
        
        {showSimpleView ? (
          // Mobile-optimized view with simple percentage bars
          <div className="space-y-3 mb-3">
            {incomeData.map((entry, index) => {
              const percentage = (entry.value / totalIncome) * 100;
              return (
                <div key={`income-${index}`} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{entry.name}</span>
                    </div>
                    <div className="flex space-x-2">
                      <span className="text-gray-500">{percentage.toFixed(1)}%</span>
                      <span>£{entry.value}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length] 
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="flex justify-between font-medium">
                <span>Total Income</span>
                <span>£{totalIncome}</span>
              </div>
            </div>
          </div>
        ) : (
          // Desktop view with pie chart
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {incomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-4">
          <Button 
            variant="default" 
            className="w-full h-10 text-sm sm:text-base py-2 px-3 sm:py-2 sm:px-4"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Add Income</span>
          </Button>
        </div>

        <ModalForm
          title="Add Income"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fields={[
            { name: "name", label: "Income Source", type: "text", placeholder: "e.g. Salary" },
            { name: "amount", label: "Amount (£)", type: "number", placeholder: "e.g. 2000" },
            { name: "category", label: "Category", type: "select", options: [
              { value: "salary", label: "Salary" },
              { value: "freelance", label: "Freelance" },
              { value: "investments", label: "Investments" },
              { value: "other", label: "Other" }
            ]},
            { name: "date", label: "Date", type: "date" },
            { name: "recurring", label: "Recurring", type: "checkbox" },
            { name: "frequency", label: "Frequency", type: "select", options: [
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" }
            ]},
            { name: "notes", label: "Notes", type: "textarea", placeholder: "Any additional details..." }
          ]}
          onSubmit={(data) => {
            console.log(data);
            setIsModalOpen(false);
          }}
        />
      </CardContent>
    </Card>
  );
}
