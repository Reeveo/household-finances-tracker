import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Sample data
const transactions = [
  {
    id: 1,
    date: '12 Jun 2023',
    description: 'Groceries - Tesco',
    category: 'Essentials',
    amount: -82.47,
  },
  {
    id: 2,
    date: '10 Jun 2023',
    description: 'Monthly Salary',
    category: 'Income',
    amount: 3850.00,
  },
  {
    id: 3,
    date: '09 Jun 2023',
    description: 'Coffee Shop',
    category: 'Lifestyle',
    amount: -4.85,
  },
  {
    id: 4,
    date: '07 Jun 2023',
    description: 'Electricity Bill',
    category: 'Essentials',
    amount: -78.32,
  },
  {
    id: 5,
    date: '05 Jun 2023',
    description: 'Investment Deposit',
    category: 'Savings',
    amount: -400.00,
  },
];

// Map categories to badge colors
const categoryColors: Record<string, { bg: string, text: string }> = {
  Essentials: { bg: 'bg-blue-100', text: 'text-blue-800' },
  Income: { bg: 'bg-green-100', text: 'text-green-800' },
  Lifestyle: { bg: 'bg-green-100', text: 'text-green-800' },
  Savings: { bg: 'bg-purple-100', text: 'text-purple-800' },
};

export function RecentTransactions() {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <Button variant="link" className="text-secondary p-0">View All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/10 text-sm text-muted border-b border-border">
                <th className="text-left font-medium p-2">Date</th>
                <th className="text-left font-medium p-2">Description</th>
                <th className="text-left font-medium p-2">Category</th>
                <th className="text-left font-medium p-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="p-2 text-sm">{transaction.date}</td>
                  <td className="p-2 text-sm">{transaction.description}</td>
                  <td className="p-2 text-sm">
                    <Badge 
                      variant="outline"
                      className={`${categoryColors[transaction.category].bg} ${categoryColors[transaction.category].text}`}
                    >
                      {transaction.category}
                    </Badge>
                  </td>
                  <td className={`p-2 text-sm font-medium ${transaction.amount >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
