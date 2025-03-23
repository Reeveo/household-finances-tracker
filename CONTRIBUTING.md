# Contributing to Personal Finance Tracker

Thank you for considering contributing to the Personal Finance Tracker! This document outlines the guidelines and workflows for contributing to this project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to foster an inclusive and respectful community.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
- Check the [issues](https://github.com/yourusername/personal-finance-tracker/issues) to see if the bug has already been reported
- Make sure you're using the latest version of the software

When submitting a bug report, please include:
- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior and actual behavior
- Screenshots or GIFs (if applicable)
- Environment details (OS, browser, version, etc.)

### Suggesting Enhancements

For feature suggestions, please include:
- A clear and descriptive title
- Detailed description of the suggested enhancement
- Explanation of why this enhancement would be useful
- Mockups or examples (if applicable)

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`
3. Make your changes
4. Run tests to ensure they pass
5. Submit a pull request to the `main` branch

## Development Workflow

### Setting Up the Development Environment

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

### Code Style

- Follow the existing code style in the project
- Use TypeScript type annotations where possible
- Write descriptive commit messages
- Keep components modular and reusable

### Testing

- Write tests for new features or bug fixes
- Run the existing test suite before submitting a pull request
```bash
npm test
```

## Documentation

- Update the README.md file with any necessary changes
- Add JSDoc comments to functions and components
- Update API documentation if you make changes to the API

## Questions?

If you have any questions about contributing, please open an issue with the label "question".

Thank you for contributing to making the Personal Finance Tracker better for everyone!