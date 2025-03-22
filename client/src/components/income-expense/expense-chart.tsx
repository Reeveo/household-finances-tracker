import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useState } from "react";
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

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
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
