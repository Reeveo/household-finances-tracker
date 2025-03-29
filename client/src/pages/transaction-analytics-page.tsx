import { Sidebar } from "@/components/layout/sidebar";
import { TransactionAnalytics } from "@/components/analytics/transaction-analytics";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TransactionAnalyticsPage() {
  const isMobileState = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-3 lg:p-6 overflow-y-auto">
        <div className="space-y-4 lg:space-y-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/transactions">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Transaction Analytics</h1>
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <HelpCircle className="h-3.5 w-3.5" />
              <span className={isMobileState ? "sr-only" : ""}>Help</span>
            </Button>
          </div>
          
          <TransactionAnalytics />
        </div>
      </main>
    </div>
  );
}