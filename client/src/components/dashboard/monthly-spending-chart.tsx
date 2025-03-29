import React from 'react';

export function MonthlySpendingChart() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium">Monthly Spending</h3>
      <p className="text-sm text-gray-500 mb-4">Your spending trends by category</p>
      
      {/* Placeholder for chart - in a real app, we'd use a charting library */}
      <div className="h-64 w-full flex flex-col items-center justify-center">
        <div className="mb-3 text-center">
          <p className="text-gray-400">Chart visualization goes here</p>
          <p className="text-xs text-gray-400">Using data visualization libraries like Chart.js or Recharts</p>
        </div>
        
        <div className="w-full bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">Top Spending Categories</h4>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm">Housing</span>
              </div>
              <span className="text-sm font-medium">$1,250</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">Food</span>
              </div>
              <span className="text-sm font-medium">$650</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-sm">Transportation</span>
              </div>
              <span className="text-sm font-medium">$450</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-sm">Entertainment</span>
              </div>
              <span className="text-sm font-medium">$300</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
