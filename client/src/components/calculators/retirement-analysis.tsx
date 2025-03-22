import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Download } from "lucide-react";
import { PensionData } from "./pension-calculator";
import { useState } from "react";

type RetirementAnalysisProps = {
  pensionData: PensionData;
  onRecalculate: (updates: Partial<PensionData>) => void;
};

export function RetirementAnalysis({ pensionData, onRecalculate }: RetirementAnalysisProps) {
  const {
    currentAge,
    retirementAge,
    potAt65,
    incomeAt65,
    potAt70,
    incomeAt70,
    estimatedPensionPot,
    estimatedAnnualIncome,
    monthlyContribution
  } = pensionData;
  
  const [newMonthlyContribution, setNewMonthlyContribution] = useState(monthlyContribution);
  const [newRetirementAge, setNewRetirementAge] = useState(retirementAge);
  
  const handleRecalculate = () => {
    onRecalculate({
      monthlyContribution: newMonthlyContribution,
      retirementAge: newRetirementAge
    });
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4">Detailed Retirement Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-4 border border-border rounded-md bg-gray-50">
            <h4 className="font-medium mb-2">If You Retire at {retirementAge}</h4>
            <div className="text-xl font-bold mb-1">£{estimatedPensionPot.toLocaleString()}</div>
            <div className="text-sm text-muted mb-3">Estimated Pension Pot</div>
            <div className="text-xl font-bold mb-1">£{estimatedAnnualIncome.toLocaleString()}</div>
            <div className="text-sm text-muted">Annual Income</div>
          </div>
          
          <div className="p-4 border border-border rounded-md bg-gray-50">
            <h4 className="font-medium mb-2">If You Retire at 65</h4>
            <div className="text-xl font-bold mb-1">£{potAt65.toLocaleString()}</div>
            <div className="text-sm text-muted mb-3">Estimated Pension Pot</div>
            <div className="text-xl font-bold mb-1">£{incomeAt65.toLocaleString()}</div>
            <div className="text-sm text-muted">Annual Income</div>
          </div>
          
          <div className="p-4 border border-border rounded-md bg-gray-50">
            <h4 className="font-medium mb-2">If You Retire at 70</h4>
            <div className="text-xl font-bold mb-1">£{potAt70.toLocaleString()}</div>
            <div className="text-sm text-muted mb-3">Estimated Pension Pot</div>
            <div className="text-xl font-bold mb-1">£{incomeAt70.toLocaleString()}</div>
            <div className="text-sm text-muted">Annual Income</div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-3">How Much More Could You Save?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Increase Your Monthly Contribution</label>
              <div className="flex items-center">
                <span className="mr-2">£</span>
                <Slider
                  min={monthlyContribution}
                  max={800}
                  step={50}
                  value={[newMonthlyContribution]}
                  onValueChange={(values) => setNewMonthlyContribution(values[0])}
                  className="flex-1"
                />
                <span className="ml-2">{newMonthlyContribution}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adjust Retirement Age</label>
              <div className="flex items-center">
                <Slider
                  min={60}
                  max={75}
                  step={1}
                  value={[newRetirementAge]}
                  onValueChange={(values) => setNewRetirementAge(values[0])}
                  className="flex-1"
                />
                <span className="ml-2">{newRetirementAge}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <Button 
              variant="secondary"
              onClick={handleRecalculate}
            >
              Recalculate
            </Button>
            <Button variant="default">
              <Download className="w-4 h-4 mr-2" />
              Save Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
