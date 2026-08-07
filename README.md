# AgriNova Frontend Application

[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.4-0055FF.svg)](https://framer.com/motion)
[![React Router](https://img.shields.io/badge/React_Router-7.1-CA4245.svg)](https://reactrouter.com/)

AgriNova Frontend is a state-of-the-art agricultural web application designed to empower farmers, agronomists, and farm managers with AI-powered decision support, real-time weather analytics, market intelligence, crop disease diagnostics, smart nutrition planning, and profit modeling.

---

## Table of Contents

- [Implemented Modules](#implemented-modules)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Project Workflow](#project-workflow)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Machine Learning Modules](#machine-learning-modules)
- [Weather Cache](#weather-cache)
- [Market Cache](#market-cache)
- [Fertilizer Planner](#fertilizer-planner)
- [Profit Analysis](#profit-analysis)
- [AI Assistant](#ai-assistant)
- [API Overview](#api-overview)
- [Future Scope](#future-scope)

---

## Implemented Modules

1. **User Authentication & Profile Management (`/login`, `/register`, `/forgot-password`, `/profile`):**
   - JWT-based authentication with secure token storage.
   - OTP-based password reset via email.
   - Profile setup including full name, phone number, language preference, and avatar upload.

2. **Farm Management (`/add-farm`, `/select-farm`, `/farms`):**
   - Multi-step farm creation wizard with OpenStreetMap Nominatim reverse-geocoding.
   - Soil profile configuration, irrigation type, and land area unit specification (Acres, Hectares, Bigha, Gunta, etc.).
   - Multi-farm switching and active farm state management.

3. **Dashboard (`/dashboard`):**
   - Central control hub showing active farm summary, registered land stats, quick action navigation, and farm metrics.

4. **Weather Module (`/weather`):**
   - Real-time weather parameters (temperature, humidity, rainfall, wind speed, pressure, UV index).
   - 7-day forecast breakdown and specialized agricultural weather advisories.

5. **Crop Recommendation (`/crop-recommendation`):**
   - Dual-mode crop advisor (**AI Mode** using soil parameters and **Quick Mode** using regional weather/season rules).
   - Single best crop recommendation or multi-crop comparison.

6. **Yield Prediction (`/yield-prediction`):**
   - Precision harvest volume calculation per area unit and total farm yield.
   - Parameter breakdown with data source badges (Weather Cache, Farm Info, Soil Health Card, Crop Dataset).

7. **Fertilizer Recommendation / Smart Nutrition Planner (`/fertilizers`):**
   - Verified ICAR agronomic deficiency matrix for soil NPK and pH.
   - Strategy plans (Budget, Balanced, Premium) with exact commercial fertilizer product combinations, quantities, and costs.
   - One-click PDF export of customized fertilizer schedules.

8. **Market Intelligence (`/market-intelligence`):**
   - Real-time mandi commodity price feeds, APMC market trends, historical price tracking, and 3-month forecast estimates.

9. **Profit Analysis (`/profit-prediction`):**
   - Complete cultivation economics calculator (Total Investment, Gross Income, Net Profit, ROI %, Profit Margin %, Break-even price).
   - Interactive cost customization modal (seed, fertilizer, labour, irrigation, machinery, other costs).
   - Scenario simulations (Best, Average, Worst case) and financial risk assessment.

10. **Plant Disease Detection (`/disease-detection`):**
    - Leaf image upload with instant AI diagnosis, confidence score, treatment plan (organic & chemical), active ingredients, and government recommendations.

11. **Smart AI Assistant (`/assistant`):**
    - Conversational AI helper providing context-aware agricultural guidance and advice.

12. **Notification Center (`/notifications`):**
    - Agricultural alerts, weather warnings, and farm advisory notifications.

---

## Tech Stack

- **Framework:** React 19, Vite
- **Styling:** Vanilla CSS, Tailwind CSS v4, Glassmorphism design system
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Routing:** React Router DOM v7
- **PDF Generation:** jsPDF with jsPDF-AutoTable

---

## Folder Structure

```
AgriNova-Frontend/
├── public/
├── src/
│   ├── assets/              # Branding assets and icons
│   ├── components/          # Reusable UI components (MainLayout, ProtectedRoute, NotificationBell, etc.)
│   ├── context/             # React Context (AuthContext, FarmContext)
│   ├── pages/               # Page components (Dashboard, CropRecommendation, FertilizerRecommendation, etc.)
│   ├── services/            # API integration modules (api.js, mlService.js, weatherService.js, etc.)
│   ├── utils/               # Helper utilities (areaConverter.js, pdfGenerator.js)
│   ├── App.css
│   ├── App.jsx              # Main routing and landing page configuration
│   ├── index.css            # Base styles and CSS variables
│   └── main.jsx             # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## Project Workflow

```
1. Landing Page (Sign In / Sign Up)
       │
2. Authentication (Login / Register / Forgot Password)
       │
3. Profile Completion & Farm Creation (Add Farm / Select Farm)
       │
4. Main Platform Dashboard (Select active farm context)
       │
   ┌───┴─────────────────┬─────────────────┬─────────────────┐
   ▼                     ▼                     ▼                 ▼
Weather Advisory   Crop Advisor       Yield & Profit      Fertilizer & Disease
```

---

## Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd AgriNova/AgriNova-Frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of `AgriNova-Frontend`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the Django backend API | `http://localhost:8000/api` |

---

## Machine Learning Modules

- **Crop Recommendation Engine:** Evaluates N, P, K, pH, temperature, humidity, rainfall, state, and season using Random Forest and XGBoost classification models.
- **Yield Prediction Model:** Predicts crop yield output per hectare considering environmental inputs and soil characteristics.
- **Market Price Forecasting Model:** Predicts 3-month future commodity market prices based on APMC historical data.
- **Disease Diagnostic Model:** Deep learning leaf image classifier identifying crop diseases with scientific diagnosis and treatment steps.

---

## Weather Cache

- Integrates live meteorological data using Open-Meteo API.
- Caches location weather parameters per farm coordinates to optimize request volume and provide instant environmental metrics for yield & crop models.

---

## Market Cache

- Synchronizes mandi market prices for agricultural commodities.
- Stores historical price records and computes regional min/max/modal prices for crop profit evaluations.

---

## Fertilizer Planner

- Calculates exact NPK nutrient deficits by comparing baseline or laboratory soil health test data against ICAR crop targets.
- Formulates multi-option fertilizer plans (Budget, Balanced, Premium) with exact commercial bag counts and cost estimations.
- Exports custom printable PDF schedule cards.

---

## Profit Analysis

- Full financial calculation model computing operational costs against expected yield and 3-month market prices.
- Supports interactive farmer cost customization and scenario simulations (Best, Average, Worst case).

---

## AI Assistant

- Natural language chat assistant built for farmer queries, crop care tips, and contextual farm management advice.

---

## API Overview

- `POST /api/auth/login/` - Authenticates user.
- `POST /api/auth/register/` - Registers new user account.
- `GET /api/farms/` - Fetches user farms list.
- `POST /api/recommendation/predict/` - Generates crop recommendation.
- `GET /api/recommendation/yield-summary/` - Fetches yield prediction summary.
- `POST /api/fertilizer/recommend/` - Generates smart nutrition plan.
- `POST /api/profit-analysis/` - Computes profit analysis.
- `POST /api/disease/predict/` - Uploads leaf image for disease diagnosis.

---

## Future Scope

- IoT soil sensor integration for real-time telemetry.
- Multi-language localized voice interaction for AI assistant.
- Satellite multispectral crop health imagery (NDVI index).
