import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Upload, 
  FileCheck, 
  AlertTriangle, 
  X, 
  Check, 
  RefreshCw, 
  FileQuestion, 
  ArrowRight,
  Columns,
  Calendar,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { 
  CATEGORIES, 
  SUB_CATEGORIES, 
  suggestCategory as suggestCategoryWithConfidence,
} from "@/lib/utils/categorization";

// Column Mapper Type
type ColumnMapping = {
  [K in 'transactionDate' | 'description']: number;
} & {
  [K in 'debitAmount' | 'creditAmount' | 'amount' | 'balance' | 'reference' | 'type']: number | null;
};

// Available Column Types
type ColumnType = keyof ColumnMapping;

// Supported Bank Statement Formats
type BankFormat = {
  name: string;
  description: string;
  mapping: ColumnMapping;
  dateFormat: string;
  delimiter: string;
};

// Type for parsed bank transaction
type BankTransaction = {
  id: string;  // Unique ID for deduplication (date + description + amount)
  transactionDate: string;
  description: string;
  amount: number;  // Negative for expenses, positive for income
  balance: string;
  reference?: string;
  type?: string;
  
  // Added fields for categorization
  category: string;
  subcategory: string;
  budgetMonth: string;  // For future month allocation
  
  // For UI state
  isValid: boolean;
  error?: string;
  isDuplicate?: boolean;
};

