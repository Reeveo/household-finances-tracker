import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
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

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

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
