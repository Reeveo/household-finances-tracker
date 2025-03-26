# CI/CD Pipeline Documentation

## Overview

The CI/CD pipeline for the Personal Finance Tracker consists of two main workflows:
1. Pull Request Validation (`pr.yml`)
2. Deployment Pipeline (`deploy.yml`)

## Pull Request Workflow

Triggered on: Pull requests to `main` or `master` branches

### Steps:

1. **Environment Setup**
   - Ubuntu latest runner
   - PostgreSQL service container for tests
   - Node.js 18.x

2. **Code Quality Checks**
   - TypeScript type checking (`npm run check`)
   - ESLint linting (`npm run lint`)
   - Prettier formatting (`npm run format:check`)

3. **Security Scanning**
   - npm audit for dependency vulnerabilities
   - Built-in security checks
   - Package version verification

4. **Testing & Coverage**
   - Unit tests with coverage reporting (`npm run test:coverage`)
   - Integration tests (`npm run test:integration`)
   - Local coverage threshold enforcement (80% minimum)
   - HTML coverage reports generated for review

5. **Build Verification**
   - Production build check
   - Asset compilation verification

## Error Tracking & Logging

The application uses Winston for structured logging and error tracking:
- Log levels: error, warn, info, debug
- JSON formatted logs for machine parsing
- Console and file transport options
- Configurable log rotation and retention
- Error stack traces and metadata capture

## Deployment Workflow

[... rest of deployment workflow section remains unchanged ...]

## Required Secrets

### Staging Environment
```yaml
STAGING_DEPLOY_URL: Staging deployment endpoint
STAGING_DATABASE_URL: Staging database connection string
STAGING_SESSION_SECRET: Session secret for staging
STAGING_URL: Staging application URL
```

### Production Environment
```yaml
PROD_DEPLOY_URL: Production deployment endpoint
PROD_DATABASE_URL: Production database connection string
PROD_SESSION_SECRET: Session secret for production
PROD_HEALTH_CHECK_URL: Production health check endpoint
```

### Monitoring
```yaml
INFLUXDB_HOST: InfluxDB host for performance metrics
```

## Scripts

Available npm scripts for CI/CD:

```json
{
  "test:unit": "Unit tests",
  "test:integration": "Integration tests",
  "test:e2e": "End-to-end tests",
  "test:e2e:ci": "E2E tests in CI environment",
  "test:performance": "k6 load tests",
  "test:security": "npm security audit",
  "test:coverage": "Run tests with coverage reporting"
}
```

## Quality Gates

1. **Pull Requests**
   - All tests must pass
   - Code coverage must be 80% or higher
   - No security vulnerabilities (npm audit)
   - Linting/formatting checks pass

2. **Staging Deployment**
   - All PR checks must pass
   - Performance tests within thresholds
   - Successful staging deployment
   - Health check verification

3. **Production Deployment**
   - All staging checks must pass
   - Manual approval required
   - Zero-downtime deployment
   - Health check verification

## Monitoring & Alerts

- Winston logging for application monitoring
- Structured log format for easy parsing
- Error tracking with full stack traces
- Performance monitoring with k6
- Health check endpoints for uptime monitoring

## Rollback Procedures

1. **Staging Rollback**
   - Automatic rollback on deployment failure
   - Manual rollback via deployment workflow
   - Database migration rollback if needed

2. **Production Rollback**
   - Blue-green deployment for zero-downtime rollback
   - Database rollback procedures
   - Monitoring of system metrics during rollback

[... rest of the documentation remains unchanged ...] 