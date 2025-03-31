import { 
  users, type User, type InsertUser,
  incomes, type Income, type InsertIncome,
  expenses, type Expense, type InsertExpense,
  budgets, type Budget, type InsertBudget,
  savingsGoals, type SavingsGoal, type InsertSavingsGoal,
  investments, type Investment, type InsertInvestment,
  sharedAccess, type SharedAccess, type InsertSharedAccess,
  invitations, type Invitation, type InsertInvitation,
  transactions, type Transaction, type InsertTransaction,
  authMapping, type AuthMapping, type InsertAuthMapping
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { PgStorage } from "./pg-storage";
import { testConnection } from "./db";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserWithPassword(id: number): Promise<User | undefined>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Auth Mapping methods for Supabase integration
  getAuthMappingByAuthId(authId: string): Promise<AuthMapping | undefined>;
  getAuthMappingByUserId(userId: number): Promise<AuthMapping | undefined>;
  createAuthMapping(mapping: InsertAuthMapping): Promise<AuthMapping>;
  deleteAuthMapping(id: number): Promise<boolean>;
  
  // Shared Access methods
  getSharedAccesses(userId: number): Promise<SharedAccess[]>;
  createSharedAccess(access: InsertSharedAccess): Promise<SharedAccess>;
  updateSharedAccessStatus(id: number, status: string, acceptedDate?: Date): Promise<SharedAccess | undefined>;
  deleteSharedAccess(id: number): Promise<boolean>;
  getSharedAccessById(id: number): Promise<SharedAccess | undefined>;
  getSharedAccessByOwnerAndPartner(ownerId: number, partnerId: number): Promise<SharedAccess | undefined>;
  
  // Invitation methods
  getInvitations(userId: number): Promise<Invitation[]>;
  getInvitationByToken(token: string): Promise<Invitation | undefined>;
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  deleteInvitation(id: number): Promise<boolean>;
  useInvitation(id: number): Promise<Invitation | undefined>;
  
  // Income methods
  getIncomes(userId: number): Promise<Income[]>;
  getIncomeById(id: number): Promise<Income | undefined>;
  createIncome(income: InsertIncome): Promise<Income>;
  updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined>;
  deleteIncome(id: number): Promise<boolean>;
  
  // Expense methods
  getExpenses(userId: number): Promise<Expense[]>;
  getExpenseById(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Budget methods
  getBudgets(userId: number, month: number, year: number): Promise<Budget[]>;
  getBudgetById(id: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
  
  // Savings goals methods
  getSavingsGoals(userId: number): Promise<SavingsGoal[]>;
  getSavingsGoalById(id: number): Promise<SavingsGoal | undefined>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: number, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined>;
  deleteSavingsGoal(id: number): Promise<boolean>;
  
  // Investment methods
  getInvestments(userId: number): Promise<Investment[]>;
  getInvestmentById(id: number): Promise<Investment | undefined>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: number, investment: Partial<InsertInvestment>): Promise<Investment | undefined>;
  deleteInvestment(id: number): Promise<boolean>;
  
  // Transaction methods
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createManyTransactions(transactions: InsertTransaction[]): Promise<Transaction[]>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Transaction[]>;
  getTransactionsByCategory(userId: number, category: string): Promise<Transaction[]>;
  getTransactionsByBudgetMonth(userId: number, month: number, year: number): Promise<Transaction[]>;
  getTransactionByImportHash(importHash: string): Promise<Transaction | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sharedAccesses: Map<number, SharedAccess>;
  private invitations: Map<number, Invitation>;
  private incomes: Map<number, Income>;
  private expenses: Map<number, Expense>;
  private budgets: Map<number, Budget>;
  private savingsGoals: Map<number, SavingsGoal>;
  private investments: Map<number, Investment>;
  private transactions: Map<number, Transaction>;
  
  sessionStore: session.Store;
  
  private currentUserId: number;
  private currentSharedAccessId: number;
  private currentInvitationId: number;
  private currentIncomeId: number;
  private currentExpenseId: number;
  private currentBudgetId: number;
  private currentSavingsGoalId: number;
  private currentInvestmentId: number;
  private currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.sharedAccesses = new Map();
    this.invitations = new Map();
    this.incomes = new Map();
    this.expenses = new Map();
    this.budgets = new Map();
    this.savingsGoals = new Map();
    this.investments = new Map();
    this.transactions = new Map();
    
    this.currentUserId = 1;
    this.currentSharedAccessId = 1;
    this.currentInvitationId = 1;
    this.currentIncomeId = 1;
    this.currentExpenseId = 1;
    this.currentBudgetId = 1;
    this.currentSavingsGoalId = 1;
    this.currentInvestmentId = 1;
    this.currentTransactionId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    
    // Validate username is not empty
    if (!insertUser.username || insertUser.username.trim() === '') {
      throw new Error('Username cannot be empty');
    }
    
    // Validate password is not empty
    if (!insertUser.password || insertUser.password.trim() === '') {
      throw new Error('Password cannot be empty');
    }
    
    // Validate email format if provided
    if (insertUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(insertUser.email)) {
        throw new Error('Invalid email format');
      }
    }
    
    // Check for duplicate username
    const existingUserWithUsername = await this.getUserByUsername(insertUser.username);
    if (existingUserWithUsername) {
      throw new Error('Username already exists');
    }
    
    // Check for duplicate email if provided
    if (insertUser.email) {
      const existingUserWithEmail = await this.getUserByEmail(insertUser.email);
      if (existingUserWithEmail) {
        throw new Error('Email already exists');
      }
    }
    
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getUserWithPassword(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Auth Mapping methods for Supabase integration
  async getAuthMappingByAuthId(authId: string): Promise<AuthMapping | undefined> {
    // Implementation needed
    throw new Error('Method not implemented');
  }
  
  async getAuthMappingByUserId(userId: number): Promise<AuthMapping | undefined> {
    // Implementation needed
    throw new Error('Method not implemented');
  }
  
  async createAuthMapping(mapping: InsertAuthMapping): Promise<AuthMapping> {
    // Implementation needed
    throw new Error('Method not implemented');
  }
  
  async deleteAuthMapping(id: number): Promise<boolean> {
    // Implementation needed
    throw new Error('Method not implemented');
  }
  
  // Shared Access methods
  async getSharedAccesses(userId: number): Promise<SharedAccess[]> {
    return Array.from(this.sharedAccesses.values()).filter(
      (access) => access.ownerId === userId || access.partnerId === userId
    );
  }
  
  async getSharedAccessById(id: number): Promise<SharedAccess | undefined> {
    return this.sharedAccesses.get(id);
  }
  
  async getSharedAccessByOwnerAndPartner(ownerId: number, partnerId: number): Promise<SharedAccess | undefined> {
    return Array.from(this.sharedAccesses.values()).find(
      (access) => access.ownerId === ownerId && access.partnerId === partnerId
    );
  }
  
  async createSharedAccess(access: InsertSharedAccess): Promise<SharedAccess> {
    const id = this.currentSharedAccessId++;
    const inviteDate = new Date();
    const status = "pending";
    const sharedAccess: SharedAccess = { ...access, id, inviteDate, status, acceptedDate: null };
    this.sharedAccesses.set(id, sharedAccess);
    return sharedAccess;
  }
  
  async updateSharedAccessStatus(id: number, status: string, acceptedDate?: Date): Promise<SharedAccess | undefined> {
    const access = this.sharedAccesses.get(id);
    if (!access) return undefined;
    
    const updatedAccess = { 
      ...access, 
      status, 
      acceptedDate: status === "accepted" ? acceptedDate || new Date() : access.acceptedDate 
    };
    this.sharedAccesses.set(id, updatedAccess);
    return updatedAccess;
  }
  
  async deleteSharedAccess(id: number): Promise<boolean> {
    return this.sharedAccesses.delete(id);
  }
  
  // Invitation methods
  async getInvitations(userId: number): Promise<Invitation[]> {
    return Array.from(this.invitations.values()).filter(
      (invitation) => invitation.userId === userId
    );
  }
  
  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    return Array.from(this.invitations.values()).find(
      (invitation) => invitation.token === token
    );
  }
  
  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const id = this.currentInvitationId++;
    const createdAt = new Date();
    const newInvitation: Invitation = { ...invitation, id, createdAt, usedAt: null };
    this.invitations.set(id, newInvitation);
    return newInvitation;
  }
  
  async useInvitation(id: number): Promise<Invitation | undefined> {
    const invitation = this.invitations.get(id);
    if (!invitation) return undefined;
    
    const usedAt = new Date();
    const updatedInvitation = { ...invitation, usedAt };
    this.invitations.set(id, updatedInvitation);
    return updatedInvitation;
  }
  
  async deleteInvitation(id: number): Promise<boolean> {
    return this.invitations.delete(id);
  }
  
  // Income methods
  async getIncomes(userId: number): Promise<Income[]> {
    return Array.from(this.incomes.values()).filter(
      (income) => income.userId === userId
    );
  }
  
  async getIncomeById(id: number): Promise<Income | undefined> {
    return this.incomes.get(id);
  }
  
  async createIncome(insertIncome: InsertIncome): Promise<Income> {
    const id = this.currentIncomeId++;
    const income: Income = { ...insertIncome, id };
    this.incomes.set(id, income);
    return income;
  }
  
  async updateIncome(id: number, incomeUpdate: Partial<InsertIncome>): Promise<Income | undefined> {
    const income = this.incomes.get(id);
    if (!income) return undefined;
    
    const updatedIncome = { ...income, ...incomeUpdate };
    this.incomes.set(id, updatedIncome);
    return updatedIncome;
  }
  
  async deleteIncome(id: number): Promise<boolean> {
    return this.incomes.delete(id);
  }
  
  // Expense methods
  async getExpenses(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.userId === userId
    );
  }
  
  async getExpenseById(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }
  
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const expense: Expense = { ...insertExpense, id };
    this.expenses.set(id, expense);
    return expense;
  }
  
  async updateExpense(id: number, expenseUpdate: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const updatedExpense = { ...expense, ...expenseUpdate };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }
  
  // Budget methods
  async getBudgets(userId: number, month: number, year: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId && budget.month === month && budget.year === year
    );
  }
  
  async getBudgetById(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }
  
  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.currentBudgetId++;
    const budget: Budget = { ...insertBudget, id };
    this.budgets.set(id, budget);
    return budget;
  }
  
  async updateBudget(id: number, budgetUpdate: Partial<InsertBudget>): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (!budget) return undefined;
    
    const updatedBudget = { ...budget, ...budgetUpdate };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }
  
  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }
  
  // Savings goals methods
  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values()).filter(
      (goal) => goal.userId === userId
    );
  }
  
  async getSavingsGoalById(id: number): Promise<SavingsGoal | undefined> {
    return this.savingsGoals.get(id);
  }
  
  async createSavingsGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.currentSavingsGoalId++;
    const goal: SavingsGoal = { ...insertGoal, id };
    this.savingsGoals.set(id, goal);
    return goal;
  }
  
  async updateSavingsGoal(id: number, goalUpdate: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined> {
    const goal = this.savingsGoals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...goalUpdate };
    this.savingsGoals.set(id, updatedGoal);
    return updatedGoal;
  }
  
  async deleteSavingsGoal(id: number): Promise<boolean> {
    return this.savingsGoals.delete(id);
  }
  
  // Investment methods
  async getInvestments(userId: number): Promise<Investment[]> {
    return Array.from(this.investments.values()).filter(
      (investment) => investment.userId === userId
    );
  }
  
  async getInvestmentById(id: number): Promise<Investment | undefined> {
    return this.investments.get(id);
  }
  
  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const id = this.currentInvestmentId++;
    const investment: Investment = { ...insertInvestment, id };
    this.investments.set(id, investment);
    return investment;
  }
  
  async updateInvestment(id: number, investmentUpdate: Partial<InsertInvestment>): Promise<Investment | undefined> {
    const investment = this.investments.get(id);
    if (!investment) return undefined;
    
    const updatedInvestment = { ...investment, ...investmentUpdate };
    this.investments.set(id, updatedInvestment);
    return updatedInvestment;
  }
  
  async deleteInvestment(id: number): Promise<boolean> {
    return this.investments.delete(id);
  }
  
  // Transaction methods
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }
  
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const createdAt = new Date();
    
    // Validate user exists
    const user = await this.getUser(insertTransaction.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Validate date format
    if (insertTransaction.date && !this.isValidDateFormat(insertTransaction.date)) {
      throw new Error('Invalid date format');
    }
    
    // Validate required fields
    if (!insertTransaction.description || insertTransaction.description.trim() === '') {
      throw new Error('Description is required');
    }
    
    if (!insertTransaction.category || insertTransaction.category.trim() === '') {
      throw new Error('Category is required');
    }
    
    // Validate amount
    if (isNaN(Number(insertTransaction.amount))) {
      throw new Error('Invalid amount');
    }
    
    // Validate transaction type
    if (insertTransaction.type !== 'income' && insertTransaction.type !== 'expense') {
      throw new Error('Invalid transaction type');
    }
    
    // Validate recurring transaction data
    if (insertTransaction.isRecurring) {
      // Validate frequency if provided
      if (insertTransaction.frequency) {
        const validFrequencies = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'];
        if (!validFrequencies.includes(insertTransaction.frequency)) {
          throw new Error('Invalid frequency');
        }
      }
      
      // Validate next due date if provided
      if (insertTransaction.nextDueDate && !this.isValidDateFormat(insertTransaction.nextDueDate)) {
        throw new Error('Invalid next due date');
      }
    }
    
    const transaction: Transaction = { ...insertTransaction, id, createdAt };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  // Helper method to validate date format (YYYY-MM-DD)
  private isValidDateFormat(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    // Check if it's a valid date
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
  
  async createManyTransactions(insertTransactions: InsertTransaction[]): Promise<Transaction[]> {
    const createdTransactions: Transaction[] = [];
    
    for (const insertTransaction of insertTransactions) {
      const transaction = await this.createTransaction(insertTransaction);
      createdTransactions.push(transaction);
    }
    
    return createdTransactions;
  }
  
  async updateTransaction(id: number, transactionUpdate: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, ...transactionUpdate };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }
  
  async getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return Array.from(this.transactions.values()).filter(
      (transaction) => 
        transaction.userId === userId && 
        transaction.date >= startDateStr && 
        transaction.date <= endDateStr
    );
  }
  
  async getTransactionsByCategory(userId: number, category: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId && transaction.category === category
    );
  }
  
  async getTransactionsByBudgetMonth(userId: number, month: number, year: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => 
        transaction.userId === userId && 
        transaction.budgetMonth === month && 
        transaction.budgetYear === year
    );
  }
  
  async getTransactionByImportHash(importHash: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (transaction) => transaction.importHash === importHash
    );
  }
}

// Choose the storage implementation based on database connection
let storageImplementation: IStorage;

// This will be initialized asynchronously
(async () => {
  try {
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log("Using PostgreSQL storage implementation");
      storageImplementation = new PgStorage();
    } else {
      console.log("Database connection failed, using in-memory storage");
      storageImplementation = new MemStorage();
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
    console.log("Falling back to in-memory storage");
    storageImplementation = new MemStorage();
  }
})();

// Export a proxy that forwards calls to the actual implementation
// This ensures that even if the async initialization isn't complete,
// the calls will be queued until the implementation is ready
export const storage = new Proxy({} as IStorage, {
  get: (target, prop) => {
    return (...args: any[]) => {
      if (!storageImplementation) {
        // If storage implementation isn't initialized yet, use MemStorage as fallback
        console.log("Storage not yet initialized, using in-memory storage temporarily");
        storageImplementation = new MemStorage();
      }
      return (storageImplementation as any)[prop](...args);
    };
  }
});
