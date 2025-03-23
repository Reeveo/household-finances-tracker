import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useState, useEffect } from "react";
import { ModalForm } from "@/components/common/modal-form";

// Sample data
const expenseData = [
  { name: "Housing", value: 1200 },
  { name: "Food", value: 450 },
  { name: "Transport", value: 180 },
  { name: "Entertainment", value: 320 },
  { name: "Utilities", value: 220 },
  { name: "Other", value: 470 }
];

const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884d8', '#82ca9d'];

export function ExpenseChart() {
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
            {`${(payload[0].value / expenseData.reduce((sum, entry) => sum + entry.value, 0) * 100).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate total expenses
  const totalExpenses = expenseData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-3 sm:p-5">
        <h3 className="text-lg font-semibold mb-2 sm:mb-4">Expense Categories</h3>
        
        {showSimpleView ? (
          // Mobile-optimized view with simple percentage bars
          <div className="space-y-3 mb-3">
            {expenseData.map((entry, index) => {
              const percentage = (entry.value / totalExpenses) * 100;
              return (
                <div key={`expense-${index}`} className="space-y-1">
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
                <span>Total Expenses</span>
                <span>£{totalExpenses}</span>
              </div>
            </div>
          </div>
        ) : (
          // Desktop view with pie chart
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseData.map((entry, index) => (
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
            className="w-full"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <ModalForm
          title="Add Expense"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fields={[
            { name: "name", label: "Expense Name", type: "text", placeholder: "e.g. Groceries" },
            { name: "amount", label: "Amount (£)", type: "number", placeholder: "e.g. 50" },
            { name: "category", label: "Category", type: "select", options: [
              { value: "essentials", label: "Essentials" },
              { value: "lifestyle", label: "Lifestyle" },
              { value: "savings", label: "Savings" }
            ]},
            { name: "subcategory", label: "Subcategory", type: "select", options: [
              { value: "housing", label: "Housing" },
              { value: "food", label: "Food" },
              { value: "transport", label: "Transport" },
              { value: "entertainment", label: "Entertainment" },
              { value: "utilities", label: "Utilities" },
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
