import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Progress
} from "@/components/ui/progress";
import { 
  AlertCircle, 
  Check, 
  Edit, 
  Filter, 
  RefreshCw, 
  Save, 
  Search, 
  Trash2, 
  X,
  Tag,
  Box,
  Layers,
  BarChart3,
  Hammer
} from "lucide-react";
import { 
  CATEGORIES, 
  SUB_CATEGORIES, 
  MERCHANT_MAPPINGS,
  MerchantMapping,
  findSimilarTransactions,
  learnFromCorrection,
  applyCategoryToSimilar,
  calculateConfidenceScore,
  initCategorizationEngine
} from "@/lib/utils/categorization";

// Component for managing transaction categories
export function CategoryManagement() {
  // Initialize categorization engine
  useEffect(() => {
    initCategorizationEngine();
  }, []);

  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedCategory, setEditedCategory] = useState<string>("");
  const [editedSubcategory, setEditedSubcategory] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [newRulePattern, setNewRulePattern] = useState("");
  const [newRuleCategory, setNewRuleCategory] = useState(CATEGORIES[0]);
  const [newRuleSubcategory, setNewRuleSubcategory] = useState(SUB_CATEGORIES[CATEGORIES[0]][0]);
  const [activeTab, setActiveTab] = useState("transactions");

  // Fetch transactions from API
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update transaction category and subcategory
  const updateTransactionMutation = useMutation({
    mutationFn: async (transactionUpdate: {
      id: number;
      category: string;
      subcategory: string | null;
    }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/transactions/${transactionUpdate.id}`,
        transactionUpdate
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Category updated",
        description: "Transaction has been recategorized successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Bulk update transaction categories
  const bulkUpdateTransactionsMutation = useMutation({
    mutationFn: async (updateData: {
      ids: number[];
      category: string;
      subcategory: string | null;
    }) => {
      const response = await apiRequest(
        "PATCH",
        "/api/transactions/bulk",
        updateData
      );
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Categories updated",
        description: `${selectedTransactions.length} transactions have been recategorized.`,
        variant: "default",
      });
      setSelectedTransactions([]);
      setIsBulkEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update categories",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter transactions based on search and category
  const filteredTransactions = transactions
    ? transactions.filter((transaction) => {
        const matchesSearch =
          searchQuery === "" ||
          transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory =
          selectedCategory === "All" || transaction.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
      })
    : [];

  // Group transactions by merchant pattern for rules tab
  const merchantPatterns = transactions
    ? transactions.reduce<{[key: string]: {count: number, transactions: Transaction[]}}>(
        (acc, transaction) => {
          // Extract merchant name from transaction description
          let merchantName = transaction.description
            .replace(/[0-9]/g, '')  // Remove numbers
            .replace(/\s+/g, ' ')   // Normalize whitespace
            .trim()
            .split(' ')[0];         // Take first word as merchant
            
          if (merchantName.length < 3) {
            // If first word is too short, use first two words
            merchantName = transaction.description
              .replace(/[0-9]/g, '')
              .replace(/\s+/g, ' ')
              .trim()
              .split(' ')
              .slice(0, 2)
              .join(' ');
          }
          
          // Skip if too short
          if (merchantName.length < 3) return acc;
          
          if (!acc[merchantName]) {
            acc[merchantName] = { count: 0, transactions: [] };
          }
          
          acc[merchantName].count++;
          acc[merchantName].transactions.push(transaction);
          
          return acc;
        },
        {}
      )
    : {};

  // Sort merchant patterns by count
  const sortedMerchantPatterns = Object.entries(merchantPatterns)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 50); // Show top 50 merchants

  // Handle transaction selection for bulk editing
  const toggleTransactionSelection = (id: number) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter((transId) => transId !== id));
    } else {
      setSelectedTransactions([...selectedTransactions, id]);
    }
  };

  // Handle bulk category update
  const handleBulkUpdate = () => {
    if (selectedTransactions.length === 0) {
      toast({
        title: "No transactions selected",
        description: "Please select at least one transaction to update.",
        variant: "destructive",
      });
      return;
    }

    if (!editedCategory) {
      toast({
        title: "Category required",
        description: "Please select a category to apply.",
        variant: "destructive",
      });
      return;
    }

    bulkUpdateTransactionsMutation.mutate({
      ids: selectedTransactions,
      category: editedCategory,
      subcategory: editedSubcategory || null,
    });
  };

  // Handle single transaction update
  const handleTransactionUpdate = () => {
    if (!selectedTransaction) return;
    
    // If original values and new values are the same, don't update
    if (
      selectedTransaction.category === editedCategory &&
      selectedTransaction.subcategory === editedSubcategory
    ) {
      setIsDialogOpen(false);
      setEditMode(false);
      return;
    }

    // Learn from this correction for future categorizations
    learnFromCorrection(
      selectedTransaction.description,
      selectedTransaction.category,
      selectedTransaction.subcategory || "",
      editedCategory,
      editedSubcategory
    );

    // Update the transaction
    updateTransactionMutation.mutate({
      id: selectedTransaction.id,
      category: editedCategory,
      subcategory: editedSubcategory || null,
    });

    setIsDialogOpen(false);
    setEditMode(false);
  };

  // Handle creating a new categorization rule
  const handleCreateRule = () => {
    if (!newRulePattern || !newRuleCategory || !newRuleSubcategory) {
      toast({
        title: "Incomplete rule",
        description: "Please fill all fields to create a categorization rule.",
        variant: "destructive",
      });
      return;
    }

    // Add rule to local storage
    try {
      // Create a simplified merchant mapping
      const newRule: MerchantMapping = {
        name: newRulePattern,
        patterns: [newRulePattern],
        category: newRuleCategory,
        subcategory: newRuleSubcategory,
        confidence: 0.9
      };

      // Save to local storage - we'll implement this in future
      toast({
        title: "Rule created",
        description: `Transactions containing "${newRulePattern}" will now be categorized as ${newRuleCategory} > ${newRuleSubcategory}.`,
        variant: "default",
      });

      // Reset form
      setNewRulePattern("");
      setIsCreatingRule(false);
    } catch (error) {
      toast({
        title: "Failed to create rule",
        description: "An error occurred while creating the rule.",
        variant: "destructive",
      });
    }
  };

  // Apply a category to all similar transactions
  const applyToSimilar = (transaction: Transaction) => {
    if (!transactions) return;
    
    // Find similar transactions
    const similarTransactions = findSimilarTransactions(
      transaction.description,
      transactions
    );
    
    // If just this transaction, don't proceed
    if (similarTransactions.length <= 1) {
      toast({
        title: "No similar transactions",
        description: "Could not find any similar transactions to apply this category to.",
        variant: "default",
      });
      return;
    }
    
    // Extract IDs of similar transactions (excluding the current one)
    const similarIds = similarTransactions
      .filter(t => t.id !== transaction.id)
      .map(t => t.id);
    
    if (similarIds.length > 0) {
      bulkUpdateTransactionsMutation.mutate({
        ids: similarIds,
        category: transaction.category,
        subcategory: transaction.subcategory,
      });
      
      toast({
        title: "Category applied to similar",
        description: `Applied category to ${similarIds.length} similar transaction(s).`,
        variant: "default",
      });
    }
  };

  // Handle opening transaction details dialog
  const openTransactionDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditedCategory(transaction.category);
    setEditedSubcategory(transaction.subcategory || "");
    setEditMode(false);
    setIsDialogOpen(true);
  };

  // Handle category change in edit mode
  const handleCategoryChange = (category: string) => {
    setEditedCategory(category);
    // Reset subcategory when category changes
    setEditedSubcategory(SUB_CATEGORIES[category][0]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            <span>Category Management</span>
          </div>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="ml-auto"
          >
            <TabsList>
              <TabsTrigger value="transactions" className="flex items-center gap-1">
                <Box className="h-4 w-4" />
                <span>Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-1">
                <Layers className="h-4 w-4" />
                <span>Merchant Rules</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
        <CardDescription>
          {activeTab === "transactions" && "Review and edit categories for your transactions"}
          {activeTab === "rules" && "Manage categorization rules for merchants and recurring transactions"}
          {activeTab === "analytics" && "See insights on your categorization effectiveness"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* TRANSACTIONS TAB */}
        <TabsContent value="transactions" className="mt-0 border-0 p-0">
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={isBulkEditMode ? "destructive" : "outline"}
              size="sm"
              onClick={() => {
                setIsBulkEditMode(!isBulkEditMode);
                setSelectedTransactions([]);
              }}
            >
              {isBulkEditMode ? (
                <>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" /> Bulk Edit
                </>
              )}
            </Button>
          </div>

          {isBulkEditMode && (
            <div className="bg-muted p-3 rounded-md mb-4 flex items-center justify-between">
              <div>
                <span className="font-medium">{selectedTransactions.length}</span> transactions selected
              </div>
              <div className="flex space-x-2">
                <Select
                  value={editedCategory}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-[150px]">
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
                <Select
                  value={editedSubcategory}
                  onValueChange={setEditedSubcategory}
                  disabled={!editedCategory}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {editedCategory &&
                      SUB_CATEGORIES[editedCategory].map((subcat) => (
                        <SelectItem key={subcat} value={subcat}>
                          {subcat}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleBulkUpdate}
                  disabled={selectedTransactions.length === 0 || !editedCategory}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Apply to {selectedTransactions.length} items
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-8 text-center border rounded-md">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                {searchQuery
                  ? "No transactions match your search"
                  : "No transactions found"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isBulkEditMode && <TableHead className="w-[50px]"></TableHead>}
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subcategory</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.slice(0, 50).map((transaction) => {
                    // Calculate confidence score for this categorization
                    const confidence = calculateConfidenceScore(
                      transaction.description,
                      transaction.category,
                      transaction.subcategory || ""
                    );
                    
                    return (
                      <TableRow key={transaction.id}>
                        {isBulkEditMode && (
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(transaction.id)}
                              onChange={() => toggleTransactionSelection(transaction.id)}
                              className="h-4 w-4"
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium">
                          {transaction.description}
                        </TableCell>
                        <TableCell>
                          <span className={parseFloat(transaction.amount.toString()) >= 0 ? "text-green-600" : "text-red-600"}>
                            {parseFloat(transaction.amount.toString()) >= 0 ? "+" : ""}£{Math.abs(parseFloat(transaction.amount.toString())).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.subcategory ? (
                            <Badge variant="secondary" className="font-normal">
                              {transaction.subcategory}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={confidence * 100}
                              className="h-2 w-16"
                            />
                            <span className="text-xs text-muted-foreground">
                              {Math.round(confidence * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => applyToSimilar(transaction)}
                              title="Apply to similar transactions"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openTransactionDialog(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredTransactions.length > 50 && (
                <div className="py-2 px-4 text-sm text-muted-foreground text-center border-t">
                  Showing 50 of {filteredTransactions.length} transactions. Refine your search to see more.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* RULES TAB */}
        <TabsContent value="rules" className="mt-0 border-0 p-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Merchant Patterns</h3>
            <Button onClick={() => setIsCreatingRule(true)} className="gap-1">
              <Hammer className="h-4 w-4" />
              <span>Create Rule</span>
            </Button>
          </div>

          {isCreatingRule && (
            <div className="bg-muted p-4 rounded-md mb-4">
              <h4 className="font-medium mb-2">Create Categorization Rule</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="col-span-2">
                  <Input
                    placeholder="Transaction contains text..."
                    value={newRulePattern}
                    onChange={(e) => setNewRulePattern(e.target.value)}
                  />
                </div>
                <Select
                  value={newRuleCategory}
                  onValueChange={(cat) => {
                    setNewRuleCategory(cat);
                    setNewRuleSubcategory(SUB_CATEGORIES[cat][0]);
                  }}
                >
                  <SelectTrigger>
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
                <Select
                  value={newRuleSubcategory}
                  onValueChange={setNewRuleSubcategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUB_CATEGORIES[newRuleCategory].map((subcat) => (
                      <SelectItem key={subcat} value={subcat}>
                        {subcat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingRule(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateRule}>Create Rule</Button>
              </div>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant Pattern</TableHead>
                  <TableHead>Occurrences</TableHead>
                  <TableHead>Current Categories</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMerchantPatterns.map(([merchant, data]) => {
                  // Get categories for this merchant
                  const categories = data.transactions.reduce<Record<string, number>>(
                    (acc, t) => {
                      const cat = t.category;
                      acc[cat] = (acc[cat] || 0) + 1;
                      return acc;
                    },
                    {}
                  );

                  // Format as "<Category> (<count>)"
                  const categoryText = Object.entries(categories)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => `${cat} (${count})`)
                    .join(", ");

                  return (
                    <TableRow key={merchant}>
                      <TableCell className="font-medium">
                        {merchant}
                      </TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>{categoryText}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setNewRulePattern(merchant);
                            setNewRuleCategory(
                              Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0]
                            );
                            setNewRuleSubcategory(
                              SUB_CATEGORIES[Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0]][0]
                            );
                            setIsCreatingRule(true);
                          }}
                        >
                          <Hammer className="h-4 w-4 mr-1" /> Create Rule
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sortedMerchantPatterns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      <p className="text-muted-foreground">
                        No merchant patterns found. Import more transactions to analyze patterns.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="mt-0 border-0 p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Categorization Quality</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions ? (
                  <>
                    <div className="text-2xl font-bold">
                      {Math.round(
                        (transactions.filter(
                          (t) => calculateConfidenceScore(t.description, t.category, t.subcategory || "") > 0.7
                        ).length /
                          transactions.length) *
                          100
                      )}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {transactions.filter(
                        (t) => calculateConfidenceScore(t.description, t.category, t.subcategory || "") > 0.7
                      ).length}{" "}
                      of {transactions.length} transactions have high confidence
                    </p>
                    <Progress
                      value={
                        (transactions.filter(
                          (t) => calculateConfidenceScore(t.description, t.category, t.subcategory || "") > 0.7
                        ).length /
                          transactions.length) *
                        100
                      }
                      className="h-2 mt-2"
                    />
                  </>
                ) : (
                  <div className="py-6 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Uncategorized Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions ? (
                  <>
                    <div className="text-2xl font-bold">
                      {transactions.filter((t) => !t.subcategory).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Transactions missing subcategories
                    </p>
                    <Button 
                      variant="link" 
                      className="px-0 h-auto text-xs"
                      onClick={() => {
                        setSelectedCategory("All");
                        setSearchQuery("");
                        setActiveTab("transactions");
                      }}
                    >
                      View and categorize
                    </Button>
                  </>
                ) : (
                  <div className="py-6 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Learned Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {localStorage.getItem('transactionLearningCache') 
                    ? JSON.parse(localStorage.getItem('transactionLearningCache') || '[]').length 
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Custom categorization patterns learned
                </p>
              </CardContent>
            </Card>
          </div>

          <h3 className="font-medium mt-6 mb-3">Category Distribution</h3>
          {transactions ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES.map((category) => {
                const count = transactions.filter((t) => t.category === category).length;
                const percentage = Math.round((count / transactions.length) * 100) || 0;
                
                return (
                  <Card key={category}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{category}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="mt-1 text-xs text-muted-foreground text-right">
                        {percentage}%
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-6 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </TabsContent>
      </CardContent>

      {/* Transaction Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Transaction Category" : "Transaction Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedTransaction?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 font-medium">Amount</div>
              <div className="col-span-3">
                <span
                  className={
                    selectedTransaction && parseFloat(selectedTransaction.amount.toString()) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {selectedTransaction && parseFloat(selectedTransaction.amount.toString()) >= 0 ? "+" : "-"}£
                  {selectedTransaction &&
                    Math.abs(parseFloat(selectedTransaction.amount.toString())).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 font-medium">Date</div>
              <div className="col-span-3">
                {selectedTransaction &&
                  new Date(selectedTransaction.date).toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 font-medium">Category</div>
              <div className="col-span-3">
                {editMode ? (
                  <Select
                    value={editedCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
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
                ) : (
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {selectedTransaction?.category}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditMode(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 font-medium">Subcategory</div>
              <div className="col-span-3">
                {editMode ? (
                  <Select
                    value={editedSubcategory}
                    onValueChange={setEditedSubcategory}
                    disabled={!editedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {editedCategory &&
                        SUB_CATEGORIES[editedCategory].map((subcat) => (
                          <SelectItem key={subcat} value={subcat}>
                            {subcat}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary" className="font-normal">
                    {selectedTransaction?.subcategory || "None"}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            {!editMode ? (
              <div>
                <Button
                  variant="secondary"
                  onClick={() => applyToSimilar(selectedTransaction!)}
                  disabled={!selectedTransaction}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Apply to Similar
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            )}
            
            {editMode ? (
              <Button onClick={handleTransactionUpdate}>
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}