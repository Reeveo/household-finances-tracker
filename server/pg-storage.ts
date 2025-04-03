import { pool } from './db';
import { 
  users, type User, type InsertUser,
  incomes, type Income, type InsertIncome,
  expenses, type Expense, type InsertExpense,
  budgets, type Budget, type InsertBudget,
  savingsGoals, type SavingsGoal, type InsertSavingsGoal,
  investments, type Investment, type InsertInvestment,
  sharedAccess, type SharedAccess, type InsertSharedAccess,
  invitations, type Invitation, type InsertInvitation,
  transactions, type Transaction, type InsertTransaction
} from "@shared/schema";
import { IStorage } from './storage';
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class PgStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Use MemoryStore from memorystore for now
    // This is a temporary solution until we properly configure connect-pg-simple
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id.toString()]
    );
    return result.rows[0] || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || undefined;
  }
  
  async getUserWithPassword(id: number): Promise<User | undefined> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id.toString()]
    );
    return result.rows[0] || undefined;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    // Create set clauses and values array for query
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    // Add each update field to the query
    Object.entries(updates).forEach(([key, value]) => {
      setClauses.push(`${this.camelToSnakeCase(key)} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });
    
    // Add the user ID as the last parameter
    values.push(id.toString());
    
    // Only proceed if there are fields to update
    if (setClauses.length === 0) return undefined;
    
    const query = `
      UPDATE users 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { username, password, name, email } = user;
    const result = await pool.query(
      'INSERT INTO users (username, password, name, email, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
      [username, password, name, email]
    );
    return result.rows[0];
  }

  // Shared Access methods
  async getSharedAccesses(userId: number): Promise<SharedAccess[]> {
    const result = await pool.query(
      'SELECT * FROM shared_access WHERE owner_id = $1 OR partner_id = $1',
      [userId]
    );
    return result.rows;
  }

  async getSharedAccessById(id: number): Promise<SharedAccess | undefined> {
    const result = await pool.query(
      'SELECT * FROM shared_access WHERE id = $1',
      [id]
    );
    return result.rows[0] || undefined;
  }

  async getSharedAccessByOwnerAndPartner(ownerId: number, partnerId: number): Promise<SharedAccess | undefined> {
    const result = await pool.query(
      'SELECT * FROM shared_access WHERE owner_id = $1 AND partner_id = $2',
      [ownerId, partnerId]
    );
    return result.rows[0] || undefined;
  }

  async createSharedAccess(access: InsertSharedAccess): Promise<SharedAccess> {
    const { ownerId, partnerId, accessLevel } = access;
    const result = await pool.query(
      'INSERT INTO shared_access (owner_id, partner_id, access_level, status, invite_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [ownerId, partnerId, accessLevel || 'view', 'pending']
    );
    return result.rows[0];
  }

  async updateSharedAccessStatus(id: number, status: string, acceptedDate?: Date): Promise<SharedAccess | undefined> {
    let query = 'UPDATE shared_access SET status = $1';
    const params = [status];
    
    if (status === 'accepted' && acceptedDate) {
      query += ', accepted_date = $2';
      params.push(acceptedDate.toISOString());
    }
    
    query += ' WHERE id = $' + (params.length + 1) + ' RETURNING *';
    params.push(id.toString());
    
    const result = await pool.query(query, params);
    return result.rows[0] || undefined;
  }

  async deleteSharedAccess(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM shared_access WHERE id = $1',
      [id.toString()]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Invitation methods
  async getInvitations(userId: number): Promise<Invitation[]> {
    const result = await pool.query(
      'SELECT * FROM invitations WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  }

  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    const result = await pool.query(
      'SELECT * FROM invitations WHERE token = $1',
      [token]
    );
    return result.rows[0] || undefined;
  }

  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const { userId, email, token, accessLevel, expiresAt } = invitation;
    const result = await pool.query(
      'INSERT INTO invitations (user_id, email, token, access_level, expires_at, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [userId, email, token, accessLevel || 'view', expiresAt]
    );
    return result.rows[0];
  }

  async useInvitation(id: number): Promise<Invitation | undefined> {
    const result = await pool.query(
      'UPDATE invitations SET used_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || undefined;
  }

  async deleteInvitation(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM invitations WHERE id = $1',
      [id.toString()]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Income methods
  async getIncomes(userId: number): Promise<Income[]> {
    const result = await pool.query(
      'SELECT * FROM incomes WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    return result.rows;
  }

  async getIncomeById(id: number): Promise<Income | undefined> {
    const result = await pool.query(
      'SELECT * FROM incomes WHERE id = $1',
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createIncome(income: InsertIncome): Promise<Income> {
    const { userId, name, amount, category, date, recurring, frequency, notes } = income;
    const result = await pool.query(
      'INSERT INTO incomes (user_id, name, amount, category, date, recurring, frequency, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userId, name, amount, category, date, recurring, frequency, notes]
    );
    return result.rows[0];
  }

  async updateIncome(id: number, incomeUpdate: Partial<InsertIncome>): Promise<Income | undefined> {
    // Build dynamic update query
    const setFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Add each field to the update
    for (const [key, value] of Object.entries(incomeUpdate)) {
      if (value !== undefined) {
        const columnName = this.camelToSnakeCase(key);
        setFields.push(`${columnName} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (setFields.length === 0) {
      // Nothing to update
      return this.getIncomeById(id);
    }

    // Add id as the last parameter
    values.push(id);
    
    const query = `
      UPDATE incomes 
      SET ${setFields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || undefined;
  }

  async deleteIncome(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM incomes WHERE id = $1',
      [id.toString()]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Expense methods
  async getExpenses(userId: number): Promise<Expense[]> {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    return result.rows;
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE id = $1',
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const { userId, name, amount, category, subcategory, date, recurring, frequency, notes } = expense;
    const result = await pool.query(
      'INSERT INTO expenses (user_id, name, amount, category, subcategory, date, recurring, frequency, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [userId, name, amount, category, subcategory, date, recurring, frequency, notes]
    );
    return result.rows[0];
  }

  async updateExpense(id: number, expenseUpdate: Partial<InsertExpense>): Promise<Expense | undefined> {
    // Build dynamic update query
    const setFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Add each field to the update
    for (const [key, value] of Object.entries(expenseUpdate)) {
      if (value !== undefined) {
        const columnName = this.camelToSnakeCase(key);
        setFields.push(`${columnName} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (setFields.length === 0) {
      // Nothing to update
      return this.getExpenseById(id);
    }

    // Add id as the last parameter
    values.push(id);
    
    const query = `
      UPDATE expenses 
      SET ${setFields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || undefined;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1',
      [id.toString()]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Budget methods
  async getBudgets(userId: number, month: number, year: number): Promise<Budget[]> {
    const result = await pool.query(
      'SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3',
      [userId, month, year]
    );
    return result.rows;
  }

  async getBudgetById(id: number): Promise<Budget | undefined> {
    const result = await pool.query(
      'SELECT * FROM budgets WHERE id = $1',
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const { userId, category, subcategory, amount, month, year } = budget;
    const result = await pool.query(
      'INSERT INTO budgets (user_id, category, subcategory, amount, month, year) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, category, subcategory, amount, month, year]
    );
    return result.rows[0];
  }

  async updateBudget(id: number, budgetUpdate: Partial<InsertBudget>): Promise<Budget | undefined> {
    // Build dynamic update query
    const setFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Add each field to the update
    for (const [key, value] of Object.entries(budgetUpdate)) {
      if (value !== undefined) {
        const columnName = this.camelToSnakeCase(key);
        setFields.push(`${columnName} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (setFields.length === 0) {
      // Nothing to update
      return this.getBudgetById(id);
    }

    // Add id as the last parameter
    values.push(id);
    
    const query = `
      UPDATE budgets 
      SET ${setFields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || undefined;
  }

  async deleteBudget(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1',
      [id.toString()]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Savings goals methods
  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    const result = await pool.query(
      'SELECT * FROM savings_goals WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  }

  async getSavingsGoalById(id: number): Promise<SavingsGoal | undefined> {
    const result = await pool.query(
      'SELECT * FROM savings_goals WHERE id = $1',
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal> {
    const { userId, name, targetAmount, currentAmount, deadline, notes } = goal;
    const result = await pool.query(
      'INSERT INTO savings_goals (user_id, name, target_amount, current_amount, deadline, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, name, targetAmount, currentAmount || '0', deadline, notes]
    );
    return result.rows[0];
  }

  async updateSavingsGoal(id: number, goalUpdate: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined> {
    // Build dynamic update query
    const setFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Add each field to the update
    for (const [key, value] of Object.entries(goalUpdate)) {
      if (value !== undefined) {
        const columnName = this.camelToSnakeCase(key);
        setFields.push(`${columnName} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (setFields.length === 0) {
      // Nothing to update
      return this.getSavingsGoalById(id);
    }

    // Add id as the last parameter
    values.push(id);
    
    const query = `
      UPDATE savings_goals 
      SET ${setFields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || undefined;
  }

  async deleteSavingsGoal(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM savings_goals WHERE id = $1',
      [id.toString()]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Investment methods
  async getInvestments(userId: number): Promise<Investment[]> {
    const result = await pool.query(
      'SELECT * FROM investments WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  }

  async getInvestmentById(id: number): Promise<Investment | undefined> {
    const result = await pool.query(
      'SELECT * FROM investments WHERE id = $1',
      [id]
    );
    return result.rows[0] || undefined;
  }

  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const { userId, name, category, initialAmount, currentValue, purchaseDate, interestRate, notes } = investment;
    const result = await pool.query(
      'INSERT INTO investments (user_id, name, category, initial_amount, current_value, purchase_date, interest_rate, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userId, name, category, initialAmount, currentValue, purchaseDate, interestRate, notes]
    );
    return result.rows[0];
  }

  async updateInvestment(id: number, investmentUpdate: Partial<InsertInvestment>): Promise<Investment | undefined> {
    // Build dynamic update query
    const setFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Add each field to the update
    for (const [key, value] of Object.entries(investmentUpdate)) {
      if (value !== undefined) {
        const columnName = this.camelToSnakeCase(key);
        setFields.push(`${columnName} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (setFields.length === 0) {
      // Nothing to update
      return this.getInvestmentById(id);
    }

    // Add id as the last parameter
    values.push(id);
    
    const query = `
      UPDATE investments 
      SET ${setFields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || undefined;
  }

  async deleteInvestment(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM investments WHERE id = $1',
      [id.toString()]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Transaction methods
  async getTransactions(userId: number): Promise<Transaction[]> {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    return result.rows;
  }
  
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    );
    return result.rows[0] || undefined;
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const { 
      userId, 
      date, 
      type, 
      amount, 
      category, 
      subcategory, 
      description, 
      frequency, 
      notes, 
      isRecurring,
      hasEndDate,
      endDate,
      nextDueDate,
      budgetMonth,
      budgetYear,
      paymentMethod,
      balance,
      reference,
      importHash 
    } = transaction;
    
    const result = await pool.query(
      `INSERT INTO transactions (
        user_id, date, type, amount, category, subcategory, description, 
        frequency, notes, is_recurring, has_end_date, end_date, next_due_date, 
        budget_month, budget_year, payment_method, 
        balance, reference, import_hash, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()) RETURNING *`,
      [
        userId, date, type, amount, category, subcategory, description, 
        frequency, notes, isRecurring, hasEndDate, endDate, nextDueDate,
        budgetMonth, budgetYear, paymentMethod,
        balance, reference, importHash
      ]
    );
    return result.rows[0];
  }
  
  async createManyTransactions(transactions: InsertTransaction[]): Promise<Transaction[]> {
    const createdTransactions: Transaction[] = [];
    
    // Use a transaction to insert all transactions
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const transaction of transactions) {
        const result = await client.query(
          `INSERT INTO transactions (
            user_id, date, type, amount, category, subcategory, description, 
            frequency, notes, is_recurring, has_end_date, end_date, next_due_date, 
            budget_month, budget_year, payment_method, 
            balance, reference, import_hash, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()) RETURNING *`,
          [
            transaction.userId, 
            transaction.date, 
            transaction.type, 
            transaction.amount, 
            transaction.category, 
            transaction.subcategory, 
            transaction.description, 
            transaction.frequency, 
            transaction.notes, 
            transaction.isRecurring,
            transaction.hasEndDate,
            transaction.endDate,
            transaction.nextDueDate,
            transaction.budgetMonth,
            transaction.budgetYear,
            transaction.paymentMethod,
            transaction.balance,
            transaction.reference,
            transaction.importHash
          ]
        );
        createdTransactions.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
    return createdTransactions;
  }
  
  async updateTransaction(id: number, transactionUpdate: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    // Build dynamic update query
    const setFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Add each field to the update
    for (const [key, value] of Object.entries(transactionUpdate)) {
      if (value !== undefined) {
        const columnName = this.camelToSnakeCase(key);
        setFields.push(`${columnName} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (setFields.length === 0) {
      // Nothing to update
      return this.getTransactionById(id);
    }

    // Add id as the last parameter
    values.push(id);
    
    const query = `
      UPDATE transactions 
      SET ${setFields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || undefined;
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1',
      [id.toString()]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  async getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date DESC',
      [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    );
    return result.rows;
  }
  
  async getTransactionsByCategory(userId: number, category: string): Promise<Transaction[]> {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 AND category = $2 ORDER BY date DESC',
      [userId, category]
    );
    return result.rows;
  }
  
  async getTransactionsByBudgetMonth(userId: number, month: number, year: number): Promise<Transaction[]> {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 AND budget_month = $2 AND budget_year = $3 ORDER BY date DESC',
      [userId, month, year]
    );
    return result.rows;
  }
  
  async getTransactionByImportHash(importHash: string): Promise<Transaction | undefined> {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE import_hash = $1',
      [importHash]
    );
    return result.rows[0] || undefined;
  }

  // Helper method to convert camelCase to snake_case for PostgreSQL columns
  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}