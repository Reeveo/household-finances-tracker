import React from 'react';
import { TrendingDown, TrendingUp, DollarSign, PiggyBank } from 'lucide-react';

export function SummaryCards() {
  // Mock data - in a real app, this would come from API/state
  const summaryData = {
    monthlyIncome: {
      value: 4500,
      change: +5.2,
      lastMonth: 4275
    },
    monthlyExpenses: {
      value: 3200,
      change: -2.8,
      lastMonth: 3290
    },
    savings: {
      value: 1300,
      change: +25.0,
      lastMonth: 985
    },
    netWorth: {
      value: 32500,
      change: +3.1,
      lastMonth: 31520
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Display trend icon and color based on change
  const getTrendInfo = (change: number) => {
    const isPositive = change >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-500' : 'text-red-500';
    
    return { Icon, color };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Monthly Income */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Monthly Income</p>
            <h3 className="text-xl font-bold mt-1">{formatCurrency(summaryData.monthlyIncome.value)}</h3>
          </div>
          <div className="p-2 bg-green-50 rounded-full">
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
        </div>
        
        <div className="flex items-center mt-3">
          {(() => {
            const { Icon, color } = getTrendInfo(summaryData.monthlyIncome.change);
            return (
              <>
                <Icon className={`h-4 w-4 ${color} mr-1`} />
                <span className={`text-sm ${color} font-medium`}>
                  {Math.abs(summaryData.monthlyIncome.change).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </>
            );
          })()}
        </div>
      </div>

      {/* Monthly Expenses */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Monthly Expenses</p>
            <h3 className="text-xl font-bold mt-1">{formatCurrency(summaryData.monthlyExpenses.value)}</h3>
          </div>
          <div className="p-2 bg-red-50 rounded-full">
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
        </div>
        
        <div className="flex items-center mt-3">
          {(() => {
            const { Icon, color } = getTrendInfo(summaryData.monthlyExpenses.change);
            return (
              <>
                <Icon className={`h-4 w-4 ${color} mr-1`} />
                <span className={`text-sm ${color} font-medium`}>
                  {Math.abs(summaryData.monthlyExpenses.change).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </>
            );
          })()}
        </div>
      </div>

      {/* Savings */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Monthly Savings</p>
            <h3 className="text-xl font-bold mt-1">{formatCurrency(summaryData.savings.value)}</h3>
          </div>
          <div className="p-2 bg-blue-50 rounded-full">
            <PiggyBank className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        
        <div className="flex items-center mt-3">
          {(() => {
            const { Icon, color } = getTrendInfo(summaryData.savings.change);
            return (
              <>
                <Icon className={`h-4 w-4 ${color} mr-1`} />
                <span className={`text-sm ${color} font-medium`}>
                  {Math.abs(summaryData.savings.change).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </>
            );
          })()}
        </div>
      </div>

      {/* Net Worth */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Net Worth</p>
            <h3 className="text-xl font-bold mt-1">{formatCurrency(summaryData.netWorth.value)}</h3>
          </div>
          <div className="p-2 bg-purple-50 rounded-full">
            <DollarSign className="h-5 w-5 text-purple-500" />
          </div>
        </div>
        
        <div className="flex items-center mt-3">
          {(() => {
            const { Icon, color } = getTrendInfo(summaryData.netWorth.change);
            return (
              <>
                <Icon className={`h-4 w-4 ${color} mr-1`} />
                <span className={`text-sm ${color} font-medium`}>
                  {Math.abs(summaryData.netWorth.change).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
