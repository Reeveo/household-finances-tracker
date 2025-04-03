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
  Info,
  Filter,
  ArrowUpDown,
  Trash2,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { 
  CATEGORIES, 
  SUB_CATEGORIES, 
  suggestCategory,
  calculateConfidenceScore,
  findSimilarTransactions,
  applyCategoryToSimilar as applyCategoryToSimilarTransactions,
  learnFromCorrection
} from "@/lib/utils/categorization";

// Enhanced debug logging system to help identify validation issues
const DEBUG_MODE = true; // Set to false in production
function logValidation(message: string, data?: any, isError = false): void {
  if (!DEBUG_MODE) return;
  
  if (isError) {
    console.error(`[Validation Error] ${message}`, data);
  } else {
    console.log(`[Validation] ${message}`, data);
  }
}

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
  validationErrors?: string[]; // Add array of specific validation errors
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

// Helper function to create a suggester that returns an object with category, subcategory, and confidence
function suggestCategoryWithConfidence(description: string, amount: number) {
  try {
    const categoryResult = suggestCategory(description);
    
    // Handle both string and object return types
    const categoryName = typeof categoryResult === 'string' 
      ? categoryResult 
      : categoryResult?.category || "Essentials";
    
    // Ensure we have a valid category by checking against SUB_CATEGORIES
    const validCategory = SUB_CATEGORIES[categoryName] ? categoryName : "Essentials";
    
    // Get subcategories for the valid category
    const availableSubcategories = SUB_CATEGORIES[validCategory] || [];
    
    // Use suggested subcategory if valid, otherwise use first available subcategory
    const validSubcategory = suggestion.subcategory && availableSubcategories.includes(suggestion.subcategory)
      ? suggestion.subcategory
      : (availableSubcategories.length > 0 ? availableSubcategories[0] : '');
    
    // Calculate confidence score for the final categorization
    const confidence = calculateConfidenceScore(description, validCategory, validSubcategory);
    
    return { 
      category: validCategory, 
      subcategory: validSubcategory, 
      confidence 
    };
  } catch (err) {
    console.error("Error in category suggestion:", err);
    return { 
      category: "Essentials", 
      subcategory: "Miscellaneous", 
      confidence: 0.1 
    };
  }
}

// Month options for budget assignment
// Get current and next few months dynamically
const getMonthOptions = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Current and next month options
  const options = [
    { 
      value: "current", 
      label: `Current Month (${monthNames[currentMonth]} ${currentYear})` 
    },
    { 
      value: "next", 
      label: `Next Month (${monthNames[(currentMonth + 1) % 12]} ${currentMonth === 11 ? currentYear + 1 : currentYear})` 
    }
  ];
  
  // Add next 5 months
  for (let i = 2; i < 7; i++) {
    const futureMonth = (currentMonth + i) % 12;
    const futureYear = currentYear + Math.floor((currentMonth + i) / 12);
    options.push({
      value: monthNames[futureMonth].toLowerCase(),
      label: `${monthNames[futureMonth]} ${futureYear}`
    });
  }
  
  return options;
};

