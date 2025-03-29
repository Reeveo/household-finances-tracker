import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsExample() {
  const [activeTab, setActiveTab] = React.useState("tab1");
  
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-4">Tabs Example</h2>
      
      <Tabs defaultValue="tab1" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="tab1" 
            className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            onClick={() => console.log("Tab1 clicked")}
          >
            Tab 1
          </TabsTrigger>
          <TabsTrigger 
            value="tab2" 
            className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            onClick={() => console.log("Tab2 clicked")}
          >
            Tab 2
          </TabsTrigger>
          <TabsTrigger 
            value="tab3" 
            className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
            onClick={() => console.log("Tab3 clicked")}
          >
            Tab 3
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tab1" className="p-4 mt-4 border rounded-md">
          <h3 className="font-medium">Content for Tab 1</h3>
          <p className="text-gray-600 mt-2">This is the content for tab 1.</p>
        </TabsContent>
        
        <TabsContent value="tab2" className="p-4 mt-4 border rounded-md">
          <h3 className="font-medium">Content for Tab 2</h3>
          <p className="text-gray-600 mt-2">This is the content for tab 2.</p>
        </TabsContent>
        
        <TabsContent value="tab3" className="p-4 mt-4 border rounded-md">
          <h3 className="font-medium">Content for Tab 3</h3>
          <p className="text-gray-600 mt-2">This is the content for tab 3.</p>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 text-sm text-gray-500">
        Active tab: {activeTab}
      </div>
    </div>
  );
} 