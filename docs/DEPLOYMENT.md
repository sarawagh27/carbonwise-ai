# CarbonWise AI — Deployment Guide

Step-by-step guide to deploying CarbonWise AI to production.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1: Firebase Setup](#step-1-firebase-setup)
- [Step 2: Google Gemini API](#step-2-google-gemini-api)
- [Step 3: Environment Configuration](#step-3-environment-configuration)
- [Step 4: Local Development](#step-4-local-development)
- [Step 5: Vercel Deployment](#step-5-vercel-deployment)
- [Step 6: Post-Deployment Configuration](#step-6-post-deployment-configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement | Minimum Version | Link |
|---|---|---|
| Node.js | v18+ | [nodejs.org](https://nodejs.org/) |
| npm | v9+ | Included with Node.js |
| Firebase Account | — | [console.firebase.google.com](https://console.firebase.google.com/) |
| Google AI Studio | — | [aistudio.google.com](https://aistudio.google.com/) |
| Vercel Account | — | [vercel.com](https://vercel.com/) |
| GitHub Account | — | [github.com](https://github.com/) |

---

## Step 1: Firebase Setup

### 1.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** and follow the setup wizard.
3. Disable Google Analytics if not needed (optional).

### 1.2 Enable Authentication

1. In your Firebase project, navigate to **Authentication** in the left sidebar.
2. Click **"Get started"**.
3. Go to the **Sign-in method** tab.
4. Enable **Google** as a sign-in provider.
5. Configure the OAuth consent screen with your project name and support email.

### 1.3 Enable Firestore Database

1. Navigate to **Firestore Database** in the left sidebar.
2. Click **"Create database"**.
3. Select **Production mode** (we'll deploy custom security rules).
4. Choose your preferred region.

### 1.4 Register a Web App

1. Go to **Project Settings** (gear icon) → **General**.
2. Scroll to **"Your apps"** and click the web icon (`</>`) to add a web app.
3. Register the app with a nickname (e.g., "CarbonWise AI").
4. Copy the Firebase configuration values — you'll need these for environment variables:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 1.5 Deploy Firestore Security Rules

The project includes security rules in `firebase/firestore.rules`. Deploy them using the Firebase CLI:

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy security rules
firebase deploy --only firestore:rules
```

These rules ensure all user data is scoped to the authenticated user:

```
allow read, write: if request.auth != null && request.auth.uid == userId;
```

---

## Step 2: Google Gemini API

1. Visit [Google AI Studio](https://aistudio.google.com/apikey).
2. Click **"Create API key"**.
3. Copy the generated API key.

> **⚠️ Important:** This key is used **server-side only** by the Express backend. It is never exposed to the frontend bundle.

---

## Step 3: Environment Configuration

### Local Development

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Google Gemini AI (server-side only)
GEMINI_API_KEY="your_gemini_api_key_here"

# Firebase Configuration (from Step 1.4)
VITE_FIREBASE_API_KEY="your_firebase_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_firebase_app_id"
```

### Production (Vercel)

Environment variables for production are configured in the Vercel dashboard (see [Step 5](#step-5-vercel-deployment)).

---

## Step 4: Local Development

```bash
# Clone the repository
git clone https://github.com/sarawagh27/carbonwise-ai.git
cd carbonwise-ai

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start the development server
npm run dev
```

The full-stack application will start on `http://localhost:3000`. The Express server integrates with Vite's development middleware, providing:

- Hot Module Replacement (HMR) for instant UI updates
- API routes available at `http://localhost:3000/api/*`
- Automatic Gemini AI proxy through the Express backend

### Build for Production

```bash
# Build frontend (Vite) + backend (esbuild)
npm run build

# Start the production server
npm start
```

---

## Step 5: Vercel Deployment

### 5.1 Push to GitHub

Ensure your code is pushed to a GitHub repository:

```bash
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

### 5.2 Import in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Select your `carbonwise-ai` GitHub repository.
4. Vercel should auto-detect the **Vite** framework preset.

### 5.3 Configure Environment Variables

In the Vercel project settings, add all environment variables:

| Variable | Value |
|---|---|
| `GEMINI_API_KEY` | Your Gemini API key |
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project-id.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project-id.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase app ID |

### 5.4 Deploy

Click **"Deploy"**. Vercel will build and deploy automatically.

The deployment uses `vercel.json` routing rules:
- `/api/*` → Serverless Express function
- All other routes → SPA `index.html`

---

## Step 6: Post-Deployment Configuration

### Add Authorized Domain to Firebase

This is **critical** for Google Sign-in to work on your deployed URL:

1. Go to Firebase Console → **Authentication** → **Settings**.
2. Under **Authorized domains**, click **"Add domain"**.
3. Add your Vercel production URL (e.g., `carbonwise-ai-five.vercel.app`).

### Vercel Preview URL Handling

The application includes a built-in redirect in `src/main.tsx` that automatically routes Vercel preview URLs (e.g., `carbonwise-ai-abc123.vercel.app`) to the main production domain. This ensures Firebase Authentication works correctly on all deployment previews without adding each preview URL to Firebase's authorized domains.

---

## Troubleshooting

### Authentication Issues

| Problem | Solution |
|---|---|
| "This domain is not authorized" | Add your domain to Firebase → Authentication → Settings → Authorized domains |
| Google sign-in popup blocked | Allow popups in browser settings for your domain |
| Sign-in popup closes immediately | Clear browser cookies and cache, try incognito mode |
| Preview URL sign-in fails | The app auto-redirects to the main domain — this is expected behavior |

### Gemini API Issues

| Problem | Solution |
|---|---|
| "GEMINI_API_KEY is not configured" | Verify the key is set in `.env.local` (local) or Vercel env vars (production) |
| 429 Rate Limit errors | The app has built-in fallbacks — these activate automatically. Consider upgrading your Gemini API tier. |
| Empty responses from Gemini | Check API key validity at [AI Studio](https://aistudio.google.com/) |

### Firestore Issues

| Problem | Solution |
|---|---|
| "Permission denied" errors | Deploy security rules: `firebase deploy --only firestore:rules` |
| Data not syncing | Verify `VITE_FIREBASE_PROJECT_ID` matches your Firebase project |
| "Client is offline" warning | Non-critical — Firestore will sync when connection is restored |

### Build Issues

| Problem | Solution |
|---|---|
| TypeScript errors | Run `npm run lint` to identify type errors |
| Build fails on Vercel | Ensure all `VITE_*` env vars are set in Vercel dashboard |
| Module not found | Run `npm install` to ensure all dependencies are installed |
