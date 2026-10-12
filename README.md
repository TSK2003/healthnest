# healthnest

A bilingual clinic web application built for **Heal Nest Health Care Clinic** (Theni, Tamil Nadu) with React 19, TypeScript, Vite, Firebase Hosting, Firebase Firestore, NestJS, and MySQL.

---

## 🚀 Features

- **Bilingual Interface**: Seamless English & Tamil language switching with clinic gallery, FAQs, services, opening hours, and location directions.
- **Appointment Request Flow**: Indian mobile number validation (`+91`), clinic operating hour checks, date selection up to 90 days, and consent verification.
- **Firebase Firestore Integration**: Direct serverless storage of patient appointments into Cloud Firestore under `appointments` collection with unique reference IDs (e.g., `HN-XXXXXX`).
- **Full Backend API & MySQL Fallback**: NestJS API with MySQL persistence, duplicate idempotency checks, and persistent email outbox queue.
- **CI/CD with GitHub Actions**: Automatic build, prerendering, and deployment to Firebase Hosting on every push to `main`.
- **Prerendered SEO Optimization**: Prerendered static HTML for instant initial paint and search engine indexing.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
# Start frontend with hot-reload (Vite)
npm run dev:web

# Or run API backend (NestJS)
npm run dev:api
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
# Build frontend, backend, and prerender static HTML
npm run build
```

---

## 🔥 Firebase Configuration

Project ID: `healthnest-e4d23`

The frontend (`apps/web`) is configured with Firebase SDK (v13):
- **Hosting**: Deploys `apps/web/dist` with SPA route rewrites.
- **Firestore**: Stores booking requests in `appointments` collection.
- **Analytics**: Configured for measurement ID `G-DFTK5S0CF8`.

Configured files:
- `firebase.json` – Firebase Hosting & Firestore configuration
- `.firebaserc` – Targets project `healthnest-e4d23`
- `firestore.rules` – Security rules ensuring patient data privacy while allowing booking requests

---

## 🔄 GitHub Actions CI/CD Pipeline

Workflows are located in `.github/workflows/`:
1. **`firebase-deploy.yml`**: Triggers on push to `main` branch:
   - Checks out code
   - Sets up Node.js 22
   - Runs `npm ci`
   - Builds web application (`npm run build -w apps/web`)
   - Prerenders English homepage (`node scripts/prerender.mjs`)
   - Deploys live to Firebase Hosting (`healthnest-e4d23`)
2. **`ci.yml`**: Validates pull requests with lint/build checks.

### Setting up Firebase GitHub Action Deployment
To enable automatic deployment via GitHub Actions:
1. Go to your GitHub repository: [https://github.com/TSK2003/healthnest](https://github.com/TSK2003/healthnest)
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Add a secret named `FIREBASE_SERVICE_ACCOUNT_HEALTHNEST_E4D23`.
4. Paste the Firebase Service Account JSON key (generated from [Firebase Console > Project Settings > Service Accounts](https://console.firebase.google.com/project/healthnest-e4d23/settings/serviceaccounts/adminsdk)).

---

## 📁 Project Structure

```text
├── .github/workflows/       # GitHub Actions CI/CD workflows
│   ├── firebase-deploy.yml  # Automatic Firebase Hosting deployment
│   └── ci.yml               # CI build & verification
├── apps/
│   ├── web/                 # React 19 + TypeScript + Vite frontend
│   │   ├── src/
│   │   │   ├── firebase.ts  # Firebase App, Firestore & Analytics config
│   │   │   ├── App.tsx      # Main application layout
│   │   │   ├── content.ts   # English & Tamil copywriting
│   │   │   └── components/  # Appointment form, Hero, Header, Sections
│   └── api/                 # NestJS + MySQL optional backend
│       └── src/             # Controller, Service, DTO, Repository
├── scripts/
│   ├── prerender.mjs        # Static HTML prerender script for SEO
│   └── export-preview.mjs   # Standalone HTML review generator
├── firebase.json            # Firebase Hosting configuration
├── .firebaserc              # Firebase project settings
└── firestore.rules          # Firestore database security rules
```

---

## 🌐 Remote Repository

- **GitHub Repository**: [https://github.com/TSK2003/healthnest.git](https://github.com/TSK2003/healthnest.git)
- **Branch**: `main`
