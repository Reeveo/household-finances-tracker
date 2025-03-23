import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Info, AlertCircle, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

type SummaryCardProps = {
  title: string;
  amount: string;
  change: {
    value: string;
    isPositive: boolean;
  };
  tooltip?: string;
  actionLink?: string;
  actionText?: string;
  progress?: {
    value: number;
    max: number;
    percentage: number;
    label: string;
  };
  alert?: {
    message: string;
    type: "warning" | "info";
  };
};

function SummaryCard({ 
  title, 
  amount, 
  change, 
  tooltip, 
  actionLink, 
  actionText,
  progress,
  alert
}: SummaryCardProps) {
  const isMobile = useIsMobile();
  
  return (
    <Card className="shadow-sm flex flex-col h-full">
      <CardContent className="p-3 lg:p-4 flex-grow">
        <div className="flex flex-col space-y-1.5 lg:space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-xs sm:text-sm font-medium text-muted">{title}</h3>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 lg:w-3.5 lg:h-3.5 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side={isMobile ? "bottom" : "top"}>
                      <p className="text-xs max-w-[200px] sm:max-w-xs">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{amount}</div>
            <div className={`flex items-center text-xs sm:text-sm ${
              change.isPositive ? "text-success" : "text-destructive"
            }`}>
              {change.isPositive ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              )}
              <span>{change.value}</span>
            </div>
          </div>
          
          {progress && (
            <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
              <div className="flex justify-between items-center text-[10px] sm:text-xs text-muted-foreground">
                <span>{progress.label}</span>
                <span>{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-1 sm:h-1.5" />
            </div>
          )}
          
          {alert && (
            <div className={`flex items-start mt-1 sm:mt-2 p-1 sm:p-1.5 rounded-sm text-[10px] sm:text-xs ${
              alert.type === "warning" ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-800"
            }`}>
              {alert.type === "warning" ? (
                <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 flex-shrink-0 mt-[1px]" />
              ) : (
                <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 flex-shrink-0 mt-[1px]" />
              )}
              <span className="line-clamp-2 sm:line-clamp-none">{alert.message}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {actionLink && actionText && (
        <CardFooter className="px-3 lg:px-4 py-1 sm:py-2 pt-0 mt-auto">
          <Link href={actionLink} className="w-full">
            <Button variant="ghost" size="sm" className="w-full p-1 h-7 sm:h-8 text-[10px] sm:text-xs justify-between hover:bg-muted/80">
              {actionText}
              <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

export function SummaryCards() {
  const summaryData = [
    { 
      title: "Total Income", 
      amount: "£4,250.00", 
      change: { value: "+2.5%", isPositive: true },
      tooltip: "Your income for the current month compared to the previous month.",
      actionLink: "/income-expenses",
      actionText: "Manage income sources",
      progress: {
        value: 4250,
        max: 5000,
        percentage: 85,
        label: "Of monthly target"
      }
    } as const,
    { 
      title: "Total Expenses", 
      amount: "£2,840.00", 
      change: { value: "+3.2%", isPositive: false },
      tooltip: "Your expenses for the current month compared to the previous month.",
      actionLink: "/income-expenses",
      actionText: "Review spending",
      alert: {
        message: "Your expenses are higher than last month. Consider reviewing your spending habits.",
        type: "warning" as const
      }
    },
    { 
      title: "Total Savings", 
      amount: "£1,410.00", 
      change: { value: "+1.8%", isPositive: true },
      tooltip: "The difference between your income and expenses this month.",
      actionLink: "/savings-investments",
      actionText: "View savings goals",
      progress: {
        value: 1410,
        max: 1500,
        percentage: 94,
        label: "Of monthly target"
      }
    },
    { 
      title: "Net Worth", 
      amount: "£128,750.00", 
      change: { value: "+5.2%", isPositive: true },
      tooltip: "The total value of your assets minus your liabilities.",
      actionLink: "/savings-investments",
      actionText: "View breakdown",
      alert: {
        message: "Your net worth is growing steadily. Keep up the good work!",
        type: "info" as const
      }
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
      {summaryData.map((card, index) => (
        <SummaryCard
          key={index}
          title={card.title}
          amount={card.amount}
          change={card.change}
          tooltip={card.tooltip}
          actionLink={card.actionLink}
          actionText={card.actionText}
          progress={card.progress}
          alert={card.alert}
        />
      ))}
    </div>
  );
}
