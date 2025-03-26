import { Transaction } from "@shared/schema";

// Main financial categories
export const CATEGORIES = [
  'Income',
  'Essentials',
  'Lifestyle',
  'Savings'
];

// Sub-categories for different main categories
export const SUB_CATEGORIES: Record<string, string[]> = {
  'Income': ['Salary', 'Investments', 'Freelance', 'Other Income'],
  'Essentials': ['Housing', 'Utilities', 'Groceries', 'Transport', 'Insurance', 'Healthcare', 'Debt Repayment'],
  'Lifestyle': ['Dining Out', 'Entertainment', 'Shopping', 'Clothing', 'Travel', 'Gifts', 'Subscriptions', 'Hobbies'],
  'Savings': ['Emergency Fund', 'Retirement', 'Investment', 'Property', 'Education', 'Future Goals']
};

// Map of merchants to their categories
export type MerchantMapping = {
  name: string;
  patterns: string[];
  category: string;
  subcategory: string;
  confidence: number;
};

// Merchants database with pattern matching and confidence levels
export const MERCHANT_MAPPINGS: MerchantMapping[] = [
  // Income
  { name: "Salary", patterns: ["salary", "payroll", "wage payment"], category: "Income", subcategory: "Salary", confidence: 0.95 },
  { name: "Investments", patterns: ["dividend", "stock yield", "investment income"], category: "Income", subcategory: "Investments", confidence: 0.9 },
  { name: "Freelance", patterns: ["upwork", "fiverr", "freelance"], category: "Income", subcategory: "Freelance", confidence: 0.85 },
  
  // Essentials - Groceries
  { name: "Tesco", patterns: ["tesco"], category: "Essentials", subcategory: "Groceries", confidence: 0.9 },
  { name: "Sainsbury's", patterns: ["sainsbury"], category: "Essentials", subcategory: "Groceries", confidence: 0.9 },
  
  // Lifestyle - Dining
  { name: "McDonald's", patterns: ["mcdonalds"], category: "Lifestyle", subcategory: "Dining Out", confidence: 0.9 },
  { name: "Pizza Express", patterns: ["pizza express"], category: "Lifestyle", subcategory: "Dining Out", confidence: 0.9 },
  
  // Essentials - Utilities
  { name: "British Gas", patterns: ["british gas"], category: "Essentials", subcategory: "Utilities", confidence: 0.9 },
  { name: "Water", patterns: ["water bill"], category: "Essentials", subcategory: "Utilities", confidence: 0.9 },
  
  // Lifestyle - Entertainment
  { name: "Netflix", patterns: ["netflix"], category: "Lifestyle", subcategory: "Entertainment", confidence: 0.95 },
  { name: "Spotify", patterns: ["spotify"], category: "Lifestyle", subcategory: "Entertainment", confidence: 0.95 },
  
  // Lifestyle - Shopping
  { name: "Amazon", patterns: ["amazon", "amzn"], category: "Lifestyle", subcategory: "Shopping", confidence: 0.9 },
  { name: "ASOS", patterns: ["asos"], category: "Lifestyle", subcategory: "Clothing", confidence: 0.9 },
  
  // Essentials - Transport
  { name: "Uber", patterns: ["uber"], category: "Essentials", subcategory: "Transport", confidence: 0.9 },
  { name: "TfL", patterns: ["tfl"], category: "Essentials", subcategory: "Transport", confidence: 0.9 },
  
  // Essentials - Housing
  { name: "Rent", patterns: ["rent payment"], category: "Essentials", subcategory: "Housing", confidence: 0.95 },
  { name: "Mortgage", patterns: ["mortgage payment"], category: "Essentials", subcategory: "Housing", confidence: 0.95 }
];

// Transaction learning cache to improve future categorizations
export type LearnedTransaction = {
  pattern: string;
  category: string;
  subcategory: string;
  confidence: number;
  frequency: number;
  lastUsed: Date;
};

// Default transaction learning cache
let transactionLearningCache: LearnedTransaction[] = [];

// Load transaction learning cache from localStorage
export function loadTransactionLearningCache(): void {
  try {
    const cached = localStorage.getItem('transactionLearningCache');
    if (cached) {
      transactionLearningCache = JSON.parse(cached);
      // Convert string dates back to Date objects
      transactionLearningCache.forEach(item => {
        item.lastUsed = new Date(item.lastUsed);
      });
    }
  } catch (error) {
    console.error('Failed to load transaction learning cache:', error);
    transactionLearningCache = [];
  }
}

