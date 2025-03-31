import { pgTable, text, serial, integer, numeric, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// Shared access and permissions
export const sharedAccess = pgTable("shared_access", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  partnerId: integer("partner_id").notNull().references(() => users.id),
  accessLevel: text("access_level").notNull().default("view"), // view or edit
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  inviteDate: timestamp("invite_date").defaultNow(),
  acceptedDate: timestamp("accepted_date"),
});

export const insertSharedAccessSchema = createInsertSchema(sharedAccess).pick({
  ownerId: true,
  partnerId: true,
  accessLevel: true,
});

// Invitation tokens for partner access
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  accessLevel: text("access_level").notNull().default("view"),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  userId: true,
  token: true,
  email: true,
  accessLevel: true,
  expiresAt: true,
});

// Income sources schema
export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  recurring: boolean("recurring").default(false),
  frequency: text("frequency"), // monthly, weekly, annual
  notes: text("notes"),
});

export const insertIncomeSchema = createInsertSchema(incomes).pick({
  userId: true,
  name: true,
  amount: true,
  category: true,
  date: true,
  recurring: true,
  frequency: true,
  notes: true,
});

// Expenses schema
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // Essentials, Lifestyle, Savings
  subcategory: text("subcategory"), // Housing, Food, etc.
  date: timestamp("date").notNull(),
  recurring: boolean("recurring").default(false),
  frequency: text("frequency"), // monthly, weekly, annual
  notes: text("notes"),
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  userId: true,
  name: true,
  amount: true,
  category: true,
  subcategory: true,
  date: true,
  recurring: true,
  frequency: true,
  notes: true,
});

// Budget schema
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  category: text("category").notNull(), // Essentials, Lifestyle, Savings
  subcategory: text("subcategory"), // Housing, Food, etc.
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  userId: true,
  category: true,
  subcategory: true,
  amount: true,
  month: true,
  year: true,
});

// Savings schema
export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 10, scale: 2 }).default("0"),
  deadline: timestamp("deadline"),
  notes: text("notes"),
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).pick({
  userId: true,
  name: true,
  targetAmount: true,
  currentAmount: true,
  deadline: true,
  notes: true,
});

// Investments schema
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  category: text("category").notNull(), // Stocks, Bonds, ETFs, etc.
  initialAmount: numeric("initial_amount", { precision: 10, scale: 2 }).notNull(),
  currentValue: numeric("current_value", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }),
  notes: text("notes"),
});

export const insertInvestmentSchema = createInsertSchema(investments).pick({
  userId: true,
  name: true,
  category: true,
  initialAmount: true,
  currentValue: true,
  purchaseDate: true,
  interestRate: true,
  notes: true,
});

// Auth mapping for Supabase integration
export const authMapping = pgTable("auth_mapping", {
  id: serial("id").primaryKey(),
  authId: text("auth_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuthMappingSchema = createInsertSchema(authMapping).pick({
  authId: true,
  userId: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AuthMapping = typeof authMapping.$inferSelect;
export type InsertAuthMapping = z.infer<typeof insertAuthMappingSchema>;

export type SharedAccess = typeof sharedAccess.$inferSelect;
export type InsertSharedAccess = z.infer<typeof insertSharedAccessSchema>;

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;

export type Income = typeof incomes.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

// Transactions schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: date("date").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // income, expense
  category: text("category").notNull(), // Essentials, Lifestyle, Savings, Income
  subcategory: text("subcategory"),
  paymentMethod: text("payment_method"),
  reference: text("reference"),
  balance: numeric("balance", { precision: 10, scale: 2 }),
  budgetMonth: integer("budget_month"),
  budgetYear: integer("budget_year"),
  isRecurring: boolean("is_recurring").default(false),
  frequency: text("frequency"), // monthly, weekly, annual, quarterly
  endDate: date("end_date"), // Optional end date for recurring transactions
  hasEndDate: boolean("has_end_date").default(false), // Whether the recurring transaction has an end date
  nextDueDate: date("next_due_date"), // Next occurrence date for recurring transactions
  notes: text("notes"),
  importHash: text("import_hash"), // For deduplication
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  date: true,
  description: true,
  amount: true,
  type: true,
  category: true,
  subcategory: true,
  paymentMethod: true,
  reference: true,
  balance: true,
  budgetMonth: true,
  budgetYear: true,
  isRecurring: true,
  frequency: true,
  endDate: true,
  hasEndDate: true,
  nextDueDate: true,
  notes: true,
  importHash: true,
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
