import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Transaction category options
const CATEGORIES = [
  'Essentials',
  'Lifestyle',
  'Savings',
  'Income'
];

// Sub-categories for different main categories
const SUB_CATEGORIES: Record<string, string[]> = {
  'Essentials': ['Rent/Mortgage', 'Utilities', 'Groceries', 'Transport', 'Insurance', 'Healthcare', 'Debt Repayment'],
  'Lifestyle': ['Dining Out', 'Entertainment', 'Shopping', 'Travel', 'Gifts', 'Subscriptions', 'Hobbies'],
  'Savings': ['Emergency Fund', 'Retirement', 'Investment', 'Property', 'Education', 'Future Goals'],
  'Income': ['Salary', 'Side Hustle', 'Investment Income', 'Rental Income', 'Benefits', 'Gifts Received', 'Tax Refund']
};

// Helper function to categorize transactions based on description
function suggestCategory(description: string): string {
  description = description.toLowerCase();
  
  // Income keywords
  if (description.includes('salary') || 
      description.includes('wage') || 
      description.includes('income') ||
      description.includes('payment from')) {
    return 'Income';
  }
  
  // Essentials keywords
  if (description.includes('mortgage') || 
      description.includes('rent') ||
      description.includes('utility') ||
      description.includes('water') ||
      description.includes('electric') ||
      description.includes('gas') ||
      description.includes('council tax') ||
      description.includes('grocery') ||
      description.includes('supermarket') ||
      description.includes('tesco') ||
      description.includes('sainsbury') ||
      description.includes('asda') ||
      description.includes('morrisons') ||
      description.includes('aldi') ||
      description.includes('lidl') ||
      description.includes('waitrose') ||
      description.includes('insurance') ||
      description.includes('transport') ||
      description.includes('train') ||
      description.includes('bus') ||
      description.includes('tube') ||
      description.includes('oyster') ||
      description.includes('healthcare') ||
      description.includes('pharmacy') ||
      description.includes('doctor') ||
      description.includes('loan') ||
      description.includes('repayment')) {
    return 'Essentials';
  }
  
  // Lifestyle keywords
  if (description.includes('restaurant') || 
      description.includes('cafe') ||
      description.includes('coffee') ||
      description.includes('takeaway') ||
      description.includes('cinema') ||
      description.includes('theatre') ||
      description.includes('entertainment') ||
      description.includes('shopping') ||
      description.includes('amazon') ||
      description.includes('ebay') ||
      description.includes('travel') ||
      description.includes('holiday') ||
      description.includes('hotel') ||
      description.includes('flight') ||
      description.includes('gift') ||
      description.includes('subscription') ||
      description.includes('netflix') ||
      description.includes('spotify') ||
      description.includes('hobby') ||
      description.includes('gym')) {
    return 'Lifestyle';
  }
  
  // Savings keywords
  if (description.includes('savings') || 
      description.includes('investment') ||
      description.includes('isa') ||
      description.includes('pension') ||
      description.includes('deposit') ||
      description.includes('stocks') ||
      description.includes('shares') ||
      description.includes('fund')) {
    return 'Savings';
  }
  
  // Default to Lifestyle if no match
  return 'Lifestyle';
}