// Save transaction learning cache to localStorage
export function saveTransactionLearningCache(): void {
  try {
    localStorage.setItem(
      'transactionLearningCache', 
      JSON.stringify(transactionLearningCache)
    );
  } catch (error) {
    console.error('Failed to save transaction learning cache:', error);
  }
}

// Normalize description text for better matching
function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

// Check if a transaction description contains any of the patterns
function matchesPatterns(text: string, patterns: string[]): boolean {
  const normalizedText = normalizeText(text);
  return patterns.some(pattern => 
    normalizedText.includes(normalizeText(pattern))
  );
}

// Find the best category match for a transaction description using merchant mappings
function findCategoryFromMerchants(
  description: string
): { category: string; subcategory: string; confidence: number } | null {
  const normalizedDesc = normalizeText(description);
  
  // First check the learning cache for previously learned patterns
  const learnedMatch = transactionLearningCache.find(item => 
    normalizedDesc.includes(normalizeText(item.pattern))
  );
  
  if (learnedMatch) {
    // Update usage statistics
    learnedMatch.frequency += 1;
    learnedMatch.lastUsed = new Date();
    saveTransactionLearningCache();
    
    return {
      category: learnedMatch.category,
      subcategory: learnedMatch.subcategory,
      confidence: learnedMatch.confidence
    };
  }
  
  // Then check predefined merchant mappings
  let bestMatch: MerchantMapping | null = null;
  let bestConfidence = 0;
  
  for (const mapping of MERCHANT_MAPPINGS) {
    if (matchesPatterns(description, mapping.patterns) && mapping.confidence > bestConfidence) {
      bestMatch = mapping;
      bestConfidence = mapping.confidence;
    }
  }
  
  if (bestMatch) {
    return {
      category: bestMatch.category,
      subcategory: bestMatch.subcategory,
      confidence: bestMatch.confidence
    };
  }
  
  return null;
}

// Suggest category and subcategory based on transaction description and amount
export function suggestCategory(
  description: string, 
  amount: number = 0
): { category: string; subcategory: string; confidence: number } {
  // Default to these if we can't determine a better match
  let result = {
    category: amount >= 0 ? 'Income' : 'Lifestyle',
    subcategory: amount >= 0 ? 'Salary' : 'Shopping',
    confidence: 0.5
  };
  
  // Try to find a match from merchant mappings
  const merchantMatch = findCategoryFromMerchants(description);
  if (merchantMatch) {
    return merchantMatch;
  }
  
  // Fallback to basic logic based on amount
  if (amount > 0) {
    result.category = 'Income';
    result.subcategory = 'Salary';
    result.confidence = 0.6;
  } else if (amount < 0) {
    // Use basic string matching for common expense categories
    const desc = description.toLowerCase();
    
    if (desc.includes('mortgage') || desc.includes('rent')) {
      result.category = 'Essentials';
      result.subcategory = 'Rent/Mortgage';
      result.confidence = 0.7;
    }
    else if (desc.includes('grocery') || desc.includes('supermarket')) {
      result.category = 'Essentials';
      result.subcategory = 'Groceries';
      result.confidence = 0.7;
    }
    else if (desc.includes('restaurant') || desc.includes('dining')) {
      result.category = 'Lifestyle';
      result.subcategory = 'Dining Out';
      result.confidence = 0.7;
    }
  }
  
  return result;
}

