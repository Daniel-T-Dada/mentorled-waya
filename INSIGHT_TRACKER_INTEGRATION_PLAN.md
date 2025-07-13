# 📊 Insight Tracker Integration Plan

This document outlines a modular, step-by-step plan for integrating the `GET /api/insighttracker/chores/insights/` endpoint into the `/dashboard/parents/insights` page. Each phase is designed to be completed independently, tested, and confirmed before moving to the next. No phase should break the app.

---

## 🎯 Integration Phases

### ✅ **PHASE 1: API Client Setup & Data Fetching**

_Goal: Safely fetch insight data from the backend API._

#### Task 1.1: Add Feature-Specific Endpoint Helper

- [x] **File**: `lib/utils/api.ts`
- [x] **Objective**: Create an `InsightTrackerEndpoints` object for the insights endpoint
- [x] **Expected Impact**: Consistent API endpoint management across the codebase
- [x] **Breaking Risk**: None
- [x] **Steps**:

  1. In `api.ts`, export `InsightTrackerEndpoints` with a method for the insights URL
  2. Use `buildApiUrl(API_ENDPOINTS.INSIGHT_CHORES)` for the endpoint

  ```typescript
  export const InsightTrackerEndpoints = {
    getChoresInsights: () => buildApiUrl(API_ENDPOINTS.INSIGHT_CHORES),
  };
  ```

#### Task 1.2: Implement Authenticated Fetch

- [x] **File**: Wherever the API is called (initially in the insights page/component)
- [x] **Objective**: Use `authFetch` for API calls to include JWT in the `Authorization` header
- [x] **Expected Impact**: Secure and consistent API authentication
- [x] **Breaking Risk**: None
- [x] **Steps**:
  1. Import `authFetch` and `InsightTrackerEndpoints`
  2. Use `authFetch(InsightTrackerEndpoints.getChoresInsights(), { headers: { Authorization: `Bearer <token>` } })` to fetch data

#### Task 1.3: Test API Client (Console Only)

- [x] **File**: Temporary test in `dashboard/parents/insights` page/component
- [x] **Objective**: Console log the fetched data to verify API connectivity
- [x] **Expected Impact**: Confirm API works before UI integration
- [x] **Breaking Risk**: None
- [x] **Steps**:
  1. Import and call the API client in the insights page/component
  2. Log the response to the console

---

### ⏩ **PHASE 2: UI Integration for Statistics**

_Goal: Display top-level statistics (total chores assigned, completed, pending) on the insights page using the insight tracker API response._

#### Task 2.1: Refactor Data Fetching to Page Level

- [x] **File**: `app/dashboard/parents/insights/page.tsx`
- [x] **Objective**: Fetch insight tracker stats once in the page and pass as props to child components
- [x] **Expected Impact**: Prevents redundant API calls, improves performance
- [x] **Breaking Risk**: None
- [x] **Steps**:
  1. Use `authFetch` and `InsightTrackerEndpoints` to fetch stats in the page component
  2. Store stats in local state
  3. Pass stats as props to `InsightTrackerDashboard` and `AppStatCard`

#### Task 2.2: Update Statistics UI to Use Props

- [x] **File**: `components/dashboard/AppStatCard.tsx`
- [x] **Objective**: Use the passed insight tracker stats prop for statistics UI
- [x] **Expected Impact**: Accurate, up-to-date stats from backend
- [x] **Breaking Risk**: None
- [x] **Steps**:
  1. Remove local API fetch for stats in `AppStatCard`
  2. Use the `insightStats` prop for insights page statistics
  3. Test UI and confirm correct data display

#### Task 2.3: Test and Confirm

- [x] **File**: Insights page/component
- [x] **Objective**: Ensure statistics display correctly, no build/lint errors
- [x] **Expected Impact**: Confirmed working before next phase
- [x] **Breaking Risk**: None
- [x] **Steps**:
  1. Run `npm run build` and lint
  2. Review UI and data
  3. Mark as complete after your confirmation

---

### ⏩ **PHASE 3: UI Integration for Kids Activities**

_Goal: Display each child’s activities and earned rewards using the insight tracker API response._

#### Task 3.1: Refactor Kids Activities Data Flow

- [ ] **File**: `components/dashboard/AppKidsActivities.tsx`, `components/dashboard/parent/InsightTrackerDashboard.tsx`
- [ ] **Objective**: Use the `child_activities` from the insight tracker API response for kids activities UI
- [ ] **Expected Impact**: Accurate, up-to-date activities and rewards for each child
- [ ] **Breaking Risk**: None
- [ ] **Steps**:
  1. Pass `child_activities` from `insightStats` prop to `AppKidsActivities` via `InsightTrackerDashboard`
  2. Update `AppKidsActivities` to use this prop instead of fetching its own data
  3. Map and display activities and rewards for each child

#### Task 3.2: Test and Confirm

- [ ] **File**: Insights page/component
- [ ] **Objective**: Ensure kids activities display correctly, no build/lint errors
- [ ] **Expected Impact**: Confirmed working before next phase
- [ ] **Breaking Risk**: None
- [ ] **Steps**:
  1. Run `npm run build` and lint
  2. Review UI and data
  3. Mark as complete after your confirmation

---

## ⏭️ Next Steps

- After each task, run `npm run build` and lint checks.
- Confirm with me before moving to the next phase.
- Once you confirm a phase is working and error-free, I’ll provide the next phase (UI enhancements, charts, etc.).

---

## 📌 Notes

- This plan will be updated and expanded as we progress.
- Each phase is designed to be modular and non-breaking.
- You must confirm each phase before we proceed to the next.

---

Ready for **PHASE 1**. Let me know when you’re ready to begin Task 1.1!
