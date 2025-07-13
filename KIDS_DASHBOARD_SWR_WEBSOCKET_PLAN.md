# Kids Dashboard SWR + WebSocket Migration Plan

## Overview

This document provides a modular, step-by-step migration plan for the Kids Dashboard, moving from manual refresh/event-driven updates to a hybrid model using SWR for initial data loading and cache management, and WebSocket for real-time updates. Each phase is designed to be small, non-breaking, and independently testable. Progress can be tracked by marking tasks as completed.

---

## Current State Analysis

- Manual refresh via `refreshTrigger` prop and local state
- Event-driven updates using custom EventManager and context
- Scattered data fetching logic, no centralized cache
- User experience: risk of stale data, extra API calls, delayed updates

---

## Target State

- SWR for all initial data fetching and cache management
- WebSocket for live updates, triggering SWR `mutate()`
- Optimistic UI updates with rollback on error
- Consistent, shared state across dashboard components
- Modular migration, no breaking changes

---

## Implementation Phases

### Phase 1: Foundation - SWR & WebSocket Setup

#### Task 1.1: Integrate SWR Library

- [x] **Status**: ✅ Completed
- [x] **Description**: Install and configure SWR for data fetching
- [x] **Files Modified**:
  - `package.json` (add `swr`)
  - `lib/utils/swrConfig.ts` (create global config)
- [x] **Estimated Time**: 30 minutes
- [x] **Breaking Risk**: None

**Details**:

- [x] Install SWR: `npm install swr`
- [x] Create global SWR config for error handling, revalidation, etc.
- [x] Ensure SWR is available throughout the app

#### Task 1.2: WebSocket Client Setup

- [x] **Status**: ✅ Completed
- [x] **Description**: Create reusable WebSocket client for real-time updates
- [x] **Files Created**:
  - `lib/realtime/WebSocketClient.ts`
- [x] **Estimated Time**: 1 hour
- [x] **Breaking Risk**: None

**Details**:

- [x] Implement WebSocket client with subscribe/unsubscribe for event types
- [x] Integrate with EventManager if possible

---

### Phase 2: Kids Dashboard Overview Migration

#### Task 2.1: Refactor Data Fetching to SWR

- [x] **Status**: ✅ Completed (KidDashboardOverview)
- [ ] **Description**: Replace manual data fetching in `KidDashboardOverview` and child components with SWR
- [x] **Files Modified**:
  - `components/dashboard/kid/KidDashboardOverview.tsx`
- [ ] **Files Modified**:
  - `components/dashboard/kid/KidStatCards.tsx`
  - `components/dashboard/kid/KidBarChart.tsx`
  - `components/dashboard/kid/KidPieChart.tsx`
  - `components/dashboard/kid/KidDailyStreaks.tsx`
- [x] **Estimated Time**: 2 hours
- [x] **Breaking Risk**: Low

**Details**:

- [x] Use SWR for stats, charts, streaks, etc. (see `api.ts` for endpoints)
- [x] Remove `refreshTrigger` prop and replace with SWR cache updates

#### Task 2.2: Integrate WebSocket for Live Updates

- [ ] **Status**: ⬜ Pending
- [ ] **Description**: Subscribe to relevant WebSocket events and call SWR `mutate()`
- [ ] **Files Modified**:
  - `KidDashboardOverview.tsx` and child components
- [ ] **Estimated Time**: 1 hour
- [ ] **Breaking Risk**: Low

**Details**:

- On event (e.g., CHORE_UPDATE, WALLET_UPDATE), call SWR `mutate()` for affected keys

---

### Phase 3: Chore Quest Migration

#### Task 3.1: SWR for Chore Data

- [ ] **Status**: ⬜ Pending
- [ ] **Description**: Migrate Chore Quest data fetching to SWR
- [ ] **Files Modified**:
  - `components/dashboard/kid/ChoreQuest.tsx`
- [ ] **Estimated Time**: 1 hour
- [ ] **Breaking Risk**: Low

**Details**:

- Use SWR to fetch chores for the kid (`CHILD_CHORES` endpoint)
- Remove manual refresh logic

#### Task 3.2: WebSocket for Chore Updates

- [ ] **Status**: ⬜ Pending
- [ ] **Description**: Listen for CHORE_UPDATE events and refresh SWR cache
- [ ] **Files Modified**:
  - `ChoreQuest.tsx`
- [ ] **Estimated Time**: 30 minutes
- [ ] **Breaking Risk**: Low

**Details**:

