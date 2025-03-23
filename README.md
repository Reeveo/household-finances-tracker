# Personal Finance Tracker

A comprehensive personal finance management platform designed to transform financial tracking into an engaging and intuitive experience.

![Personal Finance Tracker](generated-icon.png)

## 📋 Overview

The Personal Finance Tracker is a full-stack web application designed to help users manage their financial life in British Pounds (GBP). It provides an intuitive interface for tracking income and expenses, visualizing spending patterns, and planning financial goals.

## ✨ Features

### 💰 Transaction Management
- Track income and expenses with detailed categorization
- Import bank statements via CSV files with automatic transaction categorization
- Manual transaction entry with category assignment
- Filter and search transactions by date, category, and description

### 📊 Financial Insights
- Dashboard with key financial metrics and trends
- Spending breakdown by category
- Income sources visualization
- Net worth tracking over time

### 💼 Budget Management
- Create monthly budgets by category
- Track budget progress with visual indicators
- Get alerts for over-budget categories

### 💹 Savings & Investments
- Set and track savings goals with target dates
- Monitor investment portfolio performance
- Calculate compound growth projections

### 🏠 Financial Calculators
- Mortgage calculator with amortization schedule
- Mortgage overpayment calculator showing interest savings
- Pension calculator with retirement projections
- Salary calculator with tax implications (UK tax system)

### 👥 Shared Access
- Share financial data with partners or financial advisors
- Control permission levels (view-only or edit)
- Invite users via secure invitation links

## 🛠️ Technology Stack

### Frontend
- React with TypeScript
- TanStack Query for data fetching
- React Hook Form for form management
- Shadcn UI components with Tailwind CSS
- Recharts for data visualization
- Wouter for routing

### Backend
- Node.js with Express
- PostgreSQL database
- Drizzle ORM with Zod validation
- Passport.js for authentication
- Session-based authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/personal-finance-tracker.git
cd personal-finance-tracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgresql://username:password@localhost:5432/finance_tracker
SESSION_SECRET=your_secret_key_here
```

4. Set up the database
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

6. Visit `http://localhost:5000` to use the application

## 📊 Data Model

The application uses the following core data entities:

- **Users**: Account information and authentication details
- **Transactions**: Financial transactions with categories and metadata
- **Budgets**: Monthly budget targets by category
- **Savings Goals**: Target amounts with deadlines and tracking
- **Investments**: Portfolio items with performance tracking
- **Shared Access**: Permission settings for shared financial data

## 🔒 Security Features

- Secure password hashing using scrypt
- Session-based authentication
- CSRF protection
- Input validation with Zod schemas
- Permission-based access control

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🧪 Testing

Run the test suite with:
```bash
npm test
```

The project includes:
- Unit tests for utilities and components
- Integration tests for API endpoints
- End-to-end tests for critical user flows

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Shadcn UI](https://ui.shadcn.com/) for the component system
- [TanStack Query](https://tanstack.com/query) for data fetching
- [Drizzle ORM](https://orm.drizzle.team/) for database operations
- [Recharts](https://recharts.org/) for data visualization