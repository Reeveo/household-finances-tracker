import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

type SummaryCardProps = {
  title: string;
  amount: string;
  change: {
    value: string;
    isPositive: boolean;
  };
};

function SummaryCard({ title, amount, change }: SummaryCardProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-sm font-medium text-muted">{title}</h3>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold">{amount}</div>
            <div className={`flex items-center text-sm ${
              change.isPositive ? "text-success" : "text-destructive"
            }`}>
              {change.isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>{change.value}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SummaryCards() {
  const summaryData = [
    { 
      title: "Total Income", 
      amount: "£4,250.00", 
      change: { value: "+2.5%", isPositive: true } 
    },
    { 
      title: "Total Expenses", 
      amount: "£2,840.00", 
      change: { value: "+3.2%", isPositive: false } 
    },
    { 
      title: "Total Savings", 
      amount: "£1,410.00", 
      change: { value: "+1.8%", isPositive: true } 
    },
    { 
      title: "Net Worth", 
      amount: "£128,750.00", 
      change: { value: "+5.2%", isPositive: true } 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryData.map((card, index) => (
        <SummaryCard
          key={index}
          title={card.title}
          amount={card.amount}
          change={card.change}
        />
      ))}
    </div>
  );
}
