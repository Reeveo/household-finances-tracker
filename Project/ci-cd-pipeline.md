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
   - Snyk vulnerability scanning
   - Dependency security audit
   - Code security analysis

4. **Testing**
   - Unit tests (`npm run test:unit`)
   - Integration tests (`npm run test:integration`)
   - Coverage reporting to Codecov

5. **Build Verification**
   - Production build check
   - Asset compilation verification

## Deployment Workflow

Triggered on: Push to `main` or `master` branches

### Staging Deployment

1. **Initial Checks**
   - Environment setup (Node.js, PostgreSQL)
   - Dependency installation

2. **Testing**
   - Unit and integration tests
   - Build verification

3. **Error Tracking Setup**
   - Sentry CLI configuration
   - Source map upload

4. **Deployment**
   - Staging environment deployment
   - Environment variable configuration

5. **Post-Deployment Verification**
   - Performance testing with k6
   - E2E tests on staging
   - Health checks

### Production Deployment

1. **Prerequisites**
   - Successful staging deployment
   - Environment setup

2. **Deployment Steps**
   - Production build
   - Source map upload to Sentry
   - Database migrations
   - Production deployment

3. **Verification**
   - Health check verification
   - Production URL confirmation

## Performance Testing

Using k6 for load testing with the following scenarios:

1. **Homepage Load Test**
   - Target: < 3s load time
   - Success criteria: 200 status code

2. **Login API Test**
   - Target: < 200ms response time
   - Success criteria: 200 status code

3. **Dashboard Load Test**
   - Target: < 3s load time
   - Success criteria: 200 status code

Test parameters:
- Ramp up: 1 minute to 20 users
- Sustained load: 3 minutes at 20 users
- Ramp down: 1 minute to 0 users

## Required Secrets

### Security & Authentication
```yaml
SNYK_TOKEN: Snyk API token for security scanning
CODECOV_TOKEN: Codecov token for coverage reporting
```

### Error Tracking
```yaml
SENTRY_AUTH_TOKEN: Sentry authentication token
SENTRY_ORG: Sentry organization name
SENTRY_PROJECT: Sentry project identifier
```

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
  "test:security": "Snyk security tests",
  "sentry:sourcemaps": "Upload source maps to Sentry"
}
```

## Quality Gates

1. **Pull Requests**
   - All tests must pass
   - Code coverage requirements met
   - No security vulnerabilities
   - Linting/formatting checks pass

2. **Staging Deployment**
   - All tests pass
   - Performance tests meet thresholds
   - E2E tests pass
   - Health checks successful

3. **Production Deployment**
   - Successful staging deployment
   - Database migrations successful
   - Health checks pass

## Monitoring & Alerts

1. **Error Tracking**
   - Sentry for real-time error monitoring
   - Source map integration for debugging

2. **Performance Monitoring**
   - k6 performance metrics
   - InfluxDB metrics storage

3. **Health Checks**
   - Regular endpoint monitoring
   - Database connection verification

## Rollback Procedures

1. **Staging Rollback**
   - Automatic rollback on failed health checks
   - Manual rollback available through GitHub Actions

2. **Production Rollback**
   - Manual approval required
   - Database migration rollback plan
   - Source map version control 