import React from 'react';

export function NetWorthChart() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium">Net Worth Trend</h3>
      <p className="text-sm text-gray-500 mb-4">Your financial progress over time</p>
      
      <div className="flex flex-col space-y-4">
        {/* Summary stats */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-gray-50 p-3 rounded-md flex-grow">
            <p className="text-sm text-gray-500">Current Net Worth</p>
            <p className="text-lg font-bold">$32,500</p>
            <p className="text-xs text-gray-500">
              <span className="text-green-500">↑ 3.1%</span> from last month
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md flex-grow">
            <p className="text-sm text-gray-500">YTD Growth</p>
            <p className="text-lg font-bold">$5,280</p>
            <p className="text-xs text-gray-500">
              <span className="text-green-500">↑ 19.4%</span> since January
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md flex-grow">
            <p className="text-sm text-gray-500">Asset Allocation</p>
            <p className="text-lg font-bold">65% / 35%</p>
            <p className="text-xs text-gray-500">
              Assets to Liabilities Ratio
            </p>
          </div>
        </div>
        
        {/* Placeholder for chart visualization */}
        <div className="h-48 w-full flex items-center justify-center border border-gray-100 rounded-md">
          <p className="text-gray-400 text-sm">Net worth trend chart would appear here</p>
        </div>
        
        {/* Quick summary of assets and liabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Assets ($48,750)</h4>
            <ul className="space-y-1">
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Cash & Savings</span>
                <span>$12,000</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Investments</span>
                <span>$24,500</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Property</span>
                <span>$10,000</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Other Assets</span>
                <span>$2,250</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Liabilities ($16,250)</h4>
            <ul className="space-y-1">
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Mortgage</span>
                <span>$12,000</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Student Loans</span>
                <span>$3,500</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-gray-600">Credit Cards</span>
                <span>$750</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
