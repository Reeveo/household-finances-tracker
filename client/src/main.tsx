import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from "./pages/dashboard-page";
import TransactionsPage from "./pages/transactions-page";
import SavingsPage from "./pages/savings-page";
import AnalyticsPage from "./pages/analytics-page";
import CalculatorsPage from "./pages/calculators-page";
import SettingsPage from "./pages/settings-page";

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/savings" element={<SavingsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/calculators" element={<CalculatorsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
        </Routes>
    </BrowserRouter>
);
