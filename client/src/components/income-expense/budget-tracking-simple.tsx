import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BudgetTrackingSimple() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Budget Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Budget Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Monthly Budget</span>
              <span>£3,000 of £3,600 spent (83%)</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full" 
                style={{ width: '83%' }}
              ></div>
            </div>
            <div className="text-right text-xs text-gray-500">
              £600 remaining
            </div>
          </div>
          
          {/* Category Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Housing */}
            <div className="border rounded-md p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Housing</span>
                <span>£1,200 of £1,200</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: '100%' }}
                ></div>
              </div>
              <div className="text-right text-xs text-gray-500">
                100% used
              </div>
            </div>
            
            {/* Groceries */}
            <div className="border rounded-md p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Groceries</span>
                <span>£450 of £500</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: '90%' }}
                ></div>
              </div>
              <div className="text-right text-xs text-gray-500">
                £50 remaining
              </div>
            </div>
            
            {/* Transport */}
            <div className="border rounded-md p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Transport</span>
                <span>£300 of £350</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: '85.7%' }}
                ></div>
              </div>
              <div className="text-right text-xs text-gray-500">
                £50 remaining
              </div>
            </div>
            
            {/* Utilities */}
            <div className="border rounded-md p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Utilities</span>
                <span>£250 of £300</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full" 
                  style={{ width: '83.3%' }}
                ></div>
              </div>
              <div className="text-right text-xs text-gray-500">
                £50 remaining
              </div>
            </div>
            
            {/* Entertainment */}
            <div className="border rounded-md p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Entertainment</span>
                <span>£350 of £300</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: '100%' }}
                ></div>
              </div>
              <div className="text-right text-xs text-red-500 font-medium">
                £50 over budget
              </div>
            </div>
            
            {/* Other */}
            <div className="border rounded-md p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Other</span>
                <span>£450 of £950</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-500 rounded-full" 
                  style={{ width: '47.4%' }}
                ></div>
              </div>
              <div className="text-right text-xs text-gray-500">
                £500 remaining
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 