// Learn from user corrections to improve future categorizations
export function learnFromCorrection(
  description: string,
  originalCategory: string,
  originalSubcategory: string,
  correctedCategory: string,
  correctedSubcategory: string
): void {
  // Don't learn if no correction was made
  if (originalCategory === correctedCategory && originalSubcategory === correctedSubcategory) {
    return;
  }
  
  const normalizedDesc = normalizeText(description);
  
  // Check if we already have a learned pattern for this description
  const existingPattern = transactionLearningCache.find(item => 
    normalizedDesc.includes(normalizeText(item.pattern))
  );
  
  if (existingPattern) {
    // Update existing pattern with new category/subcategory
    existingPattern.category = correctedCategory;
    existingPattern.subcategory = correctedSubcategory;
    existingPattern.frequency += 1;
    existingPattern.lastUsed = new Date();
    existingPattern.confidence = Math.min(0.95, existingPattern.confidence + 0.05);
  } else {
    // Create a new learned pattern
    // Extract a good pattern from the description
    let pattern = normalizedDesc;
    // If description is long, try to extract the most meaningful part
    if (pattern.length > 10) {
      // Remove common prefixes like "payment to" or "purchase at"
      pattern = pattern
        .replace(/^payment (to|from) /i, '')
        .replace(/^purchase (at|from) /i, '')
        .replace(/^withdrawal (at|from) /i, '');
    }
    
    transactionLearningCache.push({
      pattern,
      category: correctedCategory,
      subcategory: correctedSubcategory,
      confidence: 0.8,
      frequency: 1,
      lastUsed: new Date()
    });
  }
  
  // Keep the cache from growing too large (limit to most recently used 200 items)
  if (transactionLearningCache.length > 200) {
    transactionLearningCache.sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
    transactionLearningCache = transactionLearningCache.slice(0, 200);
  }
  
  saveTransactionLearningCache();
}

// Find similar transactions based on description
export function findSimilarTransactions(
  description: string, 
  transactions: Transaction[]
): Transaction[] {
  const normalizedDesc = normalizeText(description);
  return transactions.filter(transaction => {
    const normalizedTransDesc = normalizeText(transaction.description);
    return normalizedTransDesc.includes(normalizedDesc) || 
           normalizedDesc.includes(normalizedTransDesc);
  });
}

// Apply consistent categorization to similar transactions
export function applyCategoryToSimilar(
  sourceTransaction: Transaction,
  transactions: Transaction[]
): Transaction[] {
  const sourceDesc = normalizeText(sourceTransaction.description);
  
  return transactions.map(transaction => {
    const targetDesc = normalizeText(transaction.description);
    
    // Check if descriptions are similar
    if (sourceDesc.includes(targetDesc) || targetDesc.includes(sourceDesc)) {
      return {
        ...transaction,
        category: sourceTransaction.category,
        subcategory: sourceTransaction.subcategory
      };
    }
    
    return transaction;
  });
}

// Calculate confidence score based on pattern matching
export function calculateConfidenceScore(
  description: string,
  category: string,
  subcategory: string
): number {
  // Start with minimum confidence
  let confidence = 0.5;
  
  // Check against merchant mappings
  for (const mapping of MERCHANT_MAPPINGS) {
    if (mapping.category === category && 
        mapping.subcategory === subcategory && 
        matchesPatterns(description, mapping.patterns)) {
      confidence = Math.max(confidence, mapping.confidence);
    }
  }
  
  // Check against learning cache
  const normalizedDesc = normalizeText(description);
  const learnedMatch = transactionLearningCache.find(item => 
    normalizedDesc.includes(normalizeText(item.pattern)) &&
    item.category === category && 
    item.subcategory === subcategory
  );
  
  if (learnedMatch) {
    confidence = Math.max(confidence, learnedMatch.confidence);
  }
  
  return confidence;
}

// Initialize the categorization module
export function initCategorizationEngine(): void {
  loadTransactionLearningCache();
}

// Function to categorize a transaction based on description and amount
export function categorizeTransaction(description: string, amount: number): { category: string; subcategory: string; type: string } {
  const normalizedDescription = normalizeText(description);
  const merchantMatch = findCategoryFromMerchants(normalizedDescription);
  const type = amount >= 0 ? 'income' : 'expense';

  // For income transactions
  if (type === 'income') {
    if (merchantMatch) {
      // Special case for investment income
      if (merchantMatch.subcategory === 'Investments') {
        return {
          category: 'Income',
          subcategory: 'Investments',
          type: 'income'
        };
      }
      return {
        category: merchantMatch.category,
        subcategory: merchantMatch.subcategory,
        type: 'income'
      };
    }
    // Default income categorization
    return {
      category: 'Income',
      subcategory: 'Other Income',
      type: 'income'
    };
  }

  // For expense transactions
  if (merchantMatch) {
    return {
      category: merchantMatch.category,
      subcategory: merchantMatch.subcategory,
      type: 'expense'
    };
  }

  // Default expense categorization
  return {
    category: 'Other',
    subcategory: 'Uncategorized',
    type: 'expense'
  };
}

