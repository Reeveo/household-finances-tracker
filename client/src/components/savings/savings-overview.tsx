import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { ModalForm } from "@/components/common/modal-form";

// Sample data
const savingsGoals = [
  {
    name: "Emergency Fund",
    current: 5400,
    goal: 9000,
    percentage: 60
  },
  {
    name: "Vacation Fund",
    current: 1200,
    goal: 1500,
    percentage: 80
  },
  {
    name: "Home Deposit",
    current: 22500,
    goal: 50000,
    percentage: 45
  }
];

export function SavingsOverview() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Savings Overview</h3>
        <div className="space-y-4">
          {savingsGoals.map((goal, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{goal.name}</span>
                <span className="text-sm font-medium">£{goal.current.toLocaleString()}</span>
              </div>
              <Progress value={goal.percentage} className="h-2" />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted">Goal: £{goal.goal.toLocaleString()}</span>
                <span className="text-xs text-muted">{goal.percentage}% Complete</span>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          className="w-full mt-4"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Savings Goal
        </Button>

        <ModalForm
          title="Add Savings Goal"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fields={[
            { name: "name", label: "Goal Name", type: "text", placeholder: "e.g. New Car" },
            { name: "targetAmount", label: "Target Amount (£)", type: "number", placeholder: "e.g. 5000" },
            { name: "currentAmount", label: "Current Amount (£)", type: "number", placeholder: "e.g. 1000" },
            { name: "deadline", label: "Target Date", type: "date" },
            { name: "notes", label: "Notes", type: "textarea", placeholder: "Additional details..." }
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