- On CHORE_UPDATE event, call `mutate()` for the chores SWR key

---

### Phase 4: Money Maze Migration

#### Task 4.1: SWR for Money Maze Data

- [ ] **Status**: ⬜ Pending
- [ ] **Description**: Migrate Money Maze data fetching to SWR
- [ ] **Files Modified**:
  - `components/dashboard/kid/MoneyMaze.tsx`
- [ ] **Estimated Time**: 1 hour
- [ ] **Breaking Risk**: Low

**Details**:

- Use SWR to fetch concepts, progress, quizzes (`MONEYMAZE_CONCEPTS`, `MONEYMAZE_CONCEPTS_PROGRESS`, etc.)
- Remove manual refresh logic

#### Task 4.2: WebSocket for Money Maze Updates

- [ ] **Status**: ⬜ Pending
- [ ] **Description**: Listen for MONEYMAZE_UPDATE events and refresh SWR cache
- [ ] **Files Modified**:
  - `MoneyMaze.tsx`
- [ ] **Estimated Time**: 30 minutes
- [ ] **Breaking Risk**: Low

**Details**:

- On MONEYMAZE_UPDATE event, call `mutate()` for the relevant SWR keys

---

### Phase 5: Goal Getter Migration

#### Task 5.1: SWR for Goals Data

- [ ] **Status**: ⬜ Pending
- [ ] **Description**: Migrate Goal Getter data fetching to SWR
- [ ] **Files Modified**:
  - `components/dashboard/kid/GoalGetter.tsx`
- [ ] **Estimated Time**: 1 hour
- [ ] **Breaking Risk**: Low

**Details**:

- Use SWR to fetch goals data (see `api.ts` for endpoint)
- Remove manual refresh logic

#### Task 5.2: WebSocket for Goal Updates

- [ ] **Status**: ⬜ Pending
- [ ] **Description**: Listen for GOAL_UPDATE events and refresh SWR cache
- [ ] **Files Modified**:
  - `GoalGetter.tsx`
- [ ] **Estimated Time**: 30 minutes
- [ ] **Breaking Risk**: Low

**Details**:

- On GOAL_UPDATE event, call `mutate()` for the goals SWR key

---

### Phase 6: Earning Meter Migration

#### Task 6.1: SWR for Earnings Data

- [ ] **Status**: ⬜ Pending
- [ ] **Description**: Migrate Earning Meter data fetching to SWR
- [ ] **Files Modified**:
  - `components/dashboard/kid/EarningMeter.tsx`
- [ ] **Estimated Time**: 1 hour
- [ ] **Breaking Risk**: Low

**Details**:

- Use SWR to fetch earnings data (see `api.ts` for endpoint)
- Remove manual refresh logic

#### Task 6.2: WebSocket for Earnings Updates

- [ ] **Status**: ⬜ Pending
- [ ] **Description**: Listen for WALLET_UPDATE events and refresh SWR cache
- [ ] **Files Modified**:
  - `EarningMeter.tsx`
- [ ] **Estimated Time**: 30 minutes
- [ ] **Breaking Risk**: Low

**Details**:

- On WALLET_UPDATE event, call `mutate()` for the earnings SWR key

---

## API Endpoints Reference

- Use endpoints and helpers from `lib/utils/api.ts` for all SWR fetchers
- Use `buildApiUrl`, `API_ENDPOINTS`, etc. for constructing URLs

---

## Testing Criteria

- [ ] SWR data loads correctly for all dashboard sections
- [ ] WebSocket events trigger instant UI updates via SWR `mutate()`
- [ ] No manual refreshes or `refreshTrigger` props remain
- [ ] No breaking changes to existing functionality
- [ ] All components remain modular and testable
- [ ] Proper error handling and fallback for network issues

---

## Progress Tracking

Mark each task as completed when done. Each phase is independent and testable.

---

## Success Metrics

- Zero manual refreshes needed for data updates
- <100ms UI response time for optimistic updates
- Zero data inconsistency issues
- 100% event delivery reliability
- Instant feedback for all user actions

---

## Risk Mitigation

- Incremental implementation, each phase is independent
- Rollback capability for all changes
- Performance monitoring during implementation
- Comprehensive testing for each task

---

## Getting Started

1. Review current code and data flow
2. Start with Phase 1: SWR and WebSocket setup
3. Test each task for stability
4. Gradually migrate components to real-time updates
5. Monitor performance and user experience

---

Each task should be completed and tested before moving to the next. The app should remain functional at all times during migration.