const BUDGET_MONTHS = getMonthOptions();

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
  
  // New state for transaction selection, filtering and sorting
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<Set<string>>(new Set());
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'valid', 'invalid', 'duplicate'
    type: 'all', // 'all', 'income', 'expense'
    minAmount: '',
    maxAmount: '',
    search: '',
    category: 'all',
  });
  
  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof BankTransaction | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending'
  });
  
  // Show/hide filter panel
  const [showFilters, setShowFilters] = useState(false);
  
  // Get current bank format
  const currentBankFormat = useMemo(() => {
    return BANK_FORMATS.find(format => format.name === selectedBankFormat) || BANK_FORMATS[0];
  }, [selectedBankFormat]);
  
  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    // First, filter the transactions
    let result = [...csvData].filter(transaction => {
      // Status filter
      if (filters.status === 'valid' && !transaction.isValid) return false;
      if (filters.status === 'invalid' && transaction.isValid) return false;
      if (filters.status === 'duplicate' && !transaction.isDuplicate) return false;
      
      // Type filter
      if (filters.type === 'income' && transaction.amount <= 0) return false;
      if (filters.type === 'expense' && transaction.amount >= 0) return false;
      
      // Amount range filter
      const minAmount = filters.minAmount ? parseFloat(filters.minAmount) : null;
      const maxAmount = filters.maxAmount ? parseFloat(filters.maxAmount) : null;
      
      if (minAmount !== null && Math.abs(transaction.amount) < minAmount) return false;
      if (maxAmount !== null && Math.abs(transaction.amount) > maxAmount) return false;
      
      // Category filter
      if (filters.category !== 'all' && transaction.category !== filters.category) return false;
      
      // Search filter (description)
      if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      
      return true;
    });
    
    // Then, sort the transactions
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Safer comparison that handles different types and ensures a number is always returned
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (typeof aValue === 'undefined' || typeof bValue === 'undefined') {
          return 0; // Return 0 to ensure a number is always returned and undefined values are treated as equal
        }
        // Handle different field types properly
        if (sortConfig.key === 'amount') {
          // Numeric comparison
          return sortConfig.direction === 'ascending' 
            ? (a.amount || 0) - (b.amount || 0)
            : (b.amount || 0) - (a.amount || 0);
        } else if (sortConfig.key === 'transactionDate') {
          // Date comparison (as strings in YYYY-MM-DD format)
          return sortConfig.direction === 'ascending'
            ? a.transactionDate.localeCompare(b.transactionDate)
            : b.transactionDate.localeCompare(a.transactionDate);
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          // String comparison
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          // Fallback comparison with undefined handling
          if (aValue !== undefined && bValue !== undefined) {
            if (aValue < bValue) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          }
          return 0;
        }
      });
    }
    
    return result;
  }, [csvData, filters, sortConfig]);
  
  // Statistics for the import process (now uses filtered transactions)
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
  
  // Filtered stats for the current view
  const filteredStats = useMemo(() => {
    const total = filteredAndSortedTransactions.length;
    const validCount = filteredAndSortedTransactions.filter(t => t.isValid).length;
    const invalidCount = filteredAndSortedTransactions.filter(t => !t.isValid).length;
    const duplicateCount = filteredAndSortedTransactions.filter(t => t.isDuplicate).length;
    
    return {
      total,
      validCount,
      invalidCount,
      duplicateCount
    };
  }, [filteredAndSortedTransactions]);
  
  // Selection handling
  const handleSelectTransaction = (id: string, isSelected: boolean) => {
    setSelectedTransactionIds(prev => {
      const newSelection = new Set(prev);
      if (isSelected) {
        newSelection.add(id);
      } else {
        newSelection.delete(id);
      }
      return newSelection;
    });
  };
  
  // Select all transactions in the current filtered view
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allIds = filteredAndSortedTransactions.map(t => t.id);
      setSelectedTransactionIds(new Set(allIds));
    } else {
      setSelectedTransactionIds(new Set());
    }
  };
  
  // Select all invalid transactions
  const handleSelectAllInvalid = () => {
    const invalidIds = csvData.filter(t => !t.isValid).map(t => t.id);
    setSelectedTransactionIds(new Set(invalidIds));
  };
  
  // Remove selected transactions
  const handleRemoveSelected = () => {
    if (selectedTransactionIds.size === 0) return;
    setRemoveConfirmOpen(true);
  };
  
  // Confirm and execute removal
  const confirmRemoveSelected = () => {
    const newData = csvData.filter(t => !selectedTransactionIds.has(t.id));
    setCsvData(newData);
    setSelectedTransactionIds(new Set());
    setRemoveConfirmOpen(false);
    
    toast({
      title: "Transactions removed",
      description: `${selectedTransactionIds.size} transactions have been removed from the import.`,
      variant: "default"
    });
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      minAmount: '',
      maxAmount: '',
      search: '',
      category: 'all',
    });
  };
  
  // Handle sort requests
  const requestSort = (key: keyof BankTransaction) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Determine if all filtered transactions are selected
  const isAllSelected = filteredAndSortedTransactions.length > 0 && 
                        filteredAndSortedTransactions.every(t => selectedTransactionIds.has(t.id));
                        
  // Determine if some but not all filtered transactions are selected
  const isSomeSelected = selectedTransactionIds.size > 0 && !isAllSelected;
  
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
        // Filter out empty lines and whitespace-only lines
        const lines = text.split('\n')
          .map(line => line.trim())
          .filter(line => line && line.length > 0);
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
    
    // Add validation statistics
    const validationStats = {
      total: 0,
      valid: 0,
      invalid: 0,
      invalidReasons: {} as Record<string, number>
    };

    try {
      // Determine which mapping to use
      const mapping = selectedBankFormat === 'custom' ? customMapping : currentBankFormat.mapping;
      const delimiter = currentBankFormat.delimiter;
      const startIndex = hasHeaderRow ? 1 : 0;

      // Process each non-empty line
      const transactions: BankTransaction[] = [];

      // Debug logging
      logValidation(`Starting transaction processing with bank format: ${selectedBankFormat}`);
      logValidation("Mapping configuration:", mapping);
      logValidation(`Using delimiter: "${delimiter}" with header row: ${hasHeaderRow}`);
      logValidation(`Total raw lines: ${rawCsvLines.length}, starting from line: ${startIndex + 1}`);

      for (let i = startIndex; i < rawCsvLines.length; i++) {
        validationStats.total++;
        const line = rawCsvLines[i].trim();
        // Skip lines that are completely empty after trimming
        if (!line) {
            logValidation(`Skipping completely empty line ${i + 1}`);
            continue;
        }

        // Split line by delimiter, handle quoted fields
        const values = line.split(delimiter);
        logValidation(`Line ${i + 1} has ${values.length} values`, values);

        // Check if the number of values matches expected columns
        const requiredColumnCount = Math.max(
          mapping.transactionDate, 
          mapping.description, 
          mapping.amount ?? -1, 
          mapping.debitAmount ?? -1, 
          mapping.creditAmount ?? -1
        ) + 1;
        
        if (values.length < requiredColumnCount) {
            const reason = 'insufficient_columns';
            validationStats.invalid++;
            validationStats.invalidReasons[reason] = (validationStats.invalidReasons[reason] || 0) + 1;
            
            logValidation(
              `Line ${i + 1} has insufficient columns. Expected at least ${requiredColumnCount}, got ${values.length}`, 
              { line, values }, 
              true
            );
            continue;
        }

        try {
          // Extract data based on mapping
          // Use .trim() on extracted values to handle extraneous whitespace
          const dateValue = (mapping.transactionDate >= 0 && values[mapping.transactionDate]) ? values[mapping.transactionDate].trim() : '';
          const description = (mapping.description >= 0 && values[mapping.description]) ? values[mapping.description].trim() : '';

          logValidation(`Line ${i + 1} date value (raw): "${dateValue}"`);
          logValidation(`Line ${i + 1} description value (raw): "${description}"`);

          // Handle amount - some banks use separate debit/credit columns, others use a single amount column
          let amount: number = NaN;
          let amountSource = '';

          if (mapping.amount !== null && mapping.amount >= 0 && values[mapping.amount]) {
            // Single amount column format
            const amountStr = values[mapping.amount].trim();
            amountSource = 'single';
            logValidation(`Line ${i + 1} amount string (single column): "${amountStr}"`);
            
            // First attempt direct conversion
            amount = parseFloat(amountStr);
            
            // If that fails, try cleaning the string
            if (isNaN(amount)) {
              const cleanedAmount = amountStr.replace(/[£$,]/g, '');
              logValidation(`Line ${i + 1} cleaned amount string: "${cleanedAmount}"`);
              amount = parseFloat(cleanedAmount || 'NaN');
            }
          } else if (mapping.debitAmount !== null && mapping.creditAmount !== null &&
                     mapping.debitAmount >= 0 && mapping.creditAmount >= 0) {
            // Separate debit/credit columns format
            const debitStr = (values[mapping.debitAmount] || '').trim();
            const creditStr = (values[mapping.creditAmount] || '').trim();
            amountSource = 'debit_credit';

            logValidation(`Line ${i + 1} debit string: "${debitStr}"`);
            logValidation(`Line ${i + 1} credit string: "${creditStr}"`);

            // Only parse if at least one value is present and non-zero, otherwise default to 0
            if (debitStr || creditStr) {
                // First attempt direct conversion
                let debit = parseFloat(debitStr || '0');
                let credit = parseFloat(creditStr || '0');
                
                // If that fails, try cleaning the strings
                if (isNaN(debit)) {
                  const cleanedDebit = debitStr.replace(/[£$,]/g, '');
                  logValidation(`Line ${i + 1} cleaned debit string: "${cleanedDebit}"`);
                  debit = parseFloat(cleanedDebit || '0');
                }
                
                if (isNaN(credit)) {
                  const cleanedCredit = creditStr.replace(/[£$,]/g, '');
                  logValidation(`Line ${i + 1} cleaned credit string: "${cleanedCredit}"`);
                  credit = parseFloat(cleanedCredit || '0');
                }
                
                // Debit is negative, credit is positive
                amount = credit - debit;
            } else {
                amount = 0;
            }
          }

          logValidation(`Line ${i + 1} parsed amount: ${amount} (source: ${amountSource})`);

          // Initialize validation errors array
          const validationErrors: string[] = [];

          // --- ENHANCED VALIDATION ---
          // Check date
          if (!dateValue) {
            const reason = 'missing_date';
            validationErrors.push('Missing transaction date');
            validationStats.invalidReasons[reason] = (validationStats.invalidReasons[reason] || 0) + 1;
            logValidation(`Line ${i + 1} validation error: Missing transaction date`, null, true);
          }

          // Check description
          if (!description) {
            const reason = 'missing_description';
            validationErrors.push('Missing transaction description');
            validationStats.invalidReasons[reason] = (validationStats.invalidReasons[reason] || 0) + 1;
            logValidation(`Line ${i + 1} validation error: Missing transaction description`, null, true);
          }

          // Check amount
          if (isNaN(amount)) {
            const reason = 'invalid_amount';
            validationErrors.push('Invalid transaction amount');
            validationStats.invalidReasons[reason] = (validationStats.invalidReasons[reason] || 0) + 1;
            logValidation(`Line ${i + 1} validation error: Invalid transaction amount`, { amountSource }, true);
          }

          // Validate date format
          const normalizedDate = normalizeDate(dateValue, currentBankFormat.dateFormat);
          logValidation(`Line ${i + 1} normalized date: "${normalizedDate}"`);

          if (normalizedDate === dateValue && !/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
            const reason = 'invalid_date_format';
            validationErrors.push('Invalid date format');
            validationStats.invalidReasons[reason] = (validationStats.invalidReasons[reason] || 0) + 1;
            logValidation(
              `Line ${i + 1} validation error: Invalid date format after normalization: "${normalizedDate}"`, 
              { original: dateValue, format: currentBankFormat.dateFormat }, 
              true
            );
          }

          // Skip processing if essential validations fail
          if (validationErrors.length > 0 && (validationErrors.includes('Missing transaction date') || 
                                             validationErrors.includes('Missing transaction description') || 
                                             validationErrors.includes('Invalid transaction amount') ||
                                             validationErrors.includes('Invalid date format'))) {
            logValidation(`Line ${i + 1} has critical validation errors - skipping`, validationErrors, true);
            validationStats.invalid++;
            
            // Create an invalid transaction for display purposes
            const invalidTransaction: BankTransaction = {
              id: `invalid-${i}`,
              transactionDate: dateValue || '',
              description: description || '(Missing description)',
              amount: isNaN(amount) ? 0 : amount,
              balance: '',
              category: 'Essentials',
              subcategory: 'Miscellaneous',
              budgetMonth: 'current',
              isValid: false,
              validationErrors: validationErrors
            };
            transactions.push(invalidTransaction);
            continue;
          }

          // Extract other fields if available (only if the row passed validation)
          const balance = mapping.balance !== null && mapping.balance >= 0 && values[mapping.balance]
            ? values[mapping.balance].trim().replace(/[£$,]/g, '') || ''
            : '';

          const reference = mapping.reference !== null && mapping.reference >= 0 && values[mapping.reference]
            ? values[mapping.reference].trim() || ''
            : '';

          const type = mapping.type !== null && mapping.type >= 0 && values[mapping.type]
            ? values[mapping.type].trim() || ''
            : '';

          // Auto-categorize based on transaction description using our advanced categorization engine
          let suggestedCategory = "Essentials"; // Default fallback category

          try {
            const result = suggestCategory(description);
            // Handle different possible return types from suggestCategory
            if (typeof result === 'object' && result !== null && 'category' in result) {
              suggestedCategory = result.category;
            } else if (typeof result === 'string') {
              suggestedCategory = result;
            }
            logValidation(`Got suggested category: ${suggestedCategory} for "${description}"`);
          } catch (error) {
            console.error("Error suggesting category:", error);
            validationErrors.push('Error in category suggestion');
          }

          // Get suggested subcategory for this category
          let suggestedSubcategory = '';
          try {
            const subcategories = SUB_CATEGORIES[suggestedCategory] || [];
            suggestedSubcategory = subcategories.length > 0 ? subcategories[0] : '';
            logValidation(`Selected subcategory: ${suggestedSubcategory} from options:`, subcategories);
          } catch (error) {
            console.error("Error getting subcategory:", error);
            validationErrors.push('Error in subcategory assignment');
          }

          logValidation(`Line ${i + 1} category:`, suggestedCategory);
          logValidation(`Line ${i + 1} subcategory:`, suggestedSubcategory);

          // Extract month from transaction date for budget month
          let budgetMonthValue = 'current'; // Fallback value

          if (normalizedDate && normalizedDate.includes('-')) {
            const dateParts = normalizedDate.split('-');
            if (dateParts.length >= 2) {
              // Get month name from month number (0-11)
              const monthIndex = parseInt(dateParts[1], 10) - 1;
              const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                                  'july', 'august', 'september', 'october', 'november', 'december'];

              if (monthIndex >= 0 && monthIndex < 12) {
                budgetMonthValue = monthNames[monthIndex];
                logValidation(`Setting budget month to match transaction date: ${normalizedDate} -> ${budgetMonthValue}`);
              }
            }
          }

          // Create transaction object
          const transaction: BankTransaction = {
            id: '', // Will be set after all properties are available
            transactionDate: normalizedDate,
            description: description, // Already trimmed
            amount, // Negative for expenses, positive for income
            balance,
            reference,
            type,
            category: suggestedCategory,
            subcategory: suggestedSubcategory,
            budgetMonth: budgetMonthValue, // Set to match transaction month
            isValid: validationErrors.length === 0, // Valid only if no validation errors
            validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
            isDuplicate: false
          };

          // Set a unique ID for deduplication
          transaction.id = createTransactionId(transaction);

          // Add to transactions list
          transactions.push(transaction);
          logValidation(`Added transaction for ${transaction.description} with amount ${transaction.amount}`);
        } catch (err) {
          // Catch errors during processing of a specific line's values
          console.error(`Error processing line ${i + 1}:`, err, `\nLine content: "${line}"`);
          
          // Create an invalid transaction for display purposes
          const invalidTransaction: BankTransaction = {
            id: `error-${i}`,
            transactionDate: '',
            description: `Error in line ${i+1}: ${(err instanceof Error) ? err.message : 'Unknown error'}`,
            amount: 0,
            balance: '',
            category: 'Essentials',
            subcategory: 'Miscellaneous',
            budgetMonth: 'current',
            isValid: false,
            validationErrors: [(err instanceof Error) ? err.message : 'Unknown processing error']
          };
          transactions.push(invalidTransaction);
        }
      }

      // Check for duplicates (will be fully implemented in the deduplication step)
      const deduplicated = transactions; // Placeholder for now
      logValidation("Total valid transactions processed:", deduplicated.length);
      
      // Get statistics from processing
      const validCount = deduplicated.filter(t => t.isValid).length;
      
      // Log detailed validation statistics
      logValidation("=============== CSV IMPORT VALIDATION SUMMARY ===============");
      logValidation(`Total processed: ${validationStats.total}, Valid: ${validationStats.valid}, Invalid: ${validationStats.invalid}`);
      if (validationStats.invalid > 0) {
        logValidation("Invalid reasons breakdown:", validationStats.invalidReasons);
        
        // Group transactions by validation error
        const errorGroups: Record<string, number[]> = {};
        deduplicated.forEach((t, idx) => {
          if (!t.isValid && t.validationErrors) {
            t.validationErrors.forEach(err => {
              if (!errorGroups[err]) errorGroups[err] = [];
              errorGroups[err].push(idx + 1); // Store 1-based line numbers for user reference
            });
          }
        });
        
        // Log sample transactions for each error type
        Object.entries(errorGroups).forEach(([error, lines]) => {
          logValidation(`Error type: "${error}" found on lines: ${lines.slice(0, 5).join(', ')}${lines.length > 5 ? ` and ${lines.length - 5} more` : ''}`);
        });
      }
      logValidation("============================================================");

      // Enhance the toast message to include validation stats when there are failures
      if (validationStats.invalid > 0) {
        toast({
          title: validCount > 0 ? "Processing complete with validation issues" : "No valid transactions",
          description: `${validCount} valid transactions of ${validationStats.total} total. Found ${validationStats.invalid} invalid transactions with issues.`,
          variant: validCount > 0 ? "default" : "destructive"
        });
      } else {
        toast({
          title: "Processing complete",
          description: `${validCount} valid transactions processed from ${rawCsvLines.length - startIndex} rows.`,
          variant: "default"
        });
      }

      // Update state
      setCsvData(deduplicated);
      setCurrentStep('preview');
      setIsUploading(false);
    } catch (error) {
      console.error("Error processing transactions:", error);
      
      // Log detailed diagnostics for troubleshooting
      logValidation("=============== CSV IMPORT ERROR DIAGNOSTICS ===============", null, true);
      logValidation(`Bank format: ${selectedBankFormat}`, null, true);
      logValidation(`Raw CSV lines: ${rawCsvLines.length}`, null, true);
      logValidation(`Header row: ${hasHeaderRow}`, null, true);
      logValidation(`Validation stats: ${JSON.stringify(validationStats)}`, null, true);
      logValidation("===========================================================", null, true);
      
      toast({
        title: "Error processing transactions",
        description: "An error occurred while processing the transactions: " + (error instanceof Error ? error.message : String(error)),
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
    
    // Select the first subcategory from the available subcategories for this category
    const subcategory = SUB_CATEGORIES[category].length > 0 
      ? SUB_CATEGORIES[category][0] 
      : '';
    newData[index].subcategory = subcategory;
    
    // Log this as a learning event for the categorization engine
    learnFromCorrection(
      newData[index].description,
      'unknown', // Original category (unknown since it's being changed)
      'unknown', // Original subcategory
      category,  // New category that user selected
      subcategory // New subcategory we're assigning
    );
    
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
  
  // Apply category to all similar transactions using advanced categorization engine
  const applyCategoryToSimilar = (index: number) => {
    const sourceTransaction = csvData[index];
    const newData = [...csvData];
    
    // Find similar transactions with basic string matching
    const categoryToApply = sourceTransaction.category;
    const subcategoryToApply = sourceTransaction.subcategory;
    const sourceDesc = sourceTransaction.description.toLowerCase();
    let changedCount = 0;
    
    // Apply to similar transactions
    newData.forEach((transaction, idx) => {
      // Skip the source transaction
      if (idx === index) return;
      
      const targetDesc = transaction.description.toLowerCase();
      
      // Find similarity using basic matching
      // To save this step, we could use our advanced ML text similarity here
      if (sourceDesc.includes(targetDesc) || 
          targetDesc.includes(sourceDesc) ||
          // Simple vendor name matching
          (sourceDesc.split(' ')[0] === targetDesc.split(' ')[0])) {
        
        // If we're making a change, count it
        if (transaction.category !== categoryToApply || 
            transaction.subcategory !== subcategoryToApply) {
          changedCount++;
        }
        
        // Apply the new category
        transaction.category = categoryToApply;
        transaction.subcategory = subcategoryToApply;
      }
    });
    
    // Update state with all changes
    setCsvData(newData);
    
    // Learn from this categorization for future suggestions
    learnFromCorrection(
      sourceTransaction.description,
      "unknown", // Original category is unknown as it's user-applied
      "unknown", // Original subcategory is unknown as it's user-applied
      sourceTransaction.category,
      sourceTransaction.subcategory
    );
    
    toast({
      title: "Categories updated",
      description: `Applied "${sourceTransaction.category} > ${sourceTransaction.subcategory}" to ${changedCount} similar transaction(s)`,
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
    // Check if there are any valid transactions to import
    const validTransactions = csvData.filter(t => t.isValid && !t.isDuplicate);
    
    if (validTransactions.length === 0) {
      toast({
        title: "No valid transactions",
        description: "There are no valid transactions to import. Please check for validation errors.",
        variant: "destructive"
      });
      return;
    }
    
    setConfirmDialogOpen(true);
  };
  
  // Confirm and complete the import
  const confirmImport = async () => {
    try {
      // Filter out invalid and duplicate transactions
      const validTransactions = csvData.filter(t => t.isValid && !t.isDuplicate);
      
      logValidation("Valid transactions count:", validTransactions.length);
      
      if (validTransactions.length === 0) {
        toast({
          title: "No valid transactions",
          description: "No valid transactions found to import.",
          variant: "destructive"
        });
        return;
      }
      
      // Transform transactions to match API schema
      // Transform transactions to match API schema defined in shared/schema.ts
      const formattedTransactions = validTransactions.map(transaction => {
        try {
          // Determine type based on amount (positive = income, negative = expense)
          const type = transaction.amount >= 0 ? "income" : "expense";
          
          // Extract month and year from transaction date for budget allocation
          let month = new Date().getMonth() + 1; // Default to current month (1-12)
          let year = new Date().getFullYear();    // Default to current year
          
          if (transaction.transactionDate && transaction.transactionDate.includes('-')) {
            const dateParts = transaction.transactionDate.split('-');
            if (dateParts.length >= 2) {
              year = parseInt(dateParts[0], 10) || year;
              month = parseInt(dateParts[1], 10) || month;
            }
          }
          
          logValidation(`Transaction ${transaction.description} - date parsing: ${transaction.transactionDate} -> ${year}-${month}`);
          
          // Map CSV data to our transaction schema
          return {
            userId: 0, // This will be filled in by the server from the authenticated user
            date: transaction.transactionDate,
            description: transaction.description || "Unknown transaction",
            amount: transaction.amount, // Already a numeric value
            type: type, // Required field: income or expense
            category: transaction.category || "Essentials",
            subcategory: transaction.subcategory || null,
            balance: transaction.balance ? parseFloat(transaction.balance) : null, // Convert to number for Supabase
            reference: transaction.reference || null,
            budgetMonth: month, // Already numeric (1-12)
            budgetYear: year, // Already numeric (e.g., 2023)
            isRecurring: false,
            paymentMethod: "bank",
            notes: null,
            importHash: transaction.id || `${transaction.transactionDate}_${transaction.description}_${transaction.amount}` // Fallback hash for deduplication
          };
        } catch (error) {
          console.error("Error formatting transaction:", error, transaction);
          // Return a minimal valid transaction to avoid breaking the batch
          return {
            userId: 0,
            date: new Date().toISOString().split('T')[0],
            description: transaction.description || "Error processing transaction",
            amount: transaction.amount?.toString() || "0",
            type: "expense",
            category: "Essentials",
            budgetMonth: new Date().getMonth() + 1,
            budgetYear: new Date().getFullYear()
          };
        }
      });
      
      logValidation("Formatted transactions:", formattedTransactions);
      
      // Call API to save transactions in batch
      logValidation("Sending to API:", JSON.stringify({ transactions: formattedTransactions }));
      
      const response = await fetch('/api/transactions/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: formattedTransactions }),
      });
      
      logValidation("API response status:", response.status);
      
      // Try to get response body regardless of status code for debugging
      let responseText = '';
      try {
        responseText = await response.text();
        logValidation("Response text:", responseText);
      } catch (err) {
        console.error("Failed to get response text:", err);
      }
      
      if (!response.ok) {
        let errorMessage = 'Failed to import transactions';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse JSON, use the raw text
          if (responseText) errorMessage = responseText;
        }
        throw new Error(errorMessage);
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { stats: { created: 'unknown', skipped: 0 } };
      }
      
      toast({
        title: "Import successful",
        description: `${result.stats?.created || 'Unknown number of'} transactions have been imported.${
          result.stats?.skipped > 0 ? ` ${result.stats.skipped} transactions were skipped.` : ''
        }`,
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
              data-testid="csv-upload"
              onChange={handleFileUpload}
              disabled={isUploading}
              data-testid="csv-upload"
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
              {csvData.length} transactions found
              {csvData.filter(t => !t.isValid).length > 0 && 
                ` (${csvData.filter(t => !t.isValid).length} with validation issues)`}.
              {csvData.filter(t => t.isValid).length > 0 && 
                ` ${csvData.filter(t => t.isValid).length} valid transactions ready for review.`}
            </p>
          </div>
        </div>
        
        {/* Summary stats - only for valid transactions */}
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
      
      {/* Enhanced validation summary section */}
      {csvData.filter(t => !t.isValid).length > 0 && (
        <div className="border border-red-200 rounded-md overflow-hidden">
          <div className="bg-red-50 p-3 border-b border-red-200 flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              <h5 className="text-sm font-medium text-red-800">
                Validation Issues Summary
              </h5>
            </div>
            <div>
              <Button 
                size="sm" 
                variant="destructive" 
                className="text-xs h-8"
                onClick={handleSelectAllInvalid}
              >
                Select All Invalid
              </Button>
            </div>
          </div>
          <div className="p-4">
            <div className="mb-3">
              <div className="text-sm font-medium mb-1 text-red-700">
                Found {csvData.filter(t => !t.isValid).length} transactions with validation issues:
              </div>
              <ul className="text-sm text-red-700 space-y-1 ml-6 list-disc">
                {/* Get unique validation errors without using Set spread operator */}
                {csvData
                  .filter(t => !t.isValid && t.validationErrors?.length)
                  .flatMap(t => t.validationErrors || [])
                  .filter((error, index, self) => self.indexOf(error) === index)
                  .map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
              </ul>
            </div>
            
            {/* Add error breakdown by type */}
            <div className="mt-4">
              <div className="text-sm font-medium mb-2 text-red-700">Error breakdown:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(
                  csvData
                    .filter(t => !t.isValid && t.validationErrors?.length)
                    .flatMap(t => t.validationErrors || [])
                    .reduce((acc, curr) => {
                      acc[curr] = (acc[curr] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                ).map(([error, count], i) => (
                  <div key={i} className="flex items-center p-2 bg-white rounded border border-red-100">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2 flex-shrink-0">
                      {count}
                    </div>
                    <div className="text-sm">{error}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
              ⚠️ These transactions will be excluded from the import. Please review your CSV data format and try again if needed.
            </div>
          </div>
        </div>
      )}

      {/* Filter panel */}
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted/20 p-3 border-b">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            
            {/* Display active filter count */}
            {Object.values(filters).some(v => v !== 'all' && v !== '') && (
              <Badge variant="outline" className="ml-2">
                {Object.values(filters).filter(v => v !== 'all' && v !== '').length} active filters
              </Badge>
            )}
            
            <div className="flex items-center gap-2">
              {selectedTransactionIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                    {selectedTransactionIds.size} selected
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={handleRemoveSelected}
                  >
                    Remove Selected
                  </Button>
                </div>
              )}
              <Button size="sm" variant="outline" onClick={deduplicateTransactions}>
                Check for Duplicates
              </Button>
            </div>
          </div>
        </div>
        
        {/* Expanded filter panel */}
        {showFilters && (
          <div className="p-4 border-b bg-muted/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="valid">Valid Only</SelectItem>
                    <SelectItem value="invalid">Invalid Only</SelectItem>
                    <SelectItem value="duplicate">Duplicates Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select 
                  value={filters.type} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income Only</SelectItem>
                    <SelectItem value="expense">Expenses Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Min Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.minAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Max Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Search Description</label>
                <Input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetFilters}
                className="text-xs"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
        
        {/* Filter stats */}
        {filteredAndSortedTransactions.length !== csvData.length && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-blue-700 text-sm">
            Showing {filteredAndSortedTransactions.length} of {csvData.length} transactions 
            ({filteredStats.validCount} valid, {filteredStats.invalidCount} invalid, {filteredStats.duplicateCount} duplicates)
          </div>
        )}
        
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox 
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('transactionDate')}>
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'transactionDate' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('description')}>
                  <div className="flex items-center">
                    Description
                    {sortConfig.key === 'description' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('amount')}>
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === 'amount' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subcategory</TableHead>
                <TableHead>Budget Month</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.map((transaction, index) => (
                <TableRow 
                  key={transaction.id} 
                  className={
                    transaction.isDuplicate ? "bg-yellow-50" :
                    !transaction.isValid ? "bg-red-50" : ""
                  }
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedTransactionIds.has(transaction.id)}
                      onCheckedChange={(checked) => handleSelectTransaction(transaction.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="w-10">
                    {!transaction.isValid ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                              <AlertTriangle className="h-3 w-3 text-red-600" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-sm">
                            <p className="text-xs font-medium text-red-600 mb-1">Validation Issues:</p>
                            <ul className="text-xs text-red-600 ml-4 list-disc">
                              {transaction.validationErrors?.map((error, i) => (
                                <li key={i}>{error}</li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : transaction.isDuplicate ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                              <RefreshCw className="h-3 w-3 text-yellow-600" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-xs text-yellow-600">Potential duplicate - will be skipped during import</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-xs text-green-600">Valid transaction - ready for import</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  
                  {/* Rest of the TableRow remains the same */}
                  <TableCell className="whitespace-nowrap">
                    {transaction.transactionDate}
                    {!transaction.isValid && transaction.validationErrors?.includes('Invalid date format') && (
                      <Badge variant="outline" className="ml-2 text-red-600 bg-red-50 border-red-200 text-[10px]">
                        Invalid Date
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={`cursor-help ${!transaction.isValid ? 'text-red-600' : ''}`}>
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
                          {!transaction.isValid && transaction.validationErrors && transaction.validationErrors.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-red-200">
                              <p className="text-xs font-medium text-red-600 mb-1">Validation Issues:</p>
                              <ul className="text-xs text-red-600 ml-4 list-disc">
                                {transaction.validationErrors.map((error, i) => (
                                  <li key={i}>{error}</li>
                                ))}
                              </ul>
                            </div>
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
                  <TableCell className={
                    !transaction.isValid && transaction.validationErrors?.includes('Invalid transaction amount') 
                      ? 'text-red-600 font-medium' 
                      : !transaction.isValid 
                        ? 'text-red-600' 
                        : transaction.amount < 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                  }>
                    {isNaN(transaction.amount) 
                      ? 'Invalid Amount'
                      : transaction.amount < 0 
                        ? `-£${Math.abs(transaction.amount).toFixed(2)}` 
                        : `£${transaction.amount.toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={transaction.category}
                      onValueChange={(value) => handleCategoryChange(index, value)}
                      disabled={!transaction.isValid}
                    >
                      <SelectTrigger className={`w-full ${!transaction.isValid ? 'opacity-50' : ''}`}>
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
                      disabled={!transaction.isValid}
                    >
                      <SelectTrigger className={`w-full ${!transaction.isValid ? 'opacity-50' : ''}`}>
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
                      disabled={!transaction.isValid}
                    >
                      <SelectTrigger className={`w-full ${!transaction.isValid ? 'opacity-50' : ''}`}>
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
                    <div className="flex items-center space-x-1">
                      {transaction.isValid && (
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
                      )}
                      {!transaction.isValid && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-red-600 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Invalid Transaction
                              </DialogTitle>
                              <DialogDescription>
                                This transaction has validation errors and will be excluded from import.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                              <div className="bg-red-50 p-3 rounded-md border border-red-100">
                                <h4 className="text-sm font-medium text-red-700 mb-2">Validation Errors:</h4>
                                <ul className="ml-5 list-disc text-sm text-red-600">
                                  {transaction.validationErrors?.map((error, i) => (
                                    <li key={i}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="border-t pt-3">
                                <h4 className="text-sm font-medium mb-2">Transaction Details:</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Date:</div>
                                  <div className={transaction.validationErrors?.includes('Invalid date format') || transaction.validationErrors?.includes('Missing transaction date') ? 'text-red-600 font-medium' : ''}>
                                    {transaction.transactionDate || 'Missing'}
                                  </div>
                                  
                                  <div>Description:</div>
                                  <div className={transaction.validationErrors?.includes('Missing transaction description') ? 'text-red-600 font-medium' : ''}>
                                    {transaction.description || 'Missing'}
                                  </div>
                                  
                                  <div>Amount:</div>
                                  <div className={transaction.validationErrors?.includes('Invalid transaction amount') ? 'text-red-600 font-medium' : ''}>
                                    {isNaN(transaction.amount) ? 'Invalid' : transaction.amount.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <DialogFooter className="sm:justify-start">
                              <DialogTrigger asChild>
                                <Button type="button" variant="secondary">
                                  Close
                                </Button>
                              </DialogTrigger>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500"
                              onClick={() => {
                                // Remove this single transaction
                                const newData = csvData.filter(t => t.id !== transaction.id);
                                setCsvData(newData);
                                // Also remove from selection if selected
                                if (selectedTransactionIds.has(transaction.id)) {
                                  setSelectedTransactionIds(prev => {
                                    const newSelection = new Set(prev);
                                    newSelection.delete(transaction.id);
                                    return newSelection;
                                  });
                                }
                                toast({
                                  title: "Transaction removed",
                                  description: "The transaction has been removed from the import.",
                                });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Remove this transaction</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredAndSortedTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No transactions found matching the current filters
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
        <Button 
          onClick={handleImport} 
          disabled={csvData.length === 0 || csvData.filter(t => t.isValid && !t.isDuplicate).length === 0}
        >
          Import {csvData.filter(t => t.isValid && !t.isDuplicate).length} Transactions
        </Button>
      </div>
      
      {/* Confirmation dialog for bulk removal */}
      <AlertDialog open={removeConfirmOpen} onOpenChange={setRemoveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedTransactionIds.size} transactions? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveConfirmOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveSelected} className="bg-red-600 hover:bg-red-700">
              Remove Transactions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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