import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CSVImportSimple() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Import Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-700 mb-2">Import From CSV</h3>
            <p className="text-blue-600 text-sm">
              Upload transaction data from your bank or financial institutions. 
              Supported formats include CSV files exported from most major banks and financial services.
            </p>
          </div>
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Drag and drop your CSV file here
              </p>
              <p className="text-xs text-gray-500 mb-4">
                or click to browse files
              </p>
              <button 
                type="button"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Select File
              </button>
            </div>
          </div>
          
          {/* Bank Templates */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Download Bank Templates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="border rounded-md p-3 flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold">B</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Barclays Template</h4>
                  <button className="text-xs text-indigo-600 hover:text-indigo-500">Download</button>
                </div>
              </div>
              
              <div className="border rounded-md p-3 flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-700 font-bold">L</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Lloyds Template</h4>
                  <button className="text-xs text-indigo-600 hover:text-indigo-500">Download</button>
                </div>
              </div>
              
              <div className="border rounded-md p-3 flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-700 font-bold">H</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">HSBC Template</h4>
                  <button className="text-xs text-indigo-600 hover:text-indigo-500">Download</button>
                </div>
              </div>
              
              <div className="border rounded-md p-3 flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-700 font-bold">N</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">NatWest Template</h4>
                  <button className="text-xs text-indigo-600 hover:text-indigo-500">Download</button>
                </div>
              </div>
              
              <div className="border rounded-md p-3 flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-700 font-bold">S</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Santander Template</h4>
                  <button className="text-xs text-indigo-600 hover:text-indigo-500">Download</button>
                </div>
              </div>
              
              <div className="border rounded-md p-3 flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 font-bold">+</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Generic Template</h4>
                  <button className="text-xs text-indigo-600 hover:text-indigo-500">Download</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 