// Function to extract payment method from transaction description
export function extractPaymentMethod(description: string): string | null {
  const normalizedDesc = normalizeText(description);
  
  // Order matters for digital payments to ensure correct matching
  const orderedPaymentMethods = [
    ['Apple Pay', ['apple pay']],
    ['Google Pay', ['google pay']],
    ['Samsung Pay', ['samsung pay']],
    ['PayPal', ['paypal', 'pp']],
    ['Direct Debit', ['direct debit']],
    ['Bank Transfer', ['transfer', 'bank transfer', 'standing order', 'faster payment']],
    ['Credit Card', ['credit card', 'visa', 'mastercard', 'amex']],
    ['Debit Card', ['debit card', 'visa debit', 'maestro', 'card payment']],
    ['Cash', ['cash', 'atm', 'withdrawal']]
  ] as const;

  for (const [method, patterns] of orderedPaymentMethods) {
    if (patterns.some(pattern => normalizedDesc.includes(pattern))) {
      return method;
    }
  }

  return null;
}

// Function to get default category based on keyword
export function getDefaultCategoryForKeyword(keyword: string): [string, string, string] | null {
  const normalizedKeyword = normalizeText(keyword);
  
  // Common keywords mapping
  const keywordMap: Record<string, [string, string, string]> = {
    // Income keywords
    'salary': ['Income', 'Salary', 'income'],
    'dividend': ['Income', 'Investments', 'income'],
    'freelance': ['Income', 'Freelance', 'income'],
    'interest': ['Income', 'Investments', 'income'],
    
    // Expense keywords - Utilities
    'electricity': ['Essentials', 'Utilities', 'expense'],
    'electric': ['Essentials', 'Utilities', 'expense'],
    'gas': ['Essentials', 'Utilities', 'expense'],
    'water': ['Essentials', 'Utilities', 'expense'],
    'utilities': ['Essentials', 'Utilities', 'expense'],
    'internet': ['Essentials', 'Utilities', 'expense'],
    'broadband': ['Essentials', 'Utilities', 'expense'],
    'phone': ['Essentials', 'Utilities', 'expense'],
    'council tax': ['Essentials', 'Utilities', 'expense'],
    
    // Expense keywords - Housing
    'rent': ['Essentials', 'Housing', 'expense'],
    'mortgage': ['Essentials', 'Housing', 'expense'],
    'housing': ['Essentials', 'Housing', 'expense'],
    'property': ['Essentials', 'Housing', 'expense'],
    
    // Expense keywords - Entertainment
    'netflix': ['Lifestyle', 'Entertainment', 'expense'],
    'spotify': ['Lifestyle', 'Entertainment', 'expense'],
    'cinema': ['Lifestyle', 'Entertainment', 'expense'],
    'movie': ['Lifestyle', 'Entertainment', 'expense'],
    'theatre': ['Lifestyle', 'Entertainment', 'expense'],
    'concert': ['Lifestyle', 'Entertainment', 'expense'],
    'show': ['Lifestyle', 'Entertainment', 'expense'],
    'game': ['Lifestyle', 'Entertainment', 'expense'],
    'entertainment': ['Lifestyle', 'Entertainment', 'expense'],
    
    // Other expense keywords
    'groceries': ['Essentials', 'Groceries', 'expense'],
    'dining': ['Lifestyle', 'Dining Out', 'expense'],
    'restaurant': ['Lifestyle', 'Dining Out', 'expense'],
    'shopping': ['Lifestyle', 'Shopping', 'expense'],
    'transport': ['Essentials', 'Transport', 'expense'],
    'amazon': ['Lifestyle', 'Shopping', 'expense'],
    'mcdonalds': ['Lifestyle', 'Dining Out', 'expense']
  };

  // Check for exact matches first
  if (keywordMap[normalizedKeyword]) {
    return keywordMap[normalizedKeyword];
  }

  // Check for partial matches
  for (const [pattern, mapping] of Object.entries(keywordMap)) {
    if (normalizedKeyword.includes(pattern)) {
      return mapping;
    }
  }

  // Check merchant mappings as a fallback
  const merchantMatch = findCategoryFromMerchants(normalizedKeyword);
  if (merchantMatch) {
    const type = merchantMatch.category === 'Income' ? 'income' : 'expense';
    return [merchantMatch.category, merchantMatch.subcategory, type];
  }

  return null;
}