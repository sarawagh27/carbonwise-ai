# 🧪 Testing Documentation

This document outlines the testing strategies and practices used in **CarbonWise AI** to maintain code quality, calculate accuracy, and prevent regressions.

## 🎯 Testing Philosophy

CarbonWise AI relies on a modular testing approach with an emphasis on **Business Logic** and **Calculation Integrity**. Given the nature of a carbon calculator, precision in emission factors is paramount.

## 🛠️ Testing Stack

- **Framework**: [Vitest](https://vitest.dev/)
- **Environment**: Node.js natively
- **Static Analysis**: ESLint v9 & TypeScript Compiler

## 📂 Current Test Coverage

### Unit Tests
The core calculation logic is thoroughly unit-tested. This ensures that:
1. Category accumulation (`calculateCategoryEmissions`) properly maps distinct sub-categories to their parent buckets.
2. Emissions percentage changes (`calculatePercentageChange`) correctly handle negative footprints and zero-divisors.
3. Equivalent offsets (`calculateTreeEquivalent`, `calculateCarKmEquivalent`) accurately translate abstract kg CO₂e into relatable real-world metrics.

Location: `src/utils/math.test.ts`

### Running the Tests

To run the test suite locally in watch mode:
```bash
npm run test
```

To run once (CI mode):
```bash
npx vitest run
```

## 🔄 Continuous Integration (CI)

We utilize **GitHub Actions** to automate our testing pipeline. On every `push` or `pull_request` to the `main` branch, the CI pipeline (`.github/workflows/ci.yml`) executes the following checks:
1. `npm ci` - Dependency installation
2. `npm run lint` - Static code analysis and formatting checks
3. `npm run test` - Execution of the Vitest unit test suite
4. `npm run build` - Verification of the Vite and esbuild production compilation

## 🚀 Future Testing Roadmap

As the project scales, the following testing layers are planned:
1. **Component Testing**: Implementing `@testing-library/react` to test complex UI states in `DashboardView` and `TrackerView`.
2. **E2E Testing**: Integrating `Playwright` or `Cypress` to mock Firebase authentication and test the complete user journey from Login to Receipt Scanning.
3. **API Mocking**: Using `msw` (Mock Service Worker) to simulate Gemini API responses for reliable NLP tracker testing without consuming API quotas.
