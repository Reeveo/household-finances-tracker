import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
import IncomeExpensePage from "@/pages/income-expense-page";
import SavingsInvestmentsPage from "@/pages/savings-investments-page";
import MortgageCalculatorPage from "@/pages/mortgage-calculator-page";
import MortgageOverpaymentPage from "@/pages/mortgage-overpayment-page";
import PensionCalculatorPage from "@/pages/pension-calculator-page";
import AuthPage from "@/pages/auth-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/income-expenses" component={IncomeExpensePage} />
      <ProtectedRoute path="/savings-investments" component={SavingsInvestmentsPage} />
      <ProtectedRoute path="/mortgage-calculator" component={MortgageCalculatorPage} />
      <ProtectedRoute path="/mortgage-overpayment" component={MortgageOverpaymentPage} />
      <ProtectedRoute path="/pension-calculator" component={PensionCalculatorPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
