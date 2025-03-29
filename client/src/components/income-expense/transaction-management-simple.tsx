import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";

export function TransactionManagementSimple() {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Transaction Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-700 mb-2">Sample Transactions</h3>
            <p className="text-blue-600 text-sm">
              This is a simplified version of the transactions management interface.
              The complete interface with filtering, adding, and editing capabilities will be available soon.
            </p>
          </div>
          
          <div className="border rounded-md divide-y">
            {/* Sample Transaction 1 */}
            <div className="p-4 flex justify-between items-start">
              <div>
                <div className="font-medium">Monthly Salary</div>
                <div className="text-sm text-gray-500">June 10, 2023 • Acme Inc</div>
                <div className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Income: Salary
                </div>
              </div>
              <div className="text-green-600 font-medium">+£3,850.00</div>
            </div>
            
            {/* Sample Transaction 2 */}
            <div className="p-4 flex justify-between items-start">
              <div>
                <div className="font-medium">Groceries - Tesco</div>
                <div className="text-sm text-gray-500">June 12, 2023 • Tesco</div>
                <div className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Essentials: Groceries
                </div>
              </div>
              <div className="text-red-600 font-medium">-£82.47</div>
            </div>
            
            {/* Sample Transaction 3 */}
            <div className="p-4 flex justify-between items-start">
              <div>
                <div className="font-medium">Electricity Bill</div>
                <div className="text-sm text-gray-500">June 7, 2023 • British Gas</div>
                <div className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Essentials: Utilities
                </div>
              </div>
              <div className="text-red-600 font-medium">-£78.32</div>
            </div>
            
            {/* Sample Transaction 4 */}
            <div className="p-4 flex justify-between items-start">
              <div>
                <div className="font-medium">Investment Deposit</div>
                <div className="text-sm text-gray-500">June 5, 2023 • Vanguard</div>
                <div className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Savings: Investment
                </div>
              </div>
              <div className="text-red-600 font-medium">-£400.00</div>
            </div>
            
            {/* Sample Transaction 5 */}
            <div className="p-4 flex justify-between items-start">
              <div>
                <div className="font-medium">Coffee Shop</div>
                <div className="text-sm text-gray-500">June 9, 2023 • Costa Coffee</div>
                <div className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Lifestyle: Dining Out
                </div>
              </div>
              <div className="text-red-600 font-medium">-£4.85</div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={() => setIsLoading(true)}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More Transactions"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 