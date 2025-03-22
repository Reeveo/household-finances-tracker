import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { OverpaymentData } from "./mortgage-overpayment-calculator";

type OverpaymentAnalysisProps = {
  overpaymentData: OverpaymentData;
};

export function OverpaymentAnalysis({ overpaymentData }: OverpaymentAnalysisProps) {
  const {
    monthlyPayment,
    monthlyOverpayment,
    originalTotalPayments,
    newTotalPayments,
    originalTotalInterest,
    newTotalInterest,
    originalEndDate,
    newEndDate
  } = overpaymentData;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4">Detailed Overpayment Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Original Mortgage</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Monthly Payment:</span>
                <span className="font-medium">£{monthlyPayment.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Total Payments:</span>
                <span className="font-medium">£{Math.round(originalTotalPayments).toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span>Total Interest:</span>
                <span className="font-medium">£{Math.round(originalTotalInterest).toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span>Mortgage End Date:</span>
                <span className="font-medium">{originalEndDate}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">With Overpayments</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Monthly Payment + Overpayment:</span>
                <span className="font-medium">£{(monthlyPayment + monthlyOverpayment).toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Total Payments:</span>
                <span className="font-medium">£{Math.round(newTotalPayments).toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span>Total Interest:</span>
                <span className="font-medium text-success">£{Math.round(newTotalInterest).toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span>Mortgage End Date:</span>
                <span className="font-medium text-success">{newEndDate}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Save as PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