// Helper function to suggest subcategory based on main category and description
function suggestSubcategory(category: string, description: string): string {
  const subcategories = SUB_CATEGORIES[category] || [];
  description = description.toLowerCase();
  
  // Return first subcategory as fallback
  if (subcategories.length === 0) return '';
  
  // Map of keywords to subcategories
  const keywordMap: Record<string, Record<string, string[]>> = {
    'Essentials': {
      'Rent/Mortgage': ['mortgage', 'rent', 'housing'],
      'Utilities': ['utility', 'water', 'electric', 'gas', 'internet', 'phone', 'council tax', 'broadband'],
      'Groceries': ['grocery', 'supermarket', 'tesco', 'sainsbury', 'asda', 'morrisons', 'aldi', 'lidl', 'waitrose', 'food'],
      'Transport': ['transport', 'train', 'bus', 'tube', 'oyster', 'fuel', 'petrol', 'parking', 'car'],
      'Insurance': ['insurance', 'protect', 'cover'],
      'Healthcare': ['healthcare', 'pharmacy', 'doctor', 'dental', 'medical'],
      'Debt Repayment': ['loan', 'repayment', 'credit card', 'debt']
    },
    'Lifestyle': {
      'Dining Out': ['restaurant', 'cafe', 'coffee', 'takeaway', 'food', 'dining', 'meal'],
      'Entertainment': ['cinema', 'theatre', 'entertainment', 'movie', 'concert', 'game'],
      'Shopping': ['shopping', 'amazon', 'ebay', 'clothes', 'purchase', 'buy'],
      'Travel': ['travel', 'holiday', 'hotel', 'flight', 'booking', 'vacation'],
      'Gifts': ['gift', 'present', 'charity', 'donation'],
      'Subscriptions': ['subscription', 'netflix', 'spotify', 'apple', 'disney', 'membership'],
      'Hobbies': ['hobby', 'gym', 'sport', 'class', 'activity', 'leisure']
    },
    'Savings': {
      'Emergency Fund': ['emergency', 'rainy day', 'backup'],
      'Retirement': ['retirement', 'pension', 'annuity'],
      'Investment': ['investment', 'stock', 'share', 'fund', 'portfolio', 'trading'],
      'Property': ['property', 'house', 'deposit', 'down payment'],
      'Education': ['education', 'school', 'tuition', 'course', 'learning'],
      'Future Goals': ['future', 'goal', 'target', 'milestone']
    },
    'Income': {
      'Salary': ['salary', 'wage', 'pay', 'income', 'employment'],
      'Side Hustle': ['freelance', 'gig', 'side', 'extra work', 'contract'],
      'Investment Income': ['dividend', 'interest', 'investment income', 'return'],
      'Rental Income': ['rent received', 'tenant', 'rental'],
      'Benefits': ['benefit', 'universal credit', 'allowance', 'credit', 'support'],
      'Gifts Received': ['gift received', 'money gift'],
      'Tax Refund': ['tax refund', 'hmrc', 'rebate']
    }
  };
  
  // Try to match keywords to subcategories
  const subcategoryMap = keywordMap[category] || {};
  
  for (const [subcategory, keywords] of Object.entries(subcategoryMap)) {
    for (const keyword of keywords) {
      if (description.includes(keyword)) {
        return subcategory;
      }
    }
  }
  
  // Default to first subcategory if no match
  return subcategories[0];
}

// Type for parsed bank transaction
type BankTransaction = {
  transactionDate: string;
  transactionType: string;
  sortCode: string;
  accountNumber: string;
  description: string;
  debitAmount: string;
  creditAmount: string;
  balance: string;
  
  // Added fields for categorization
  category: string;
  subcategory: string;
  
  // For UI state
  isValid: boolean;
  error?: string;
};

