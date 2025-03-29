import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CategoryManagementSimple() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Category Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-700 mb-2">Category Management</h3>
            <p className="text-blue-600 text-sm">
              This is a simplified version of the category management interface.
              The complete interface with editing, creating, and organizing categories will be available soon.
            </p>
          </div>
          
          {/* Category List */}
          <div className="space-y-6">
            {/* Essentials */}
            <div>
              <h3 className="font-medium text-lg mb-3">Essentials</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Rent/Mortgage</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Utilities</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Groceries</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Transport</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Insurance</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Secondary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Healthcare</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Secondary
                  </span>
                </div>
              </div>
            </div>
            
            {/* Lifestyle */}
            <div>
              <h3 className="font-medium text-lg mb-3">Lifestyle</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Dining Out</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Entertainment</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Shopping</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Travel</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Secondary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Subscriptions</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Secondary
                  </span>
                </div>
              </div>
            </div>
            
            {/* Savings */}
            <div>
              <h3 className="font-medium text-lg mb-3">Savings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Emergency Fund</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Investments</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Retirement</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
              </div>
            </div>
            
            {/* Income */}
            <div>
              <h3 className="font-medium text-lg mb-3">Income</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Salary</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Side Hustle</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Secondary
                  </span>
                </div>
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <span>Investment Income</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Secondary
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 