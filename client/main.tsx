import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import AuthPage from './AuthPage'
import DashboardPage from './src/pages/dashboard-page'
import IncomeExpensePage from './src/pages/income-expense-page'
import SavingsInvestmentsPage from './src/pages/savings-investments-page'
import TransactionAnalyticsPage from './src/pages/transaction-analytics-page'
import CalculatorsPage from './src/pages/calculators-page'
import MortgageCalculatorPage from './src/pages/mortgage-calculator-page'
import MortgageOverpaymentPage from './src/pages/mortgage-overpayment-page'
import PensionCalculatorPage from './src/pages/pension-calculator-page'
import SalaryCalculatorPage from './src/pages/salary-calculator-page'
import SettingsPage from './src/pages/settings-page'
import NotFoundPage from './src/pages/not-found'
import { Toaster } from './src/components/ui/toaster'
import './index.css'

// Instead of importing the Toaster component directly, we'll keep things simple
// and just use the browser's built-in alerts for notifications in the demo

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth-page" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<IncomeExpensePage />} />
        <Route path="/savings" element={<SavingsInvestmentsPage />} />
        <Route path="/analytics" element={<TransactionAnalyticsPage />} />
        <Route path="/calculators" element={<CalculatorsPage />} />
        <Route path="/calculators/mortgage" element={<MortgageCalculatorPage />} />
        <Route path="/calculators/mortgage-overpayment" element={<MortgageOverpaymentPage />} />
        <Route path="/calculators/pension" element={<PensionCalculatorPage />} />
        <Route path="/calculators/salary" element={<SalaryCalculatorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </React.StrictMode>
) 