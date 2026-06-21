# Contributing to CarbonWise AI

Thank you for your interest in contributing to CarbonWise AI! This guide will help you get started.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Reporting Issues](#reporting-issues)
- [Code of Conduct](#code-of-conduct)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A [Firebase Project](https://console.firebase.google.com/) with Firestore and Google Auth enabled
- A [Google Gemini API Key](https://aistudio.google.com/apikey)
- Git

### Setup

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/<your-username>/carbonwise-ai.git
   cd carbonwise-ai
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Configure environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Firebase and Gemini credentials in `.env.local`.

5. **Start the development server:**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

---

## 🌿 Development Workflow

### Branch Naming

Create a new branch from `main` for each change:

| Prefix | Use Case | Example |
|---|---|---|
| `feature/` | New feature | `feature/barcode-scanner` |
| `fix/` | Bug fix | `fix/auth-redirect-loop` |
| `docs/` | Documentation | `docs/update-deployment-guide` |
| `refactor/` | Code refactoring | `refactor/simplify-emission-calc` |
| `style/` | Formatting / UI tweaks | `style/dashboard-spacing` |

```bash
git checkout -b feature/your-feature-name
```

### Guidelines

- Keep branches **focused and small** — one feature or fix per branch.
- Rebase on `main` before opening a PR to keep history clean.
- Run `npm run lint` to verify TypeScript compiles without errors before pushing.

---

## 📝 Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>
```

### Types

| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, no logic changes |
| `refactor` | Code restructuring, no behavior change |
| `test` | Adding or updating tests |
| `chore` | Build scripts, tooling, config |

### Examples

```
feat: add barcode scanning to receipt view
fix: resolve Firestore permission error on guest mode
docs: add deployment troubleshooting section
style: format dashboard chart margins
refactor: extract emission factors to constants
test: add unit tests for carbon calculator
```

---

## 🔀 Pull Request Process

1. **Create** a feature branch from `main`.
2. **Make** your changes with clear, descriptive commits.
3. **Test** locally — ensure the app runs, no console errors, UI is responsive.
4. **Push** your branch and open a Pull Request against `main`.
5. **Fill out** the PR description with:
   - What changed and why
   - Screenshots (if UI changes)
   - Testing steps

### PR Checklist

Before submitting, confirm:

- [ ] Code compiles without errors (`npm run lint`)
- [ ] Application runs locally (`npm run dev`)
- [ ] No console errors in the browser
- [ ] UI is responsive across screen sizes
- [ ] Commit messages follow the conventional commit format
- [ ] Documentation updated if applicable
- [ ] No secrets or API keys committed

---

## 🎨 Code Style

- **TypeScript** — Use strict typing. Avoid `any` where possible.
- **React** — Functional components with hooks. No class components.
- **Styling** — Tailwind CSS utility classes. No inline styles.
- **Naming** — Descriptive variable and function names in camelCase.
- **Components** — One component per file. PascalCase filenames.
- **Comments** — Add comments for complex logic, AI prompt construction, and emission factor sources.

---

## 🐛 Reporting Issues

Open a [GitHub Issue](https://github.com/sarawagh27/carbonwise-ai/issues) with:

- **Clear title** summarizing the problem
- **Steps to reproduce** the issue
- **Expected behavior** vs. **actual behavior**
- **Screenshots** or error messages if applicable
- **Environment** — browser, OS, zoom level

---

## 🤝 Code of Conduct

We are committed to providing a welcoming, respectful, and inclusive environment for everyone. By participating, you agree to:

- Be respectful and constructive in all interactions
- Welcome newcomers and help them get started
- Focus on what is best for the community and the project
- Accept constructive criticism gracefully

---

Thank you for helping make CarbonWise AI better! 💚
