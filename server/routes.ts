import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertIncomeSchema, insertExpenseSchema, insertBudgetSchema, insertSavingsGoalSchema, insertInvestmentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Need to handle authentication
  function requireAuth(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  }

  // Income routes
  app.get("/api/incomes", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const incomes = await storage.getIncomes(userId);
    res.json(incomes);
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
      
      if (existingIncome.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
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
    const userId = req.user!.id;
    const expenses = await storage.getExpenses(userId);
    res.json(expenses);
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

  const httpServer = createServer(app);

  return httpServer;
}