// Define supported bank formats
const BANK_FORMATS: BankFormat[] = [
  {
    name: "standard",
    description: "Standard UK Bank Format",
    mapping: {
      transactionDate: 0,
      type: 1,
      debitAmount: 5,
      creditAmount: 6,
      amount: null,
      description: 4,
      balance: 7,
      reference: null
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ","
  },
  {
    name: "barclays",
    description: "Barclays Bank",
    mapping: {
      transactionDate: 1,
      description: 5,
      amount: 3,
      debitAmount: null,
      creditAmount: null,
      balance: 4,
      reference: 6,
      type: 7
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ","
  },
  {
    name: "hsbc",
    description: "HSBC Bank",
    mapping: {
      transactionDate: 0,
      description: 3,
      debitAmount: 5,
      creditAmount: 6,
      amount: null,
      balance: 7,
      reference: 2,
      type: 1
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ","
  },
  {
    name: "lloyds",
    description: "Lloyds Bank",
    mapping: {
      transactionDate: 0,
      description: 4,
      amount: 5,
      debitAmount: null,
      creditAmount: null,
      balance: 6,
      reference: 3,
      type: 1
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ","
  },
  {
    name: "nationwide",
    description: "Nationwide",
    mapping: {
      transactionDate: 0,
      description: 3,
      debitAmount: 4,
      creditAmount: 5,
      amount: null,
      balance: 6,
      reference: 2,
      type: 1
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ","
  },
  {
    name: "natwest",
    description: "NatWest Bank",
    mapping: {
      transactionDate: 0,
      description: 3,
      debitAmount: 4,
      creditAmount: 5,
      amount: null,
      balance: 6,
      reference: 2,
      type: 1
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ","
  },
  {
    name: "santander",
    description: "Santander Bank",
    mapping: {
      transactionDate: 0,
      description: 3,
      amount: 4,
      debitAmount: null,
      creditAmount: null,
      balance: 5,
      reference: 2,
      type: 1
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ","
  },
  {
    name: "custom",
    description: "Custom Format (Manual Column Mapping)",
    mapping: {
      transactionDate: 0,
      description: 1,
      debitAmount: 2,
      creditAmount: 3,
      amount: null,
      balance: 4,
      reference: null,
      type: null
    },
    dateFormat: "DD/MM/YYYY",
    delimiter: ","
  }
];

// Helper to normalize banking date formats
function normalizeDate(dateString: string, format: string): string {
  // Handle common UK date formats: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, etc.
  try {
    // DD/MM/YYYY format (typical UK bank format)
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // YYYY-MM-DD format (ISO)
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // DD-MM-YYYY format
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // MM/DD/YYYY format (US)
    if (format === "MM/DD/YYYY" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
      const [month, day, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return dateString;
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
}

// Create a unique ID for deduplication
function createTransactionId(transaction: Partial<BankTransaction>): string {
  const date = transaction.transactionDate || '';
  const desc = transaction.description || '';
  const amount = transaction.amount?.toString() || '0';
  
  return `${date}_${desc}_${amount}`.replace(/\s+/g, '_');
}

// Month options for budget assignment
const BUDGET_MONTHS = [
  { value: "current", label: "Current Month (June 2023)" },
  { value: "next", label: "Next Month (July 2023)" },
  { value: "august", label: "August 2023" },
  { value: "september", label: "September 2023" },
  { value: "october", label: "October 2023" },
  { value: "november", label: "November 2023" },
  { value: "december", label: "December 2023" }
];

export function CSVImport() {
  // State for the import process
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<BankTransaction[]>([]);
  const [rawCsvLines, setRawCsvLines] = useState<string[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [selectedBankFormat, setSelectedBankFormat] = useState<string>("standard");
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'map' | 'preview' | 'deduplicate'>('upload');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [customMapping, setCustomMapping] = useState<ColumnMapping>(BANK_FORMATS.find(f => f.name === "custom")?.mapping || {
    transactionDate: 0,
    description: 1,
    debitAmount: 2,
    creditAmount: 3,
    amount: null,
    balance: 4,
    reference: null,
    type: null
  });
  const [showExistingTransactions, setShowExistingTransactions] = useState(false);
  const [hasHeaderRow, setHasHeaderRow] = useState(true);
  const { toast } = useToast();
  
  // Get current bank format
  const currentBankFormat = useMemo(() => {
    return BANK_FORMATS.find(format => format.name === selectedBankFormat) || BANK_FORMATS[0];
  }, [selectedBankFormat]);
  
  // Statistics for the import process
  const importStats = useMemo(() => {
    const total = csvData.length;
    const validCount = csvData.filter(t => t.isValid).length;
    const duplicateCount = csvData.filter(t => t.isDuplicate).length;
    const incomeCount = csvData.filter(t => t.amount > 0 && t.isValid).length;
    const expenseCount = csvData.filter(t => t.amount < 0 && t.isValid).length;
    const incomeTotal = csvData
      .filter(t => t.amount > 0 && t.isValid)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = csvData
      .filter(t => t.amount < 0 && t.isValid)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    return {
      total,
      validCount,
      duplicateCount,
      incomeCount,
      expenseCount,
      incomeTotal,
      expenseTotal
    };
  }, [csvData]);
  
  // Handle file selection
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setCsvFile(file);
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
        const lines = text.split('\n').filter(line => line.trim());
        setRawCsvLines(lines);
        
        if (lines.length === 0) {
          toast({
            title: "Empty file",
            description: "The CSV file appears to be empty",
            variant: "destructive"
          });
          setIsUploading(false);
          return;
        }
        
        // Check and extract headers
        const headerLine = lines[0];
        const columns = headerLine.split(currentBankFormat.delimiter).map(col => col.trim());
        setCsvColumns(columns);
        
        // If no bank format is auto-detected, ask user to manually map columns
        setCurrentStep('map');
        setIsUploading(false);
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
  
  // Apply the selected mapping to parse raw CSV data
  const processTransactions = () => {
    setIsUploading(true);
    
    try {
      // Determine which mapping to use
      const mapping = selectedBankFormat === 'custom' ? customMapping : currentBankFormat.mapping;
      const delimiter = currentBankFormat.delimiter;
      const startIndex = hasHeaderRow ? 1 : 0;
      
      // Process each non-empty line
      const transactions: BankTransaction[] = [];
      
      for (let i = startIndex; i < rawCsvLines.length; i++) {
        const line = rawCsvLines[i].trim();
        if (!line) continue;
        
        // Split line by delimiter, handle quoted fields
        const values = line.split(delimiter);
        
        try {
          // Extract data based on mapping
          const dateValue = mapping.transactionDate >= 0 ? values[mapping.transactionDate] : '';
          const description = mapping.description >= 0 ? values[mapping.description] : '';
          
          // Handle amount - some banks use separate debit/credit columns, others use a single amount column
          let amount = 0;
          
          if (mapping.amount !== null && mapping.amount >= 0) {
            // Single amount column format
            const amountStr = values[mapping.amount];
            amount = parseFloat(amountStr.replace(/[£$,]/g, '') || '0');
          } else if (mapping.debitAmount !== null && mapping.creditAmount !== null && 
                     mapping.debitAmount >= 0 && mapping.creditAmount >= 0) {
            // Separate debit/credit columns format
            const debitStr = values[mapping.debitAmount];
            const creditStr = values[mapping.creditAmount];
            
            const debit = parseFloat(debitStr.replace(/[£$,]/g, '') || '0');
            const credit = parseFloat(creditStr.replace(/[£$,]/g, '') || '0');
            
            // Debit is negative, credit is positive
            amount = credit - debit;
          }
          
          // Extract other fields if available
          const balance = mapping.balance !== null && mapping.balance >= 0 
            ? values[mapping.balance].replace(/[£$,]/g, '')
            : '';
            
          const reference = mapping.reference !== null && mapping.reference >= 0 
            ? values[mapping.reference]
            : '';
            
          const type = mapping.type !== null && mapping.type >= 0 
            ? values[mapping.type]
            : '';
            
          // Normalize date format
          const normalizedDate = normalizeDate(dateValue, currentBankFormat.dateFormat);
          
          // Auto-categorize based on transaction description
          const suggestedCategory = suggestCategory(description);
          const suggestedSubcategory = suggestSubcategory(suggestedCategory, description);
          
          // Create transaction object
          const transaction: BankTransaction = {
            id: '', // Will be set after all properties are available
            transactionDate: normalizedDate,
            description: description.trim(),
            amount, // Negative for expenses, positive for income
            balance,
            reference,
            type,
            category: suggestedCategory,
            subcategory: suggestedSubcategory,
            budgetMonth: 'current', // Default to current month
            isValid: true,
            isDuplicate: false
          };
          
          // Set a unique ID for deduplication
          transaction.id = createTransactionId(transaction);
          
          // Add to transactions list
          transactions.push(transaction);
        } catch (err) {
          // Skip invalid lines
          console.error(`Error processing line ${i+1}:`, err);
        }
      }
      
      // Check for duplicates (will be fully implemented in the deduplication step)
      const deduplicated = transactions;
      
      // Update state
      setCsvData(deduplicated);
      setCurrentStep('preview');
      setIsUploading(false);
      
      toast({
        title: "Processing complete",
        description: `${deduplicated.length} transactions processed`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error processing transactions:", error);
      toast({
        title: "Error processing transactions",
        description: "An error occurred while processing the transactions",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };
  
  // Handle changes to custom column mapping
  const updateCustomMapping = (columnType: ColumnType, columnIndex: number | null) => {
    setCustomMapping(prevMapping => {
      const newMapping = { ...prevMapping };
      
      // Special handling for amount vs debit/credit
      if (columnType === 'amount') {
        newMapping.amount = columnIndex;
        newMapping.debitAmount = null;
        newMapping.creditAmount = null;
      } else if (columnType === 'debitAmount' || columnType === 'creditAmount') {
        if (columnType === 'debitAmount') {
          newMapping.debitAmount = columnIndex;
        }
        if (columnType === 'creditAmount') {
          newMapping.creditAmount = columnIndex;
        }
        newMapping.amount = null;
      } else {
        // Handle optional column types that can be null
        switch (columnType) {
          case 'balance':
            newMapping.balance = columnIndex;
            break;
          case 'reference':
            newMapping.reference = columnIndex;
            break;
          case 'type':
            newMapping.type = columnIndex;
            break;
          case 'transactionDate':
            newMapping.transactionDate = columnIndex !== null ? columnIndex : 0; 
            break;
          case 'description':
            newMapping.description = columnIndex !== null ? columnIndex : 1;
            break;
          default:
            // TypeScript should have caught all cases, but just in case
            break;
        }
      }
      
      return newMapping;
    });
  };
  
  // Change category for a transaction
  const handleCategoryChange = (index: number, category: string) => {
    const newData = [...csvData];
    newData[index].category = category;
    // Update subcategory based on new category
    newData[index].subcategory = suggestSubcategory(category, newData[index].description);
    setCsvData(newData);
  };
  
  // Change subcategory for a transaction
  const handleSubcategoryChange = (index: number, subcategory: string) => {
    const newData = [...csvData];
    newData[index].subcategory = subcategory;
    setCsvData(newData);
  };
  
  // Change budget month for a transaction
  const handleBudgetMonthChange = (index: number, month: string) => {
    const newData = [...csvData];
    newData[index].budgetMonth = month;
    setCsvData(newData);
  };
  
  // Apply category to all similar transactions
  const applyCategoryToSimilar = (index: number) => {
    const sourceTransaction = csvData[index];
    const sourceDesc = sourceTransaction.description.toLowerCase();
    const newData = [...csvData];
    
    // Find transactions with similar descriptions and apply the same category/subcategory
    newData.forEach((transaction, idx) => {
      const targetDesc = transaction.description.toLowerCase();
      
      // Check if descriptions are similar
      if (sourceDesc.includes(targetDesc) || targetDesc.includes(sourceDesc)) {
        transaction.category = sourceTransaction.category;
        transaction.subcategory = sourceTransaction.subcategory;
      }
    });
    
    setCsvData(newData);
    
    toast({
      title: "Categories updated",
      description: `Applied "${sourceTransaction.category} > ${sourceTransaction.subcategory}" to similar transactions`,
      variant: "default"
    });
  };
  
  // Deduplicate transactions
  const deduplicateTransactions = () => {
    // In a real app, we would fetch existing transactions and compare
    // For this demo, we'll simulate some duplicates
    
    setCurrentStep('deduplicate');
    
    const existingTransactionIds = new Set([
      // Simulate some existing transaction IDs
      csvData[0]?.id,
      csvData[3]?.id,
    ]);
    
    // Mark duplicates
    const newData = csvData.map(transaction => ({
      ...transaction,
      isDuplicate: existingTransactionIds.has(transaction.id)
    }));
    
    setCsvData(newData);
    
    toast({
      title: "Duplicate check complete",
      description: `Found ${newData.filter(t => t.isDuplicate).length} potential duplicates`,
      variant: "default"
    });
  };
  
  // Handle import confirmation
  const handleImport = () => {
    setConfirmDialogOpen(true);
  };
  
  // Confirm and complete the import
  const confirmImport = async () => {
    try {
      // Filter out invalid and duplicate transactions
      const validTransactions = csvData.filter(t => t.isValid && !t.isDuplicate);
      
      if (validTransactions.length === 0) {
        toast({
          title: "No valid transactions",
          description: "No valid transactions found to import.",
          variant: "destructive"
        });
        return;
      }
      
      // Transform transactions to match API schema
      const formattedTransactions = validTransactions.map(transaction => ({
        date: transaction.transactionDate,
        description: transaction.description,
        amount: transaction.amount.toString(),
        category: transaction.category,
        subcategory: transaction.subcategory,
        type: transaction.type || "bank-transaction",
        balance: transaction.balance ? transaction.balance.toString() : null,
        reference: transaction.reference || null,
        budgetMonth: transaction.budgetMonth || null,
        isRecurring: false,
        paymentMethod: "bank",
        notes: null,
        importHash: transaction.id // Use the transaction ID as import hash to prevent duplicates
      }));
      
      // Call API to save transactions in batch
      const response = await fetch('/api/transactions/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: formattedTransactions }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import transactions');
      }
      
      const result = await response.json();
      
      toast({
        title: "Import successful",
        description: `${result.stats.created} transactions have been imported.${result.stats.skipped > 0 ? ` ${result.stats.skipped} transactions were skipped.` : ''}`,
        variant: "default"
      });
      
      // Reset state
      setConfirmDialogOpen(false);
      setCurrentStep('upload');
      setCsvFile(null);
      setRawCsvLines([]);
      setCsvColumns([]);
      setCsvData([]);
    } catch (error) {
      console.error('Error importing transactions:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import transactions",
        variant: "destructive"
      });
    }
  };
  
  // Cancel import
  const cancelImport = () => {
    setConfirmDialogOpen(false);
  };
  
  // Reset the import process
  const resetImport = () => {
    setCurrentStep('upload');
    setCsvFile(null);
    setRawCsvLines([]);
    setCsvColumns([]);
    setCsvData([]);
  };
  
  // Render upload step
  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-md bg-muted/30">
        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium mb-2">Upload Bank Statement CSV</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          Import transactions from your bank statement to automatically categorize and track your expenses.
        </p>
        
        <div className="w-full max-w-md mb-6">
          <div className="bg-muted p-4 rounded-md mb-3">
            <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
              <FileQuestion className="h-4 w-4" />
              Supported Bank Formats
            </h4>
            <div className="text-xs space-y-1 text-muted-foreground">
              {BANK_FORMATS.filter(f => f.name !== 'custom').map(format => (
                <div key={format.name} className="flex items-center">
                  <Badge variant="outline" className="mr-2 text-[10px]">{format.name}</Badge>
                  <span>{format.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex flex-col items-center gap-2">
            <Button 
              disabled={isUploading} 
              size="lg" 
              onClick={() => document.getElementById('csv-upload')?.click()}
            >
              {isUploading ? 'Processing...' : 'Select CSV File'}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render column mapping step
  const renderMappingStep = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-100 p-4 rounded-md flex items-start">
        <FileCheck className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-green-800">File uploaded successfully</h4>
          <p className="text-sm text-green-700">
            {csvFile?.name} • {rawCsvLines.length} rows • {csvColumns.length} columns
          </p>
        </div>
      </div>
      
      <div className="p-4 border rounded-md space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium flex items-center gap-1.5">
            <Columns className="h-4 w-4" />
            Column Mapping
          </h3>
          
          <div className="flex items-center gap-2">
            <Checkbox 
              id="has-header" 
              checked={hasHeaderRow}
              onCheckedChange={(checked) => setHasHeaderRow(!!checked)}
            />
            <label htmlFor="has-header" className="text-sm cursor-pointer">
              Has header row
            </label>
          </div>
        </div>
        
        <div>
          <Select 
            value={selectedBankFormat} 
            onValueChange={setSelectedBankFormat}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select bank format" />
            </SelectTrigger>
            <SelectContent>
              {BANK_FORMATS.map(format => (
                <SelectItem key={format.name} value={format.name}>
                  {format.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Preview of the CSV data */}
        <div className="border rounded-md overflow-hidden">
          <div className="max-h-40 overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0">
                <TableRow>
                  {csvColumns.map((col, idx) => (
                    <TableHead key={idx} className="text-xs px-2 py-1.5">
                      {idx}. {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawCsvLines.slice(hasHeaderRow ? 1 : 0, 3).map((line, lineIdx) => (
                  <TableRow key={lineIdx}>
                    {line.split(currentBankFormat.delimiter).map((cell, cellIdx) => (
                      <TableCell key={cellIdx} className="text-xs px-2 py-1.5 max-w-[150px] truncate">
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Custom mapping options (shown only for custom format) */}
        {selectedBankFormat === 'custom' && (
          <div className="space-y-3 p-4 border border-dashed rounded-md">
            <h4 className="text-sm font-medium">Custom Column Mapping</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date Column</label>
                <Select 
                  value={customMapping.transactionDate.toString()} 
                  onValueChange={(val) => updateCustomMapping('transactionDate', parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvColumns.map((_, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        Column {idx}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description Column</label>
                <Select 
                  value={customMapping.description.toString()} 
                  onValueChange={(val) => updateCustomMapping('description', parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvColumns.map((_, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        Column {idx}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Amount Format</label>
                <Select
                  value={customMapping.amount !== null ? 'single' : 'separate'}
                  onValueChange={(val) => {
                    if (val === 'single') {
                      updateCustomMapping('amount', 0);
                    } else {
                      updateCustomMapping('debitAmount', 0);
                      updateCustomMapping('creditAmount', 0);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Amount Column</SelectItem>
                    <SelectItem value="separate">Separate Debit/Credit Columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {customMapping.amount !== null ? (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Amount Column</label>
                  <Select 
                    value={customMapping.amount.toString()} 
                    onValueChange={(val) => updateCustomMapping('amount', parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {csvColumns.map((_, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                          Column {idx}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Debit Column</label>
                    <Select 
                      value={customMapping.debitAmount?.toString() || ''} 
                      onValueChange={(val) => updateCustomMapping('debitAmount', parseInt(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvColumns.map((_, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            Column {idx}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Credit Column</label>
                    <Select 
                      value={customMapping.creditAmount?.toString() || ''} 
                      onValueChange={(val) => updateCustomMapping('creditAmount', parseInt(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvColumns.map((_, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            Column {idx}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Balance Column (Optional)</label>
                <Select
                  value={customMapping.balance !== null ? customMapping.balance.toString() : '-1'}
                  onValueChange={(val) => {
                    const index = parseInt(val);
                    updateCustomMapping('balance', index >= 0 ? index : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Not Available</SelectItem>
                    {csvColumns.map((_, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        Column {idx}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Reference Column (Optional)</label>
                <Select
                  value={customMapping.reference !== null ? customMapping.reference.toString() : '-1'}
                  onValueChange={(val) => {
                    const index = parseInt(val);
                    updateCustomMapping('reference', index >= 0 ? index : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Not Available</SelectItem>
                    {csvColumns.map((_, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        Column {idx}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={resetImport}>
            Back
          </Button>
          <Button onClick={processTransactions} disabled={isUploading}>
            {isUploading ? 'Processing...' : 'Process Transactions'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
  
  // Render preview step
  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-100 p-4 rounded-md">
        <div className="flex items-start mb-3">
          <FileCheck className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-800">Transactions processed successfully</h4>
            <p className="text-sm text-green-700">
              {csvData.length} transactions found. Review and categorize before importing.
            </p>
          </div>
        </div>
        
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          <div className="bg-white p-2 rounded border border-gray-100">
            <div className="text-xs text-muted-foreground">Income Items</div>
            <div className="text-lg font-semibold">{importStats.incomeCount}</div>
          </div>
          <div className="bg-white p-2 rounded border border-gray-100">
            <div className="text-xs text-muted-foreground">Expense Items</div>
            <div className="text-lg font-semibold">{importStats.expenseCount}</div>
          </div>
          <div className="bg-white p-2 rounded border border-gray-100">
            <div className="text-xs text-muted-foreground">Total Income</div>
            <div className="text-lg font-semibold text-green-600">£{importStats.incomeTotal.toFixed(2)}</div>
          </div>
          <div className="bg-white p-2 rounded border border-gray-100">
            <div className="text-xs text-muted-foreground">Total Expenses</div>
            <div className="text-lg font-semibold text-red-600">£{importStats.expenseTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted/20 p-3 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Transaction Details</h3>
            <Button size="sm" variant="outline" onClick={deduplicateTransactions}>
              Check for Duplicates
            </Button>
          </div>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subcategory</TableHead>
                <TableHead>Budget Month</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.map((transaction, index) => (
                <TableRow 
                  key={transaction.id} 
                  className={transaction.isDuplicate ? "bg-yellow-50" : ""}
                >
                  <TableCell className="whitespace-nowrap">
                    {transaction.transactionDate}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            {transaction.description}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-sm">
                          <p>{transaction.description}</p>
                          {transaction.reference && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Reference: {transaction.reference}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {transaction.isDuplicate && (
                      <Badge variant="outline" className="ml-2 text-yellow-600 bg-yellow-50 border-yellow-200 text-[10px]">
                        Duplicate
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                    {transaction.amount < 0 
                      ? `-£${Math.abs(transaction.amount).toFixed(2)}` 
                      : `£${transaction.amount.toFixed(2)}`}
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
                  <TableCell>
                    <Select
                      value={transaction.budgetMonth}
                      onValueChange={(value) => handleBudgetMonthChange(index, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Budget Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUDGET_MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label.split(' ')[0]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => applyCategoryToSimilar(index)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Apply to similar transactions</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
              
              {csvData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('map')}>
          Back
        </Button>
        <Button onClick={handleImport} disabled={csvData.length === 0}>
          Import {csvData.filter(t => t.isValid && !t.isDuplicate).length} Transactions
        </Button>
      </div>
    </div>
  );
  
  // Render deduplication step
  const renderDeduplicateStep = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-800">Potential Duplicates Found</h4>
            <p className="text-sm text-yellow-700">
              Found {csvData.filter(t => t.isDuplicate).length} transactions that may already exist in your account.
            </p>
          </div>
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted/20 p-3 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Duplicate Transactions</h3>
            <div>
              <Button 
                size="sm" 
                variant="outline" 
                className="mr-2"
                onClick={() => setShowExistingTransactions(!showExistingTransactions)}
              >
                {showExistingTransactions ? "Hide Existing" : "Show Existing"}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setCurrentStep('preview')}
              >
                Back to All
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData
                .filter(t => t.isDuplicate || showExistingTransactions)
                .map((transaction) => (
                  <TableRow 
                    key={transaction.id} 
                    className={transaction.isDuplicate ? "bg-yellow-50" : ""}
                  >
                    <TableCell className="whitespace-nowrap">
                      {transaction.transactionDate}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                      {transaction.amount < 0 
                        ? `-£${Math.abs(transaction.amount).toFixed(2)}` 
                        : `£${transaction.amount.toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      {transaction.isDuplicate ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Potential Duplicate
                        </Badge>
                      ) : showExistingTransactions ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Existing Record
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          New Transaction
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.isDuplicate && (
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600"
                            onClick={() => {
                              const newData = csvData.map(t => {
                                if (t.id === transaction.id) {
                                  return { ...t, isDuplicate: false };
                                }
                                return t;
                              });
                              setCsvData(newData);
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => {
                              // Mark as invalid to skip during import
                              const newData = csvData.map(t => {
                                if (t.id === transaction.id) {
                                  return { ...t, isValid: false };
                                }
                                return t;
                              });
                              setCsvData(newData);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('preview')}>
          Back to Transactions
        </Button>
        <Button onClick={handleImport}>
          Continue with Import
        </Button>
      </div>
    </div>
  );
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Import Bank Transactions</CardTitle>
        <CardDescription>
          Import your bank statements for automatic categorization and budget tracking
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2">
            <div className={currentStep === 'upload' ? 'font-semibold text-primary' : 'text-muted-foreground'}>
              1. Upload CSV
            </div>
            <div className={currentStep === 'map' ? 'font-semibold text-primary' : 'text-muted-foreground'}>
              2. Map Columns
            </div>
            <div className={currentStep === 'preview' || currentStep === 'deduplicate' ? 'font-semibold text-primary' : 'text-muted-foreground'}>
              3. Review & Import
            </div>
          </div>
          
          <Progress 
            value={
              currentStep === 'upload' ? 0 :
              currentStep === 'map' ? 50 :
              100
            } 
            max={100} 
            className="h-2"
          />
        </div>
      
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'map' && renderMappingStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        {currentStep === 'deduplicate' && renderDeduplicateStep()}
      </CardContent>
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Import</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to import {csvData.filter(t => t.isValid && !t.isDuplicate).length} transactions. 
              {csvData.some(t => t.isDuplicate) && 
                ` ${csvData.filter(t => t.isDuplicate && t.isValid).length} potential duplicates will be skipped.`}
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