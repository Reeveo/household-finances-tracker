# API Documentation

## Overview

This document describes the API endpoints used by the Personal Finance Tracker.

## Authentication

All API endpoints require authentication.

## Endpoints

### Transactions

#### GET /api/transactions

Retrieves a list of transactions.

**Request:**

```json
{}
```

**Response:**

```json
[
  {
    "id": 1,
    "userId": 1,
    "date": "2024-01-01",
    "description": "Grocery shopping",
    "amount": -50,
    "category": "Essentials",
    "subcategory": "Food",
    "merchant": "Tesco",
    "isRecurring": false,
    "budgetMonth": "2024-01"
  }
]
```

#### POST /api/transactions

Creates a new transaction.

**Request:**

```json
{
  "date": "2024-01-02",
  "description": "Salary",
  "amount": 2000,
  "category": "Income",
  "subcategory": null,
  "merchant": "Acme Corp",
  "isRecurring": true,
  "budgetMonth": "2024-01"
}
```

**Response:**

```json
{
  "id": 2,
  "userId": 1,
  "date": "2024-01-02",
  "description": "Salary",
  "amount": 2000,
  "category": "Income",
  "subcategory": null,
  "merchant": "Acme Corp",
  "isRecurring": true,
  "budgetMonth": "2024-01"
}
```

### Budgets

#### GET /api/budgets

Retrieves a list of budgets.

#### POST /api/budgets

Creates a new budget.

### Savings

#### GET /api/savings

Retrieves a list of savings.

#### POST /api/savings

Creates a new saving.
