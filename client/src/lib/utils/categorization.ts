import { Transaction } from "@shared/schema";

// Main financial categories
export const CATEGORIES = [
  'Essentials',
  'Lifestyle',
  'Savings',
  'Income'
];

// Sub-categories for different main categories
export const SUB_CATEGORIES: Record<string, string[]> = {
  'Essentials': ['Rent/Mortgage', 'Utilities', 'Groceries', 'Transport', 'Insurance', 'Healthcare', 'Debt Repayment'],
  'Lifestyle': ['Dining Out', 'Entertainment', 'Shopping', 'Travel', 'Gifts', 'Subscriptions', 'Hobbies'],
  'Savings': ['Emergency Fund', 'Retirement', 'Investment', 'Property', 'Education', 'Future Goals'],
  'Income': ['Salary', 'Side Hustle', 'Investment Income', 'Rental Income', 'Benefits', 'Gifts Received', 'Tax Refund']
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
  { name: "Salary", patterns: ["salary", "wage", "payroll", "payment from employer"], category: "Income", subcategory: "Salary", confidence: 0.95 },
  { name: "Freelance", patterns: ["freelance", "contract work", "client payment"], category: "Income", subcategory: "Side Hustle", confidence: 0.85 },
  { name: "Dividends", patterns: ["dividend", "share", "investment income"], category: "Income", subcategory: "Investment Income", confidence: 0.9 },
  { name: "Rental Income", patterns: ["rent received", "tenant", "property income"], category: "Income", subcategory: "Rental Income", confidence: 0.9 },
  { name: "Benefits", patterns: ["universal credit", "benefit", "allowance", "hmrc", "gov.uk", "dwp"], category: "Income", subcategory: "Benefits", confidence: 0.9 },
  { name: "Gift", patterns: ["gift received", "money gift"], category: "Income", subcategory: "Gifts Received", confidence: 0.7 },
  { name: "Tax Refund", patterns: ["tax refund", "hmrc refund", "rebate"], category: "Income", subcategory: "Tax Refund", confidence: 0.95 },
  
  // Essentials - Housing
  { name: "Mortgage", patterns: ["mortgage", "home loan"], category: "Essentials", subcategory: "Rent/Mortgage", confidence: 0.95 },
  { name: "Rent", patterns: ["rent", "landlord", "letting", "estate agent"], category: "Essentials", subcategory: "Rent/Mortgage", confidence: 0.9 },
  
  // Essentials - Utilities
  { name: "Electricity", patterns: ["electric", "electricity", "power", "eon", "edf", "bulb", "octopus energy"], category: "Essentials", subcategory: "Utilities", confidence: 0.9 },
  { name: "Gas", patterns: ["gas", "british gas", "eon gas"], category: "Essentials", subcategory: "Utilities", confidence: 0.9 },
  { name: "Water", patterns: ["water", "thames water", "severn trent", "anglian"], category: "Essentials", subcategory: "Utilities", confidence: 0.9 },
  { name: "Council Tax", patterns: ["council tax", "council", "local authority"], category: "Essentials", subcategory: "Utilities", confidence: 0.95 },
  { name: "Internet", patterns: ["internet", "broadband", "bt", "virgin media", "sky broadband", "plusnet", "talktalk"], category: "Essentials", subcategory: "Utilities", confidence: 0.9 },
  { name: "Mobile Phone", patterns: ["mobile", "phone", "o2", "ee", "vodafone", "three", "giffgaff"], category: "Essentials", subcategory: "Utilities", confidence: 0.8 },
  
  // Essentials - Groceries
  { name: "Tesco", patterns: ["tesco"], category: "Essentials", subcategory: "Groceries", confidence: 0.9 },
  { name: "Sainsbury's", patterns: ["sainsbury"], category: "Essentials", subcategory: "Groceries", confidence: 0.9 },
  { name: "Asda", patterns: ["asda"], category: "Essentials", subcategory: "Groceries", confidence: 0.9 },
  { name: "Morrisons", patterns: ["morrisons"], category: "Essentials", subcategory: "Groceries", confidence: 0.9 },
  { name: "Aldi", patterns: ["aldi"], category: "Essentials", subcategory: "Groceries", confidence: 0.9 },
  { name: "Lidl", patterns: ["lidl"], category: "Essentials", subcategory: "Groceries", confidence: 0.9 },
  { name: "Waitrose", patterns: ["waitrose"], category: "Essentials", subcategory: "Groceries", confidence: 0.9 },
  { name: "M&S Food", patterns: ["m&s food", "marks & spencer food", "marks and spencer food"], category: "Essentials", subcategory: "Groceries", confidence: 0.9 },
  { name: "Co-op", patterns: ["co-op", "coop"], category: "Essentials", subcategory: "Groceries", confidence: 0.9 },
  { name: "Iceland", patterns: ["iceland"], category: "Essentials", subcategory: "Groceries", confidence: 0.9 },
  { name: "Grocery", patterns: ["grocery", "food", "supermarket"], category: "Essentials", subcategory: "Groceries", confidence: 0.8 },
  
  // Essentials - Transport
  { name: "Fuel", patterns: ["fuel", "petrol", "diesel", "shell", "bp", "esso", "texaco"], category: "Essentials", subcategory: "Transport", confidence: 0.9 },
  { name: "Public Transport", patterns: ["transport", "train", "railway", "bus", "coach", "tube", "underground", "oyster", "tfl"], category: "Essentials", subcategory: "Transport", confidence: 0.9 },
  { name: "Car Maintenance", patterns: ["mot", "service", "repair", "garage", "kwik fit", "halfords"], category: "Essentials", subcategory: "Transport", confidence: 0.8 },
  { name: "Parking", patterns: ["parking", "ncp", "ringo"], category: "Essentials", subcategory: "Transport", confidence: 0.9 },
  { name: "Taxi", patterns: ["taxi", "uber", "bolt", "gett", "cab"], category: "Essentials", subcategory: "Transport", confidence: 0.8 },
  
  // Essentials - Insurance
  { name: "Home Insurance", patterns: ["home insurance", "house insurance", "contents insurance"], category: "Essentials", subcategory: "Insurance", confidence: 0.95 },
  { name: "Car Insurance", patterns: ["car insurance", "auto insurance", "vehicle insurance"], category: "Essentials", subcategory: "Insurance", confidence: 0.95 },
  { name: "Health Insurance", patterns: ["health insurance", "medical insurance", "bupa", "axa"], category: "Essentials", subcategory: "Insurance", confidence: 0.95 },
  { name: "Life Insurance", patterns: ["life insurance", "life cover", "life plan"], category: "Essentials", subcategory: "Insurance", confidence: 0.95 },
  { name: "Travel Insurance", patterns: ["travel insurance"], category: "Essentials", subcategory: "Insurance", confidence: 0.9 },
  { name: "Insurance", patterns: ["insurance", "aviva", "direct line", "churchill", "lv", "legal & general"], category: "Essentials", subcategory: "Insurance", confidence: 0.9 },
  
  // Essentials - Healthcare
  { name: "Pharmacy", patterns: ["pharmacy", "boots", "chemist", "superdrug", "prescription"], category: "Essentials", subcategory: "Healthcare", confidence: 0.9 },
  { name: "Doctor", patterns: ["doctor", "gp", "medical", "hospital", "clinic", "nhs"], category: "Essentials", subcategory: "Healthcare", confidence: 0.9 },
  { name: "Dental", patterns: ["dental", "dentist", "orthodontist"], category: "Essentials", subcategory: "Healthcare", confidence: 0.9 },
  { name: "Optician", patterns: ["optician", "optometrist", "glasses", "contact lenses", "vision express", "specsavers"], category: "Essentials", subcategory: "Healthcare", confidence: 0.9 },
  
  // Essentials - Debt Repayment
  { name: "Credit Card", patterns: ["credit card payment", "credit card", "amex payment", "visa payment"], category: "Essentials", subcategory: "Debt Repayment", confidence: 0.9 },
  { name: "Loan", patterns: ["loan", "loan payment", "loan repayment"], category: "Essentials", subcategory: "Debt Repayment", confidence: 0.9 },
  { name: "Student Loan", patterns: ["student loan", "slc", "student finance"], category: "Essentials", subcategory: "Debt Repayment", confidence: 0.95 },
  { name: "Debt Consolidation", patterns: ["debt", "debt payment", "debt settlement", "debt repayment"], category: "Essentials", subcategory: "Debt Repayment", confidence: 0.9 },
  
  // Lifestyle - Dining Out
  { name: "Restaurant", patterns: ["restaurant", "dining", "eatery"], category: "Lifestyle", subcategory: "Dining Out", confidence: 0.9 },
  { name: "Fast Food", patterns: ["mcdonalds", "burger king", "kfc", "subway", "dominos", "pizza hut", "wendys", "taco bell"], category: "Lifestyle", subcategory: "Dining Out", confidence: 0.9 },
  { name: "Coffee Shop", patterns: ["coffee", "costa", "starbucks", "caffe nero", "pret", "cafe"], category: "Lifestyle", subcategory: "Dining Out", confidence: 0.9 },
  { name: "Takeaway", patterns: ["takeaway", "just eat", "deliveroo", "uber eats", "take out"], category: "Lifestyle", subcategory: "Dining Out", confidence: 0.9 },
  { name: "Pub", patterns: ["pub", "bar", "tavern", "wetherspoons"], category: "Lifestyle", subcategory: "Dining Out", confidence: 0.9 },
  
  // Lifestyle - Entertainment
  { name: "Cinema", patterns: ["cinema", "odeon", "vue", "cineworld", "picturehouse", "showcase"], category: "Lifestyle", subcategory: "Entertainment", confidence: 0.9 },
  { name: "Theatre", patterns: ["theatre", "theater", "play", "musical", "show"], category: "Lifestyle", subcategory: "Entertainment", confidence: 0.9 },
  { name: "Concert", patterns: ["concert", "gig", "festival", "ticket master", "live music", "o2 arena"], category: "Lifestyle", subcategory: "Entertainment", confidence: 0.9 },
  { name: "Sports Event", patterns: ["match", "game", "stadium", "sports event"], category: "Lifestyle", subcategory: "Entertainment", confidence: 0.8 },
  { name: "Streaming", patterns: ["netflix", "disney+", "amazon prime", "apple tv", "now tv", "hulu", "hbo"], category: "Lifestyle", subcategory: "Subscriptions", confidence: 0.95 },
  { name: "Music", patterns: ["spotify", "apple music", "tidal", "deezer", "youtube music"], category: "Lifestyle", subcategory: "Subscriptions", confidence: 0.95 },
  
  // Lifestyle - Shopping
  { name: "Amazon", patterns: ["amazon"], category: "Lifestyle", subcategory: "Shopping", confidence: 0.9 },
  { name: "eBay", patterns: ["ebay"], category: "Lifestyle", subcategory: "Shopping", confidence: 0.9 },
  { name: "Clothing", patterns: ["clothing", "fashion", "apparel", "h&m", "zara", "primark", "next", "asos", "tk maxx"], category: "Lifestyle", subcategory: "Shopping", confidence: 0.9 },
  { name: "Electronics", patterns: ["electronics", "currys", "argos", "apple store", "samsung", "john lewis"], category: "Lifestyle", subcategory: "Shopping", confidence: 0.9 },
  { name: "Home Goods", patterns: ["home goods", "furniture", "ikea", "dunelm", "home sense", "wilko", "the range"], category: "Lifestyle", subcategory: "Shopping", confidence: 0.9 },
  { name: "Beauty", patterns: ["beauty", "cosmetics", "makeup", "skincare", "sephora", "boots beauty"], category: "Lifestyle", subcategory: "Shopping", confidence: 0.9 },
  { name: "Books", patterns: ["books", "waterstones", "barnes", "kindle"], category: "Lifestyle", subcategory: "Shopping", confidence: 0.9 },
  
  // Lifestyle - Travel
  { name: "Hotel", patterns: ["hotel", "accommodation", "lodging", "airbnb", "booking.com", "hotels.com", "expedia", "holiday inn", "premier inn", "travelodge"], category: "Lifestyle", subcategory: "Travel", confidence: 0.9 },
  { name: "Flight", patterns: ["flight", "airline", "british airways", "easyjet", "ryanair", "jet2", "virgin atlantic", "emirates"], category: "Lifestyle", subcategory: "Travel", confidence: 0.95 },
  { name: "Holiday", patterns: ["holiday", "vacation", "resort", "package holiday", "all inclusive", "tui", "thomas cook"], category: "Lifestyle", subcategory: "Travel", confidence: 0.9 },
  { name: "Car Rental", patterns: ["car rental", "car hire", "hertz", "avis", "enterprise", "europcar", "sixt"], category: "Lifestyle", subcategory: "Travel", confidence: 0.9 },
  { name: "Travel Agency", patterns: ["travel agent", "travel agency", "tour", "expedia", "lastminute"], category: "Lifestyle", subcategory: "Travel", confidence: 0.9 },
  
  // Lifestyle - Gifts
  { name: "Gift", patterns: ["gift", "present", "gift shop"], category: "Lifestyle", subcategory: "Gifts", confidence: 0.8 },
  { name: "Charity", patterns: ["charity", "donation", "oxfam", "red cross", "cancer research", "save the children"], category: "Lifestyle", subcategory: "Gifts", confidence: 0.9 },
  { name: "Greeting Cards", patterns: ["card", "card shop", "card factory", "clintons"], category: "Lifestyle", subcategory: "Gifts", confidence: 0.9 },
  
  // Lifestyle - Subscriptions (beyond streaming)
  { name: "Software", patterns: ["software", "subscription", "microsoft", "adobe", "app store", "google play", "apple store"], category: "Lifestyle", subcategory: "Subscriptions", confidence: 0.9 },
  { name: "Magazine", patterns: ["magazine", "publication", "subscription"], category: "Lifestyle", subcategory: "Subscriptions", confidence: 0.9 },
  { name: "Membership", patterns: ["membership", "subscription"], category: "Lifestyle", subcategory: "Subscriptions", confidence: 0.8 },
  
  // Lifestyle - Hobbies
  { name: "Gym", patterns: ["gym", "fitness", "exercise", "pure gym", "virgin active", "david lloyd", "leisure centre"], category: "Lifestyle", subcategory: "Hobbies", confidence: 0.9 },
  { name: "Sports", patterns: ["sports", "sporting goods", "decathlon", "sports direct"], category: "Lifestyle", subcategory: "Hobbies", confidence: 0.9 },
  { name: "Arts", patterns: ["art", "craft", "hobby", "hobbycraft"], category: "Lifestyle", subcategory: "Hobbies", confidence: 0.9 },
  { name: "Gaming", patterns: ["game", "playstation", "xbox", "nintendo", "steam", "gaming"], category: "Lifestyle", subcategory: "Hobbies", confidence: 0.9 },
  
  // Savings
  { name: "Emergency Fund", patterns: ["emergency fund", "rainy day", "emergency savings"], category: "Savings", subcategory: "Emergency Fund", confidence: 0.95 },
  { name: "Retirement", patterns: ["retirement", "pension", "sipp", "annuity"], category: "Savings", subcategory: "Retirement", confidence: 0.95 },
  { name: "Investment", patterns: ["investment", "investing", "vanguard", "fidelity", "stocks", "shares", "bond", "fund", "isa"], category: "Savings", subcategory: "Investment", confidence: 0.95 },
  { name: "Property", patterns: ["property investment", "real estate", "house deposit", "down payment"], category: "Savings", subcategory: "Property", confidence: 0.9 },
  { name: "Education", patterns: ["education", "tuition", "school", "university", "course", "learning"], category: "Savings", subcategory: "Education", confidence: 0.9 },
  { name: "Goal", patterns: ["goal", "target", "milestone", "future"], category: "Savings", subcategory: "Future Goals", confidence: 0.8 }
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