# Project File Structure

This document outlines the structure of the Personal Finance Tracker project and provides descriptions for each major component.

## Root Directory Structure

```
├── .github/                 # GitHub Actions workflows and templates
├── .git/                    # Git version control system files
├── Project/                 # Project documentation and planning
│   ├── components/         # Component documentation and specifications
│   ├── overview.md         # Product Requirements Document (PRD)
│   ├── ci-cd-pipeline.md   # CI/CD pipeline documentation
│   └── Roadmap.md          # Project roadmap and milestones
├── client/                 # Frontend application code
├── server/                 # Backend application code
├── shared/                 # Shared code between client and server
├── supabase/              # Supabase configuration and migrations
├── drizzle/               # Database schema and migrations
├── docs/                  # Project documentation
├── performance/           # Performance testing and optimization
├── coverage/              # Test coverage reports
├── node_modules/          # Node.js dependencies
└── attached_assets/       # Project assets and resources
```

## Key Configuration Files

- `.env` & `.env.example` - Environment variables configuration
- `package.json` - Node.js project configuration and dependencies
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build tool configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `drizzle.config.ts` - Database ORM configuration
- `jest.config.js` - Jest testing framework configuration
- `vitest.config.ts` - Vitest testing framework configuration

## Component Descriptions

### Project Documentation
- `overview.md`: Contains the Product Requirements Document (PRD) detailing the application's features and requirements
- `ci-cd-pipeline.md`: Documentation for the Continuous Integration/Continuous Deployment pipeline
- `Roadmap.md`: Project roadmap, milestones, and future development plans
- `components/`: Documentation for individual application components

### Application Code
- `client/`: Frontend React application code
  - Components, pages, hooks, and utilities
  - State management
  - UI/UX implementations
- `server/`: Backend Node.js application code
  - API endpoints
  - Business logic
  - Database interactions
- `shared/`: Code shared between frontend and backend
  - Types
  - Utilities
  - Constants

### Database
- `supabase/`: Supabase configuration and setup
  - Database migrations
  - Row Level Security policies
- `drizzle/`: Database schema definitions and migrations
  - Type-safe database queries
  - Schema management

### Testing & Quality
- `performance/`: Performance testing and optimization
  - Load testing scripts
  - Performance benchmarks
- `coverage/`: Test coverage reports
  - Generated coverage data
  - Coverage thresholds

### Documentation
- `docs/`: Comprehensive project documentation
  - API documentation
  - Setup guides
  - Architecture diagrams
  - Development guidelines

### Development Tools
- `.github/`: GitHub-specific configurations
  - Workflow definitions
  - Issue templates
  - Pull request templates
- `node_modules/`: Project dependencies
  - Third-party packages
  - Development tools

### Assets
- `attached_assets/`: Project resources
  - Images
  - Icons
  - Static files

## Development Guidelines

1. All new components should be documented in the `Project/components/` directory
2. Database changes should be tracked in both `supabase/` and `drizzle/` directories
3. Shared code should be placed in the `shared/` directory
4. Performance optimizations should be tested and documented in the `performance/` directory
5. All major features should have corresponding documentation in the `docs/` directory 