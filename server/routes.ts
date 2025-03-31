import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, comparePasswords, hashPassword } from "./auth";
import { z } from "zod";
import { 
  insertIncomeSchema, 
  insertExpenseSchema, 
  insertBudgetSchema, 
  insertSavingsGoalSchema, 
  insertInvestmentSchema,
  insertSharedAccessSchema,
  insertInvitationSchema,
  insertTransactionSchema,
  insertUserSchema
} from "@shared/schema";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Authentication and authorization middleware
  function requireAuth(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  }
  
  // Helper function to check if user has access to a specific user's data
  async function hasAccessToUserData(requestingUserId: number, targetUserId: number): Promise<{hasAccess: boolean, accessLevel?: string}> {
    // If it's the user's own data, they have full access
    if (requestingUserId === targetUserId) {
      return { hasAccess: true, accessLevel: "edit" };
    }
    
    // Check if there's a shared access between the two users
    const sharedAccess = await storage.getSharedAccessByOwnerAndPartner(targetUserId, requestingUserId);
    
    if (sharedAccess && sharedAccess.status === "accepted") {
      return { hasAccess: true, accessLevel: sharedAccess.accessLevel };
    }
    
    return { hasAccess: false };
  }

  // Income routes
  app.get("/api/incomes", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const targetUserId = parseInt(req.query.userId as string) || userId;
      
      // If requesting someone else's data, check shared access
      if (targetUserId !== userId) {
        const access = await hasAccessToUserData(userId, targetUserId);
        if (!access.hasAccess) {
          return res.status(403).json({ message: "Not authorized to view this user's data" });
        }
      }
      
      const incomes = await storage.getIncomes(targetUserId);
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/incomes", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const incomeData = { ...req.body, userId };
      const validatedData = insertIncomeSchema.parse(incomeData);
      const income = await storage.createIncome(validatedData);
      res.status(201).json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.put("/api/incomes/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const incomeId = parseInt(req.params.id, 10);
      
      const existingIncome = await storage.getIncomeById(incomeId);
      if (!existingIncome) {
        return res.status(404).json({ message: "Income not found" });
      }
      
      // If user owns the income, they can update it
      if (existingIncome.userId === userId) {
        const updatedIncome = await storage.updateIncome(incomeId, req.body);
        return res.json(updatedIncome);
      }
      
      // Check if user has edit access to this income via shared access
      const access = await hasAccessToUserData(userId, existingIncome.userId);
      if (!access.hasAccess) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      if (access.accessLevel !== "edit") {
        return res.status(403).json({ message: "You only have view access to this data" });
      }
      
      const updatedIncome = await storage.updateIncome(incomeId, req.body);
      res.json(updatedIncome);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/incomes/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const incomeId = parseInt(req.params.id, 10);
      
      const existingIncome = await storage.getIncomeById(incomeId);
      if (!existingIncome) {
        return res.status(404).json({ message: "Income not found" });
      }
      
      if (existingIncome.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteIncome(incomeId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Expense routes
  app.get("/api/expenses", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const targetUserId = parseInt(req.query.userId as string) || userId;
      
      // If requesting someone else's data, check shared access
      if (targetUserId !== userId) {
        const access = await hasAccessToUserData(userId, targetUserId);
        if (!access.hasAccess) {
          return res.status(403).json({ message: "Not authorized to view this user's data" });
        }
      }
      
      const expenses = await storage.getExpenses(targetUserId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/expenses", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const expenseData = { ...req.body, userId };
      const validatedData = insertExpenseSchema.parse(expenseData);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.put("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const expenseId = parseInt(req.params.id, 10);
      
      const existingExpense = await storage.getExpenseById(expenseId);
      if (!existingExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      if (existingExpense.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedExpense = await storage.updateExpense(expenseId, req.body);
      res.json(updatedExpense);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/expenses/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const expenseId = parseInt(req.params.id, 10);
      
      const existingExpense = await storage.getExpenseById(expenseId);
      if (!existingExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      if (existingExpense.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteExpense(expenseId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Budget routes
  app.get("/api/budgets", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const month = parseInt(req.query.month as string, 10) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
      
      const budgets = await storage.getBudgets(userId, month, year);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/budgets", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const budgetData = { ...req.body, userId };
      const validatedData = insertBudgetSchema.parse(budgetData);
      const budget = await storage.createBudget(validatedData);
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.put("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const budgetId = parseInt(req.params.id, 10);
      
      const existingBudget = await storage.getBudgetById(budgetId);
      if (!existingBudget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      if (existingBudget.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedBudget = await storage.updateBudget(budgetId, req.body);
      res.json(updatedBudget);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const budgetId = parseInt(req.params.id, 10);
      
      const existingBudget = await storage.getBudgetById(budgetId);
      if (!existingBudget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      if (existingBudget.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteBudget(budgetId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Savings Goals routes
  app.get("/api/savings-goals", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const goals = await storage.getSavingsGoals(userId);
    res.json(goals);
  });

  app.post("/api/savings-goals", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const goalData = { ...req.body, userId };
      const validatedData = insertSavingsGoalSchema.parse(goalData);
      const goal = await storage.createSavingsGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.put("/api/savings-goals/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const goalId = parseInt(req.params.id, 10);
      
      const existingGoal = await storage.getSavingsGoalById(goalId);
      if (!existingGoal) {
        return res.status(404).json({ message: "Savings goal not found" });
      }
      
      if (existingGoal.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedGoal = await storage.updateSavingsGoal(goalId, req.body);
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/savings-goals/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const goalId = parseInt(req.params.id, 10);
      
      const existingGoal = await storage.getSavingsGoalById(goalId);
      if (!existingGoal) {
        return res.status(404).json({ message: "Savings goal not found" });
      }
      
      if (existingGoal.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteSavingsGoal(goalId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Investments routes
  app.get("/api/investments", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const investments = await storage.getInvestments(userId);
    res.json(investments);
  });

  app.post("/api/investments", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const investmentData = { ...req.body, userId };
      const validatedData = insertInvestmentSchema.parse(investmentData);
      const investment = await storage.createInvestment(validatedData);
      res.status(201).json(investment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.put("/api/investments/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const investmentId = parseInt(req.params.id, 10);
      
      const existingInvestment = await storage.getInvestmentById(investmentId);
      if (!existingInvestment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      if (existingInvestment.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedInvestment = await storage.updateInvestment(investmentId, req.body);
      res.json(updatedInvestment);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/investments/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const investmentId = parseInt(req.params.id, 10);
      
      const existingInvestment = await storage.getInvestmentById(investmentId);
      if (!existingInvestment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      if (existingInvestment.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteInvestment(investmentId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Shared Access routes
  app.get("/api/shared-access", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const sharedAccesses = await storage.getSharedAccesses(userId);
      res.json(sharedAccesses);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/shared-access", requireAuth, async (req, res) => {
    try {
      const ownerId = req.user!.id;
      
      // Check if partner exists
      const partnerEmail = req.body.partnerEmail;
      const partner = await storage.getUserByEmail(partnerEmail);
      if (!partner) {
        return res.status(404).json({ message: "User with this email not found" });
      }
      
      // Check if there's already a shared access between these users
      const existingAccess = await storage.getSharedAccessByOwnerAndPartner(ownerId, partner.id);
      if (existingAccess) {
        return res.status(400).json({ message: "Shared access already exists with this user" });
      }
      
      // Create shared access
      const accessData = {
        ownerId,
        partnerId: partner.id,
        accessLevel: req.body.accessLevel || "view" // Default to view-only if not specified
      };
      
      const validatedData = insertSharedAccessSchema.parse(accessData);
      const sharedAccess = await storage.createSharedAccess(validatedData);
      
      res.status(201).json(sharedAccess);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.put("/api/shared-access/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const accessId = parseInt(req.params.id, 10);
      
      const existingAccess = await storage.getSharedAccessById(accessId);
      if (!existingAccess) {
        return res.status(404).json({ message: "Shared access not found" });
      }
      
      // Only partner can accept/reject, only owner can modify access level
      if (req.body.status && existingAccess.partnerId !== userId) {
        return res.status(403).json({ message: "Not authorized to change status" });
      }
      
      if (req.body.accessLevel && existingAccess.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to change access level" });
      }
      
      // Update status if provided
      let updatedAccess;
      if (req.body.status) {
        updatedAccess = await storage.updateSharedAccessStatus(
          accessId,
          req.body.status,
          req.body.status === "accepted" ? new Date() : undefined
        );
      } else {
        // Update other fields (accessLevel)
        updatedAccess = await storage.updateSharedAccessStatus(
          accessId,
          existingAccess.status
        );
      }
      
      res.json(updatedAccess);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/shared-access/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const accessId = parseInt(req.params.id, 10);
      
      const existingAccess = await storage.getSharedAccessById(accessId);
      if (!existingAccess) {
        return res.status(404).json({ message: "Shared access not found" });
      }
      
      // Either owner or partner can remove access
      if (existingAccess.ownerId !== userId && existingAccess.partnerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteSharedAccess(accessId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Invitation routes
  app.get("/api/invitations", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const invitations = await storage.getInvitations(userId);
      res.json(invitations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/invitations", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Generate a unique token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set expiration date (default: 7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const invitationData = {
        ...req.body,
        userId,
        token,
        expiresAt
      };
      
      const validatedData = insertInvitationSchema.parse(invitationData);
      const invitation = await storage.createInvitation(validatedData);
      
      res.status(201).json(invitation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.get("/api/invitations/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const invitation = await storage.getInvitationByToken(token);
      
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      
      // Check if expired
      if (invitation.expiresAt < new Date()) {
        return res.status(410).json({ message: "Invitation has expired" });
      }
      
      // Check if already used
      if (invitation.usedAt) {
        return res.status(410).json({ message: "Invitation has already been used" });
      }
      
      res.json(invitation);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/invitations/:token/accept", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const token = req.params.token;
      
      const invitation = await storage.getInvitationByToken(token);
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      
      // Check if expired
      if (invitation.expiresAt < new Date()) {
        return res.status(410).json({ message: "Invitation has expired" });
      }
      
      // Check if already used
      if (invitation.usedAt) {
        return res.status(410).json({ message: "Invitation has already been used" });
      }
      
      // Create shared access
      const accessData = {
        ownerId: invitation.userId,
        partnerId: userId,
        accessLevel: invitation.accessLevel
      };
      
      const sharedAccess = await storage.createSharedAccess(accessData);
      
      // Mark invitation as used
      await storage.useInvitation(invitation.id);
      
      res.status(201).json(sharedAccess);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/invitations/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const invitationId = parseInt(req.params.id, 10);
      
      const invitations = await storage.getInvitations(userId);
      const invitation = invitations.find(inv => inv.id === invitationId);
      
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      
      await storage.deleteInvitation(invitationId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const targetUserId = parseInt(req.query.userId as string) || userId;
      
      // If requesting someone else's data, check shared access
      if (targetUserId !== userId) {
        const access = await hasAccessToUserData(userId, targetUserId);
        if (!access.hasAccess) {
          return res.status(403).json({ error: "Not authorized to view this user's data" });
        }
      }
      
      // Handle optional date range parameters
      if (req.query.startDate && req.query.endDate) {
        try {
          const startDate = new Date(req.query.startDate as string);
          const endDate = new Date(req.query.endDate as string);
          
          // Validate date format
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ error: "Invalid date format" });
          }
          
          const transactions = await storage.getTransactionsByDateRange(targetUserId, startDate, endDate);
          return res.json(transactions);
        } catch (dateError) {
          return res.status(400).json({ error: "Invalid date format" });
        }
      }
      
      // Handle budget month filter
      if (req.query.month && req.query.year) {
        try {
          const month = parseInt(req.query.month as string, 10);
          const year = parseInt(req.query.year as string, 10);
          
          // Validate month and year
          if (isNaN(month) || month < 1 || month > 12 || isNaN(year)) {
            return res.status(400).json({ error: "Invalid budget month" });
          }
          
          const transactions = await storage.getTransactionsByBudgetMonth(targetUserId, month, year);
          return res.json(transactions);
        } catch (monthError) {
          return res.status(400).json({ error: "Invalid budget month" });
        }
      }
      
      // Handle category filter
      if (req.query.category) {
        const category = req.query.category as string;
        const transactions = await storage.getTransactionsByCategory(targetUserId, category);
        return res.json(transactions);
      }
      
      // Default: get all transactions
      const transactions = await storage.getTransactions(targetUserId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Server error while fetching transactions" });
    }
  });

  app.get("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactionId = parseInt(req.params.id, 10);
      
      if (isNaN(transactionId)) {
        return res.status(400).json({ error: "Invalid transaction ID" });
      }
      
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      // Check authorization
      if (transaction.userId !== userId) {
        const access = await hasAccessToUserData(userId, transaction.userId);
        if (!access.hasAccess) {
          return res.status(403).json({ error: "Not authorized to access this transaction" });
        }
      }
      
      // Sanitize the response by removing sensitive fields
      const sanitizedTransaction = { ...transaction };
      delete sanitizedTransaction.userId; // Remove userId field
      
      res.json(sanitizedTransaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ error: "Server error while fetching transaction" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactionData = { ...req.body, userId };
      
      // Manual validation before passing to Zod
      if (!transactionData.description) {
        return res.status(400).json({ error: "description is required" });
      }
      
      if (!transactionData.category) {
        return res.status(400).json({ error: "category is required" });
      }
      
      if (!transactionData.date || isNaN(new Date(transactionData.date).getTime())) {
        return res.status(400).json({ error: "invalid date format" });
      }
      
      if (!transactionData.amount || isNaN(Number(transactionData.amount))) {
        return res.status(400).json({ error: "invalid amount" });
      }
      
      if (!transactionData.type || (transactionData.type !== 'income' && transactionData.type !== 'expense')) {
        return res.status(400).json({ error: "invalid transaction type" });
      }
      
      // Now try Zod validation
      try {
        const validatedData = insertTransactionSchema.parse(transactionData);
        
        // Check for duplicates by import hash if provided
        if (validatedData.importHash) {
          const existingTransaction = await storage.getTransactionByImportHash(validatedData.importHash);
          if (existingTransaction) {
            return res.status(409).json({ 
              error: "Transaction with this import hash already exists",
              existingTransaction
            });
          }
        }
        
        const transaction = await storage.createTransaction(validatedData);
        res.status(201).json(transaction);
      } catch (zodError) {
        if (zodError instanceof z.ZodError) {
          return res.status(400).json({ error: zodError.errors[0].message });
        }
        throw zodError; // re-throw other errors to be caught by the outer catch
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Error creating transaction" });
    }
  });

  app.post("/api/transactions/batch", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Validate all transactions in the batch
      const transactionDataArray = req.body.transactions || [];
      if (!Array.isArray(transactionDataArray)) {
        return res.status(400).json({ error: "Expected transactions array" });
      }
      
      // Add userId to each transaction and validate
      const validatedTransactions = [];
      const skippedTransactions = [];
      
      for (const transaction of transactionDataArray) {
        try {
          // Basic validation
          if (!transaction.description) {
            skippedTransactions.push({
              transaction,
              reason: "Validation error",
              error: "description is required"
            });
            continue;
          }
          
          if (!transaction.category) {
            skippedTransactions.push({
              transaction,
              reason: "Validation error",
              error: "category is required"
            });
            continue;
          }
          
          if (!transaction.date || isNaN(new Date(transaction.date).getTime())) {
            skippedTransactions.push({
              transaction,
              reason: "Validation error",
              error: "invalid date format"
            });
            continue;
          }
          
          if (!transaction.amount || isNaN(Number(transaction.amount))) {
            skippedTransactions.push({
              transaction,
              reason: "Validation error",
              error: "invalid amount"
            });
            continue;
          }
          
          if (!transaction.type || (transaction.type !== 'income' && transaction.type !== 'expense')) {
            skippedTransactions.push({
              transaction,
              reason: "Validation error",
              error: "invalid transaction type"
            });
            continue;
          }
          
          const transactionWithUserId = { ...transaction, userId };
          const validatedData = insertTransactionSchema.parse(transactionWithUserId);
          
          // Check for duplicates by import hash if provided
          if (validatedData.importHash) {
            const existingTransaction = await storage.getTransactionByImportHash(validatedData.importHash);
            if (existingTransaction) {
              skippedTransactions.push({
                transaction: validatedData,
                reason: "Duplicate import hash",
                existingTransaction
              });
              continue;
            }
          }
          
          validatedTransactions.push(validatedData);
        } catch (error) {
          if (error instanceof z.ZodError) {
            skippedTransactions.push({
              transaction,
              reason: "Validation error",
              errors: error.errors
            });
          } else {
            skippedTransactions.push({
              transaction,
              reason: "Unknown error"
            });
          }
        }
      }
      
      // If no valid transactions, return error
      if (validatedTransactions.length === 0) {
        return res.status(400).json({ 
          error: "No valid transactions to process",
          skipped: skippedTransactions
        });
      }
      
      // Create all valid transactions
      const createdTransactions = await storage.createManyTransactions(validatedTransactions);
      
      res.status(201).json({
        created: createdTransactions,
        skipped: skippedTransactions,
        stats: {
          total: transactionDataArray.length,
          created: createdTransactions.length,
          skipped: skippedTransactions.length
        }
      });
    } catch (error) {
      console.error("Error creating batch transactions:", error);
      res.status(500).json({ error: "Error creating batch transactions" });
    }
  });

  // CSV validation endpoint
  app.post("/api/transactions/validate/csv", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Validate the CSV data format
      const transactionDataArray = req.body.transactions || [];
      if (!Array.isArray(transactionDataArray)) {
        return res.status(400).json({ error: "Expected transactions array" });
      }
      
      // Validate each transaction in the CSV data
      const validationErrors = [];
      
      for (const transaction of transactionDataArray) {
        if (!transaction.date) {
          validationErrors.push("Date is required");
        } else if (isNaN(new Date(transaction.date).getTime())) {
          validationErrors.push("Invalid date format");
        }
        
        if (!transaction.description) {
          validationErrors.push("Description is required");
        }
        
        if (!transaction.amount) {
          validationErrors.push("Amount is required");
        } else if (isNaN(Number(transaction.amount))) {
          validationErrors.push("Invalid amount format");
        }
      }
      
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: `Invalid CSV data: ${validationErrors[0]}`,
          validationErrors
        });
      }
      
      // If no validation errors, return success
      res.status(200).json({ message: "CSV data is valid" });
    } catch (error) {
      console.error("Error validating CSV data:", error);
      res.status(500).json({ error: "Error validating CSV data" });
    }
  });
  
  // CSV import endpoint
  app.post("/api/transactions/import/csv", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Validate the CSV data format
      const transactionDataArray = req.body.transactions || [];
      if (!Array.isArray(transactionDataArray)) {
        return res.status(400).json({ error: "Expected transactions array" });
      }
      
      // Process each transaction in the CSV data
      const validTransactions = [];
      const skippedTransactions = [];
      
      for (const transaction of transactionDataArray) {
        try {
          // Basic validation
          if (!transaction.date || isNaN(new Date(transaction.date).getTime())) {
            skippedTransactions.push(transaction);
            continue;
          }
          
          if (!transaction.description) {
            skippedTransactions.push(transaction);
            continue;
          }
          
          if (!transaction.amount || isNaN(Number(transaction.amount))) {
            skippedTransactions.push(transaction);
            continue;
          }
          
          // Check for duplicates by import hash if provided
          if (transaction.importHash) {
            const existingTransaction = await storage.getTransactionByImportHash(transaction.importHash);
            if (existingTransaction) {
              skippedTransactions.push(transaction);
              continue;
            }
          }
          
          // Prepare transaction for insertion
          const transactionWithUserId = { 
            ...transaction, 
            userId,
            type: parseFloat(transaction.amount) >= 0 ? 'income' : 'expense'
          };
          
          validTransactions.push(transactionWithUserId);
        } catch (error) {
          skippedTransactions.push(transaction);
        }
      }
      
      // If no valid transactions, return with stats
      if (validTransactions.length === 0) {
        return res.status(200).json({ 
          message: "No valid transactions to import",
          imported: 0,
          skipped: skippedTransactions.length
        });
      }
      
      // Import valid transactions
      const importedTransactions = await storage.createManyTransactions(validTransactions);
      
      res.status(200).json({
        imported: importedTransactions.length,
        skipped: skippedTransactions.length,
        transactions: importedTransactions
      });
    } catch (error) {
      console.error("Error importing CSV data:", error);
      res.status(500).json({ error: "Error importing CSV data" });
    }
  });

  // Endpoint for bulk updating transactions (particularly for categorization)
  app.patch("/api/transactions/bulk", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { ids, category, subcategory } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Transaction IDs array is required" });
      }
      
      if (!category) {
        return res.status(400).json({ message: "Category is required for bulk update" });
      }
      
      // Validate each transaction ID and update if authorized
      const results = {
        successful: [],
        failed: [],
        unauthorized: []
      };
      
      for (const id of ids) {
        try {
          const transactionId = parseInt(id.toString(), 10);
          if (isNaN(transactionId)) {
            results.failed.push({ id, reason: "Invalid ID format" });
            continue;
          }
          
          const existingTransaction = await storage.getTransactionById(transactionId);
          if (!existingTransaction) {
            results.failed.push({ id, reason: "Transaction not found" });
            continue;
          }
          
          // Check if user owns the transaction or has edit access
          let hasEditAccess = false;
          
          if (existingTransaction.userId === userId) {
            hasEditAccess = true;
          } else {
            // Check if user has edit access to this transaction via shared access
            const access = await hasAccessToUserData(userId, existingTransaction.userId);
            if (access.hasAccess && access.accessLevel === "edit") {
              hasEditAccess = true;
            }
          }
          
          if (!hasEditAccess) {
            results.unauthorized.push({ id });
            continue;
          }
          
          // Update the transaction with new category/subcategory
          const updateData = { 
            category,
            subcategory: subcategory === null ? null : subcategory
          };
          
          const updatedTransaction = await storage.updateTransaction(transactionId, updateData);
          results.successful.push(updatedTransaction);
        } catch (error) {
          console.error(`Error updating transaction ${id}:`, error);
          results.failed.push({ id, reason: "Server error" });
        }
      }
      
      // Return results summary
      res.json({
        message: `Updated ${results.successful.length} of ${ids.length} transactions`,
        results
      });
    } catch (error) {
      console.error("Error in bulk update transactions:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactionId = parseInt(req.params.id, 10);
      
      if (isNaN(transactionId)) {
        return res.status(400).json({ error: "Invalid transaction ID" });
      }
      
      const existingTransaction = await storage.getTransactionById(transactionId);
      if (!existingTransaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      // Check if user owns the transaction
      if (existingTransaction.userId !== userId) {
        // Check if user has edit access to this transaction via shared access
        const access = await hasAccessToUserData(userId, existingTransaction.userId);
        if (!access.hasAccess) {
          return res.status(403).json({ error: "Not authorized" });
        }
        
        if (access.accessLevel !== "edit") {
          return res.status(403).json({ error: "You only have view access to this data" });
        }
      }

      // Validate update data
      const updateData = req.body;
      
      // Check date format if provided
      if (updateData.date && isNaN(new Date(updateData.date).getTime())) {
        return res.status(400).json({ error: "invalid date format" });
      }
      
      // Check amount format if provided
      if (updateData.amount !== undefined && isNaN(Number(updateData.amount))) {
        return res.status(400).json({ error: "invalid amount" });
      }
      
      // Check transaction type if provided
      if (updateData.type && (updateData.type !== 'income' && updateData.type !== 'expense')) {
        return res.status(400).json({ error: "invalid transaction type" });
      }

      const updatedTransaction = await storage.updateTransaction(transactionId, updateData);
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ error: "Error updating transaction" });
    }
  });

  app.patch("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactionId = parseInt(req.params.id, 10);
      
      if (isNaN(transactionId)) {
        return res.status(400).json({ error: "Invalid transaction ID" });
      }
      
      const existingTransaction = await storage.getTransactionById(transactionId);
      if (!existingTransaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      // Check if user owns the transaction
      if (existingTransaction.userId !== userId) {
        // Check if user has edit access to this transaction via shared access
        const access = await hasAccessToUserData(userId, existingTransaction.userId);
        if (!access.hasAccess) {
          return res.status(403).json({ error: "Not authorized" });
        }
        
        if (access.accessLevel !== "edit") {
          return res.status(403).json({ error: "You only have view access to this data" });
        }
      }

      // Validate update data
      const updateData = req.body;
      
      // Check date format if provided
      if (updateData.date && isNaN(new Date(updateData.date).getTime())) {
        return res.status(400).json({ error: "invalid date format" });
      }
      
      // Check amount format if provided
      if (updateData.amount !== undefined && isNaN(Number(updateData.amount))) {
        return res.status(400).json({ error: "invalid amount" });
      }
      
      // Check transaction type if provided
      if (updateData.type && (updateData.type !== 'income' && updateData.type !== 'expense')) {
        return res.status(400).json({ error: "invalid transaction type" });
      }

      const updatedTransaction = await storage.updateTransaction(transactionId, updateData);
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ error: "Error updating transaction" });
    }
  });

  app.delete("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const transactionId = parseInt(req.params.id, 10);
      
      if (isNaN(transactionId)) {
        return res.status(400).json({ error: "Invalid transaction ID" });
      }
      
      const existingTransaction = await storage.getTransactionById(transactionId);
      if (!existingTransaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      // Only the transaction owner can delete it
      if (existingTransaction.userId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await storage.deleteTransaction(transactionId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Error deleting transaction" });
    }
  });

  // User routes (for settings page)
  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const targetUserId = parseInt(req.params.id, 10);
      
      // Users can only update their own profile
      if (userId !== targetUserId) {
        return res.status(403).json({ message: "Not authorized to update this user's profile" });
      }
      
      // Only allow updating certain fields
      const allowedUpdates = ['name', 'email'];
      const updates: Record<string, any> = {};
      
      for (const field of allowedUpdates) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const user = await storage.updateUser(userId, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // Password update route
  app.patch("/api/users/:id/password", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const targetUserId = parseInt(req.params.id, 10);
      
      // Users can only update their own password
      if (userId !== targetUserId) {
        return res.status(403).json({ message: "Not authorized to update this user's password" });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          message: "Both current password and new password are required" 
        });
      }
      
      // Get user with password
      const user = await storage.getUserWithPassword(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isMatch = await comparePasswords(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await storage.updateUser(userId, { password: hashedPassword });
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
