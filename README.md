# AgriNova Frontend Application

[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC.svg)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.4-0055FF.svg)](https://framer.com/motion)
[![React Router](https://img.shields.io/badge/React_Router-7.1-CA4245.svg)](https://reactrouter.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#license)

AgriNova Frontend is a modern, responsive, and feature-packed web application built with **React 19**, **Vite**, **Tailwind CSS**, and **Framer Motion**. It provides farmers, agricultural consultants, and farm managers with an intuitive, aesthetic dark-themed interface to access AI-driven agronomic recommendations, market price predictions, disease diagnostics, weather advisories, and profit calculators.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Post-Login Onboarding Workflow](#post-login-onboarding-workflow)
- [State Management Architecture](#state-management-architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Screens & Pages](#screens--pages)
- [API Integration](#api-integration)
- [Build Commands](#build-commands)
- [Deployment Notes](#deployment-notes)
- [License & Authors](#license--authors)

---

## Project Overview

AgriNova Frontend empowers farmers by delivering intelligent, data-driven agricultural tools in a streamlined single-page application (SPA). Designed with an aggressive emphasis on user experience, high visual quality, smooth micro-animations, dynamic glassmorphism aesthetics, and mobile responsiveness, AgriNova makes complex agronomic and financial insights easily accessible.

### Key Highlights:
- **Strict Onboarding Workflow:** Ensures every user completes their profile and configures at least one farm before accessing analytical dashboards.
- **Dynamic Context Management:** Global state management for authentication tokens and active farm selection with persistent storage.
- **Interactive Data Visualization:** Embedded charts, interactive Leaflet maps, and real-time calculation widgets.
- **Dark Theme Aesthetics:** Beautiful dark-mode design with glowing subtle accents, Framer Motion transitions, and clean typography.

---

## Features

- **Authentication System:** Secure user login, registration, and OTP-based password recovery.
- **Onboarding & Profile Setup:** User profile completion tracking with visual completion progress indicators.
- **Farm Management:** Multi-step farm registration wizard with automatic geolocation via OpenStreetMap Nominatim, farm switching, and CRUD operations.
- **Interactive Dashboard:** Central hub displaying active farm parameters, quick stats, weather summaries, and module quick-links.
- **Weather Dashboard:** Real-time temperature, humidity, rainfall, 5-day forecasts, and agricultural weather advisories.
- **Crop Recommendation Engine:** AI recommendations predicting top suitable crops based on soil NPK, temperature, humidity, pH, state, and season.
- **Yield Prediction:** Precision estimations of expected crop yields per hectare based on customized environmental parameters.
- **Fertilizer Recommendation:** Soil nutrient deficit analysis paired with dynamic commercial fertilizer matching and application guidance.
- **Market Intelligence:** Live mandi commodity prices, historical price trends, and XGBoost price forecasting.
- **Profit Analysis Calculator:** Interactive financial model estimating total operational costs, gross income, net profit, ROI, and break-even pricing.
- **Plant Disease Diagnosis:** Image upload tool providing AI-based leaf disease diagnosis, treatment suggestions, and visual similarity matching.
- **AI Assistant Chatbot:** Conversational assistant for instant natural-language agricultural advice.
- **System Notifications:** Real-time notification center for farm advisories and operational updates.
- **Responsive & Dark UI:** Optimized for desktop, tablet, and mobile devices with fluid Framer Motion animations.

---

## Post-Login Onboarding Workflow

The frontend enforces a strict step-by-step onboarding flow immediately following user authentication:

```
[Login / Register] ──> [Profile Completion Check] ──> [Add Farm (Multi-step)] ──> [Select Active Farm] ──> [Main Dashboard]
```

### Route & Flow Progression:

1. **Authentication (`/login`, `/register`, `/forgot-password`):**
   - Authenticates user credentials via JWT (Access + Refresh tokens).
2. **Profile Completion (`/complete-profile`, `/profile`):**
   - Collects personal details: Full Name, Phone Number, Preferred Language, and Optional Profile Photo.
   - Displays a visual profile progress indicator card.
3. **Multi-Step Farm Registration (`/add-farm`):**
   - **Step 1: Farm Basic Info** - Name, Land Area, Area Unit (Acres/Hectares).
   - **Step 2: Location Details** - State, District, Taluka, Village, optional PIN Code (*Coordinates resolved asynchronously via OpenStreetMap Nominatim*).
   - **Step 3: Soil & Irrigation** - Soil Type, Irrigation Type, Water Source Reliability.
4. **Farm Selection & Portfolio Management (`/select-farm`, `/manage-farms`):**
   - Card layout of all user-registered farms with active selection badges and edit/delete actions.
   - Selecting a farm updates `selectedFarm` in `FarmContext` and redirects to `/dashboard`.
5. **Main Dashboard (`/dashboard`):**
   - Displays Farmer Profile Summary, Active Selected Farm Summary, Quick Stats, and shortcuts to analytical tools.

---

## State Management Architecture

- **`AuthContext.jsx`:** Manages user authentication tokens, user profile metadata (`fullName`, `phone`, `language`, `avatar`), and `profileCompleted` status with `localStorage` persistence.
- **`FarmContext.jsx`:** Manages the array of registered user farms, active farm selection (`selectedFarm`), and CRUD operations (`addFarm`, `editFarm`, `deleteFarm`, `selectFarm`) with persistent storage.
- **`ProtectedRoute.jsx`:** Route guard that strictly enforces authentication state and onboarding completion before granting access to protected pages.

---

## Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite 8](https://vitejs.dev/)
- **Routing:** [React Router DOM 7](https://reactrouter.com/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) & Vanilla CSS
- **Animations:** [Framer Motion 12](https://framer.com/motion)
- **HTTP Client:** [Axios 1.18](https://axios-http.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Maps:** [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Charts & Graphs:** [Chart.js](https://www.chartjs.org/) & [React ChartJS 2](https://react-chartjs-2.js.org/)
- **Markdown Rendering:** [React Markdown](https://github.com/remarkjs/react-markdown) & `remark-gfm`
- **Linter:** [Oxlint](https://oxc.rs/docs/tools/oxlint.html)

---

## Folder Structure

```
AgriNova-Frontend/
├── public/                    # Static public assets (favicon, images)
├── src/
│   ├── assets/                # Icons, logos, and illustrative graphics
│   ├── components/            # Reusable UI components
│   │   ├── Navbar.jsx         # Navigation bar with farm switcher & user menu
│   │   ├── Sidebar.jsx        # Dashboard side navigation menu
│   │   ├── ProtectedRoute.jsx # Authentication & onboarding guard
│   │   ├── FarmCard.jsx       # Farm portfolio display card
│   │   └── WeatherWidget.jsx  # Compact weather summary card
│   ├── context/               # React Context Providers
│   │   ├── AuthContext.jsx    # User authentication & profile state
│   │   └── FarmContext.jsx    # Active farm selection & farm portfolio state
│   ├── pages/                 # Main Application Screen Views
│   │   ├── Login.jsx          # User login screen
│   │   ├── Register.jsx       # New user account registration
│   │   ├── ForgotPassword.jsx # Password reset via OTP email verification
│   │   ├── Profile.jsx        # User profile view & editor
│   │   ├── AddFarm.jsx        # Multi-step farm creation wizard
│   │   ├── SelectFarm.jsx     # Farm selection & portfolio management
│   │   ├── Dashboard.jsx      # Central overview & farmer portal
│   │   ├── Weather.jsx        # Detailed weather dashboard & advisories
│   │   ├── CropRecommendation.jsx # Crop suitability form & predictor
│   │   ├── RecommendationResult.jsx # Recommended crops & confidence scores
│   │   ├── RecommendationHistory.jsx# Saved recommendation logs
│   │   ├── YieldPrediction.jsx# Crop yield estimation calculator
│   │   ├── FertilizerRecommendation.jsx # NPK deficit & fertilizer matching
│   │   ├── MarketIntelligence.jsx   # Live mandi prices & trend predictor
│   │   ├── MarketIntelligenceHistory.jsx # Historical mandi price archives
│   │   ├── ProfitAnalysis.jsx # Farm financial ROI & profit calculator
│   │   ├── DiseaseDetection.jsx # Leaf image uploading & disease diagnosis
│   │   ├── AIAssistant.jsx    # Interactive AI Chatbot interface
│   │   └── NotificationsPage.jsx # System alerts & farm notification feed
│   ├── services/              # API Client & Services
│   │   ├── api.js             # Centralized Axios client with JWT interceptors
│   │   ├── mlService.js       # ML model endpoint service wrappers
│   │   ├── weatherService.js  # Weather API service wrappers
│   │   └── assistantService.js# AI Chatbot endpoint service wrappers
│   ├── App.jsx                # Main application route configurations
│   ├── App.css                # Custom global styling rules
│   ├── index.css              # Tailwind CSS imports & theme utilities
│   └── main.jsx               # Application entry point
├── .env                       # Frontend environment configuration
├── index.html                 # Main HTML template
├── package.json               # Frontend dependencies & npm scripts
└── vite.config.js             # Vite development server configuration
```

---

## Installation & Setup

### Prerequisites
- **Node.js 18.0** or higher
- **npm** or **yarn**

### Setup Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-organization/AgriNova.git
   cd AgriNova/AgriNova-Frontend
   ```

2. **Install Node Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `AgriNova-Frontend` root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

The application will be running at: `http://localhost:5173/`

---

## Environment Variables

| Variable Name | Description | Default / Example Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL pointing to the AgriNova Django REST Backend | `http://localhost:8000/api` |

---

## Screens & Pages

| Screen / Page | Route | Description |
| :--- | :--- | :--- |
| **Login** | `/login` | User authentication interface with token persistence. |
| **Register** | `/register` | User sign-up form with input validation. |
| **Forgot Password** | `/forgot-password` | Password recovery screen triggering email OTP validation. |
| **Profile** | `/profile` | Profile view, completion progress, and personal detail updating. |
| **Add Farm** | `/add-farm` | 3-step farm creation wizard with reverse geocoding. |
| **Select Farm** | `/select-farm` | Farm portfolio manager allowing active farm switching and CRUD. |
| **Dashboard** | `/dashboard` | Central portal showing profile summary, active farm stats, and quick links. |
| **Weather** | `/weather` | Interactive weather dashboard with forecast cards and farm advisories. |
| **Crop Recommendation**| `/recommend-crop` | AI form recommending top crops based on soil and weather inputs. |
| **Yield Prediction** | `/predict-yield` | Yield calculator predicting output per hectare for selected crops. |
| **Fertilizer Recommendation** | `/fertilizer` | Deficit calculator generating tailored fertilizer application plans. |
| **Market Intelligence**| `/market-prices` | Mandi prices, historical commodity charts, and price forecasting. |
| **Profit Analysis** | `/profit-analysis` | Financial calculator estimating income, costs, profit margins, and break-even points. |
| **Disease Detection** | `/disease-detection`| Image scanner identifying plant diseases and recommending treatments. |
| **AI Assistant** | `/ai-assistant` | AI-powered chatbot offering conversational agricultural assistance. |
| **Notifications** | `/notifications` | Notification center displaying alerts and farm recommendations. |

---

## API Integration

The frontend uses a centralized Axios client (`src/services/api.js`) configured to communicate with the Django REST API:

- **JWT Interceptor:** Requests automatically attach the stored `access_token` in the `Authorization: Bearer <token>` header.
- **Automatic Token Refresh:** If an API endpoint returns a `401 Unauthorized` status code, the interceptor attempts to refresh the access token using the stored `refresh_token` and retries the original request seamlessly.
- **Response Error Handling:** Standardized error handling converts API error responses into readable user notifications.

---

## Build Commands

- **Development Server:**
  ```bash
  npm run dev
  ```
- **Production Build:**
  ```bash
  npm run build
  ```
- **Preview Production Build:**
  ```bash
  npm run preview
  ```
- **Code Linting:**
  ```bash
  npm run lint
  ```

---

## Deployment Notes

### Production Deployment (Vercel / Netlify / Nginx)

1. **Environment Setup:** Ensure the production `VITE_API_BASE_URL` environment variable is set in your hosting provider's settings pointing to the deployed Django backend (e.g., `https://api.yourdomain.com/api`).
2. **Build Generation:** Execute `npm run build` to output optimized static assets into the `dist/` directory.
3. **Single Page Application Routing:** Configure single-page application rewriting rules on your web server (e.g. redirecting all routes to `index.html`) so React Router DOM can handle client-side routing.

---

## License & Authors

### License
This project is licensed under the **MIT License** - see the `LICENSE` file for details.

### Author
Developed with ❤️ by the **AgriNova Frontend Engineering Team**.
