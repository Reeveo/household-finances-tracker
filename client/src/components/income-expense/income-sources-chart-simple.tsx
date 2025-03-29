import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function IncomeSourcesChartSimple() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Income Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex flex-col items-center justify-center">
          <div className="flex space-x-8 mb-6">
            <div className="text-center">
              <div className="inline-block w-32 h-32 rounded-full border-8 border-indigo-400 flex items-center justify-center">
                <span className="text-2xl font-bold">75%</span>
              </div>
              <div className="mt-2 font-medium">Primary Job</div>
              <div className="text-sm text-gray-500">£3,850.00</div>
            </div>
            
            <div className="text-center">
              <div className="inline-block w-24 h-24 rounded-full border-8 border-green-400 flex items-center justify-center">
                <span className="text-xl font-bold">15%</span>
              </div>
              <div className="mt-2 font-medium">Freelance</div>
              <div className="text-sm text-gray-500">£770.00</div>
            </div>
            
            <div className="text-center">
              <div className="inline-block w-16 h-16 rounded-full border-8 border-blue-400 flex items-center justify-center">
                <span className="text-md font-bold">10%</span>
              </div>
              <div className="mt-2 font-medium">Investments</div>
              <div className="text-sm text-gray-500">£513.00</div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            Total Monthly Income: £5,133.00
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 