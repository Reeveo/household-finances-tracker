import React from 'react';

export function SavingsChart() {
  // Mock data for a simple representation
  const savingsData = {
    currentSavings: 8500,
    savingsGoal: 15000,
    percentComplete: 56.7,
    monthlySavings: 1300
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium">Savings Goal</h3>
      <p className="text-sm text-gray-500 mb-4">Track your progress toward financial freedom</p>
      
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Current: ${savingsData.currentSavings.toLocaleString()}</span>
            <span>Goal: ${savingsData.savingsGoal.toLocaleString()}</span>
          </div>
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500" 
              style={{ width: `${savingsData.percentComplete}%` }}
            ></div>
          </div>
          <p className="text-center text-sm font-medium text-indigo-600">
            {savingsData.percentComplete}% Complete
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Monthly Savings</p>
            <p className="text-lg font-bold">${savingsData.monthlySavings}</p>
            <p className="text-xs text-gray-500">
              At this rate, you'll reach your goal in {Math.ceil((savingsData.savingsGoal - savingsData.currentSavings) / savingsData.monthlySavings)} months
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Potential Growth</p>
            <p className="text-lg font-bold">$10,625</p>
            <p className="text-xs text-gray-500">
              Est. value in 1 year with 5% return
            </p>
          </div>
        </div>
        
        {/* Placeholder for chart visualization */}
        <div className="h-40 w-full flex items-center justify-center border border-gray-100 rounded-md">
          <p className="text-gray-400 text-sm">Savings growth chart would appear here</p>
        </div>
      </div>
    </div>
  );
}
