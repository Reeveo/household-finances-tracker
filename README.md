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
- React Router for client-side routing

### Backend
- Node.js with Express
- PostgreSQL database
- Supabase for authentication and storage
- Drizzle ORM with Zod validation
- JWT-based authentication with Supabase Auth

### Testing
- Vitest for unit and integration tests
- Testing Library for component testing
- Custom test utilities for consistent test environments
- Standardized mock implementations for predictable testing

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose (for local Supabase)

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

3. Set up local Supabase instance
```bash
npx supabase start
```

This will start a local Supabase instance using Docker. The output will show the URLs and keys needed to connect to the database.

4. Set up environment variables
Create a `.env` file in the root directory with the following variables (use the values from the Supabase CLI output):
```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:<PORT>/postgres
VITE_SUPABASE_URL=http://127.0.0.1:<PORT>
VITE_SUPABASE_ANON_KEY=<ANON_KEY_FROM_OUTPUT>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY_FROM_OUTPUT>
SESSION_SECRET=your_secret_key_here
```

5. Set up the database
```bash
npm run db:push
```

6. Start the development server
```bash
npm run dev
```

7. Visit `http://localhost:3000` to use the application

8. When you're done, you can stop the local Supabase instance with:
```bash
npx supabase stop
```

## 📊 Data Model

The application uses the following core data entities:

- **Users**: Account information and authentication details
- **Auth Mapping**: Maps Supabase Auth users to application users
- **Transactions**: Financial transactions with categories and metadata
- **Budgets**: Monthly budget targets by category
- **Savings Goals**: Target amounts with deadlines and tracking
- **Investments**: Portfolio items with performance tracking
- **Shared Access**: Permission settings for shared financial data

## 🔒 Security Features

- JWT-based authentication with Supabase Auth
- Secure password management through Supabase
- Row Level Security (RLS) with Supabase policies
- Input validation with Zod schemas
- Permission-based access control
- Secure user migration strategy

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

Run specific tests with:
```bash
npm test -- path/to/test/file
```

The project includes:
- Unit tests for utilities and components
- Integration tests for API endpoints
- End-to-end tests for critical user flows

### Testing Utilities

The project includes robust testing utilities:
- `renderWithProviders`: A custom render function that provides all necessary context providers
- `setupMocks`: A utility to configure test mocks consistently
- Custom test helpers for common testing operations

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Shadcn UI](https://ui.shadcn.com/) for the component system
- [TanStack Query](https://tanstack.com/query) for data fetching
- [Drizzle ORM](https://orm.drizzle.team/) for database operations
- [Recharts](https://recharts.org/) for data visualization
- [Supabase](https://supabase.com/) for the database and authentication services
- [React Router](https://reactrouter.com/) for client-side routing

## 🚧 Current Development Status

The project is currently in active development with the following status:

- ✅ Core transaction management functionality
- ✅ User authentication and authorization with Supabase
- ✅ Basic dashboard and reporting
- ✅ Financial calculators for mortgages and pensions
- ✅ Data visualization components
- ✅ JWT-based authentication with Supabase Auth
- ✅ Dual-auth system for migration from session-based to JWT authentication
- 🔄 API documentation in progress
- 🔄 Testing improvements ongoing
- 🔄 Advanced features in development