import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, FileText } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ModalForm } from "@/components/common/modal-form";

// Sample data
const budgetData = [
  { 
    category: "Housing & Utilities", 
    current: 850, 
    target: 900, 
    percentage: 94, 
    isOverBudget: false
  },
  { 
    category: "Food & Groceries", 
    current: 450, 
    target: 400, 
    percentage: 112, 
    isOverBudget: true
  },
  { 
    category: "Transportation", 
    current: 180, 
    target: 200, 
    percentage: 90, 
    isOverBudget: false
  },
  { 
    category: "Entertainment", 
    current: 320, 
    target: 250, 
    percentage: 128, 
    isOverBudget: true
  },
  { 
    category: "Savings", 
    current: 400, 
    target: 500, 
    percentage: 80, 
    isOverBudget: false
  }
];

export function BudgetTracking() {
  const [month, setMonth] = useState("June 2023");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Budget vs Actual</h3>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="June 2023">June 2023</SelectItem>
              <SelectItem value="May 2023">May 2023</SelectItem>
              <SelectItem value="April 2023">April 2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-4">
          {budgetData.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-1">
                <div>
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <div className="text-sm">£{item.current} / £{item.target}</div>
              </div>
              <Progress 
                value={item.percentage} 
                max={100}
                className="h-2.5 bg-gray-200"
                indicatorClassName={item.isOverBudget ? "bg-red-600" : "bg-green-600"}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setIsModalOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Adjust Budget
          </Button>
          <Button variant="default">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        <ModalForm
          title="Adjust Budget"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fields={[
            { name: "month", label: "Month", type: "select", options: [
              { value: "6", label: "June 2023" },
              { value: "5", label: "May 2023" },
              { value: "4", label: "April 2023" }
            ]},
            { name: "housingUtilities", label: "Housing & Utilities (£)", type: "number", defaultValue: "900" },
            { name: "foodGroceries", label: "Food & Groceries (£)", type: "number", defaultValue: "400" },
            { name: "transportation", label: "Transportation (£)", type: "number", defaultValue: "200" },
            { name: "entertainment", label: "Entertainment (£)", type: "number", defaultValue: "250" },
            { name: "savings", label: "Savings (£)", type: "number", defaultValue: "500" }
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