export function CSVImport() {
  const [csvData, setCsvData] = useState<BankTransaction[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    // Check file type
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      setIsUploading(false);
      return;
    }
    
    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        // Check header
        const header = lines[0].split(',');
        const expectedHeader = [
          'Transaction Date',
          'Transaction Type',
          'Sort Code',
          'Account Number',
          'Transaction Description',
          'Debit Amount',
          'Credit Amount',
          'Balance'
        ];
        
        // Validate header (case insensitive comparison)
        const headerValid = expectedHeader.every(column => 
          header.some(h => h.trim().toLowerCase() === column.toLowerCase())
        );
        
        if (!headerValid) {
          toast({
            title: "Invalid CSV format",
            description: "The CSV header doesn't match the expected format",
            variant: "destructive"
          });
          setIsUploading(false);
          return;
        }
        
        // Parse data (skip header row)
        const parsedData: BankTransaction[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines
          
          const values = lines[i].split(',');
          if (values.length !== 8) {
            // Skip malformed lines
            continue;
          }
          
          const description = values[4].trim();
          // Auto-categorize based on transaction description
          const suggestedCategory = suggestCategory(description);
          const suggestedSubcategory = suggestSubcategory(suggestedCategory, description);
          
          // Determine if it's income or expense
          const debitAmount = parseFloat(values[5] || '0');
          const creditAmount = parseFloat(values[6] || '0');
          
          parsedData.push({
            transactionDate: values[0].trim(),
            transactionType: values[1].trim(),
            sortCode: values[2].trim(),
            accountNumber: values[3].trim(),
            description: description,
            debitAmount: values[5].trim(),
            creditAmount: values[6].trim(),
            balance: values[7].trim(),
            category: suggestedCategory,
            subcategory: suggestedSubcategory,
            isValid: true
          });
        }
        
        setCsvData(parsedData);
        setIsUploading(false);
        setShowPreview(true);
      } catch (error) {
        toast({
          title: "Error parsing CSV",
          description: "An error occurred while parsing the CSV file",
          variant: "destructive"
        });
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "An error occurred while reading the file",
        variant: "destructive"
      });
      setIsUploading(false);
    };
    
    reader.readAsText(file);
  };
  
  const handleCategoryChange = (index: number, category: string) => {
    const newData = [...csvData];
    newData[index].category = category;
    // Update subcategory based on new category
    newData[index].subcategory = suggestSubcategory(category, newData[index].description);
    setCsvData(newData);
  };
  
  const handleSubcategoryChange = (index: number, subcategory: string) => {
    const newData = [...csvData];
    newData[index].subcategory = subcategory;
    setCsvData(newData);
  };
  
  const handleImport = () => {
    setConfirmDialogOpen(true);
  };
  
  const confirmImport = () => {
    // Here you would call your API to save the transactions
    // For now, let's just simulate the import
    toast({
      title: "Import successful",
      description: `${csvData.length} transactions have been imported.`,
      variant: "default"
    });
    
    // Reset state
    setConfirmDialogOpen(false);
    setShowPreview(false);
    setCsvData([]);
  };
  
  const cancelImport = () => {
    setConfirmDialogOpen(false);
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Import Bank Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {!showPreview ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-4">
                Upload your bank statement CSV file to import transactions
              </p>
              <p className="text-xs text-gray-500 mb-4">
                The CSV should include: Transaction Date, Transaction Type, Sort Code, Account Number, Transaction Description, Debit Amount, Credit Amount, Balance
              </p>
              <div>
                <label htmlFor="csv-upload">
                  <Button disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Select CSV File'}
                  </Button>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-100 p-4 rounded-md flex items-start">
              <FileCheck className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-800">File uploaded successfully</h4>
                <p className="text-sm text-green-700">
                  {csvData.length} transactions found. Review categories below before importing.
                </p>
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="bg-gray-50 sticky top-0">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Subcategory</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell className="whitespace-nowrap">
                          {transaction.transactionDate}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {transaction.description}
                        </TableCell>
                        <TableCell className={
                          parseFloat(transaction.debitAmount || '0') > 0 
                            ? 'text-red-500' 
                            : 'text-green-500'
                        }>
                          {parseFloat(transaction.debitAmount || '0') > 0 
                            ? `-£${transaction.debitAmount}` 
                            : `£${transaction.creditAmount}`}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={transaction.category}
                            onValueChange={(value) => handleCategoryChange(index, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={transaction.subcategory}
                            onValueChange={(value) => handleSubcategoryChange(index, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Subcategory" />
                            </SelectTrigger>
                            <SelectContent>
                              {SUB_CATEGORIES[transaction.category]?.map((subcat) => (
                                <SelectItem key={subcat} value={subcat}>
                                  {subcat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport}>
                Import {csvData.length} Transactions
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Import</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to import {csvData.length} transactions. This action cannot be undone.
              Make sure the categories are correctly assigned before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelImport}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>
              Import Transactions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}