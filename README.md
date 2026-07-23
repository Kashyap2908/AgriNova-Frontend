# AgriNova Frontend

AgriNova is a next-generation agricultural SaaS platform built with React, Vite, and TailwindCSS.

## Post-Login Onboarding Workflow

The frontend enforces a strict step-by-step onboarding flow right after user authentication:

```
[Login] ──> [Profile Completion Check] ──> [Add Farm (Multi-step)] ──> [Select Farm] ──> [Simplified Dashboard]
```

### Route & Flow Structure

1. **Authentication (`/login`, `/register`)**:
   - Authenticates user credentials via JWT / session.
2. **Profile Completion (`/complete-profile` / `/profile`)**:
   - Collects personal details only: Full Name, Phone Number, Preferred Language, and Optional Profile Photo.
   - Includes a visual profile progress indicator card.
3. **Multi-Step Farm Registration (`/add-farm`)**:
   - **Step 1:** Farm Information (Name, Land Area, Area Unit).
   - **Step 2:** Location (State, District, Taluka, Village, optional PIN Code) — *No Lat/Lng fields; coordinates resolved asynchronously via OpenStreetMap Nominatim*.
   - **Step 3:** Soil & Irrigation (Soil Type, Irrigation Type, Water Source Reliability).
4. **Farm Selection & Portfolio Management (`/select-farm` / `/manage-farms`)**:
   - Card layout of all user-registered farms.
   - Highlighted active selection badge, with Edit and Delete modal actions.
   - Selecting a farm updates `selectedFarm` in `FarmContext` and redirects to `/dashboard`.
5. **Simplified Dashboard (`/dashboard`)**:
   - Displays Farmer Profile Summary, Active Selected Farm Summary, and Quick Stats.
   - Action buttons to add or switch active farm.
   - *Weather widgets, charts, and AI modules are excluded at this initial stage for future integration.*

## State Management Architecture

- **`AuthContext.jsx`**: Manages user authentication tokens, user profile metadata (`fullName`, `phone`, `language`, `avatar`), and `profileCompleted` status with `localStorage` persistence.
- **`FarmContext.jsx`**: Manages farm array state, active farm selection (`selectedFarm`), and CRUD operations (`addFarm`, `editFarm`, `deleteFarm`, `selectFarm`) with persistent storage.
- **`ProtectedRoute.jsx`**: Route guard that strictly enforces the onboarding progression.
