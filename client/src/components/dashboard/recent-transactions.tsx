import React from 'react';

export function RecentTransactions() {
  // Mock data
  const transactions = [
    {
      id: 1,
      date: '2023-04-15',
      description: 'Grocery Store',
      amount: -125.45,
      category: 'Food',
      account: 'Main Checking'
    },
    {
      id: 2,
      date: '2023-04-14',
      description: 'Monthly Salary',
      amount: 4500.00,
      category: 'Income',
      account: 'Main Checking'
    },
    {
      id: 3,
      date: '2023-04-13',
      description: 'Internet Bill',
      amount: -89.99,
      category: 'Utilities',
      account: 'Bills Account'
    },
    {
      id: 4,
      date: '2023-04-12',
      description: 'Restaurant Dinner',
      amount: -65.30,
      category: 'Dining Out',
      account: 'Credit Card'
    },
    {
      id: 5,
      date: '2023-04-10',
      description: 'Gas Station',
      amount: -48.75,
      category: 'Transportation',
      account: 'Credit Card'
    }
  ];

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'never'
    }).format(Math.abs(amount));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium">Recent Transactions</h3>
        <p className="text-sm text-gray-500">Your latest financial activity</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {transactions.map(transaction => (
          <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${
                transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={`text-sm ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : '-'}
                </span>
              </div>
              
              <div>
                <p className="font-medium">{transaction.description}</p>
                <div className="flex text-xs text-gray-500 mt-1 space-x-2">
                  <span>{formatDate(transaction.date)}</span>
                  <span>•</span>
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span>{transaction.account}</span>
                </div>
              </div>
            </div>
            
            <div className={`font-medium ${
              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.amount > 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-gray-100 flex justify-center">
        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          View All Transactions
        </button>
      </div>
    </div>
  );
}
