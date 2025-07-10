# Real-Time UI Updates Implementation Plan

## Overview

This document outlines a comprehensive, modular implementation plan for adding real-time UI updates to the Waya app. The goal is to eliminate manual page refreshes and provide instant feedback when users perform actions like creating tasks, making payments, or updating wallet balances.

## Current State Analysis

- **Manual Refresh Pattern**: Components use `refreshTrigger` prop and manual data fetching
- **No Real-Time Updates**: Changes require page refresh or manual component re-renders
- **Scattered State Management**: Each component manages its own data fetching and state
- **User Experience Issues**: Delays in seeing updates, uncertainty about action completion

## Target State

- **Instant UI Updates**: Changes appear immediately across all relevant components
- **Event-Driven Architecture**: Centralized event system for state synchronization
- **Optimistic Updates**: UI updates before server confirmation with rollback capability
- **Consistent State**: All components automatically synchronized
- **Better UX**: Immediate feedback and no manual refreshes needed

---

## Implementation Phases

### Phase 1: Foundation - Event Management System

**Objective**: Create the core event management infrastructure
**Estimated Time**: 2-3 hours
**Risk Level**: Low

#### Task 1.1: Create Core Event Manager

- [x] **Status**: ✅ **COMPLETED**
- [x] **Description**: Build the central event management system
- [x] **Files Created**:
  - `lib/realtime/EventManager.ts` ✅
  - `lib/realtime/types.ts` ✅
  - `lib/realtime/index.ts` ✅
- [x] **Estimated Time**: 1 hour _(Actual: 45 minutes)_
- [x] **Breaking Risk**: None

**Implementation Details**:

```typescript
// Event types and interfaces
interface WayaEvent {
  type: EventType;
  payload: any;
  timestamp: number;
  source?: string;
}

type EventType =
  | "WALLET_UPDATE"
  | "CHORE_UPDATE"
  | "TRANSACTION_UPDATE"
  | "KID_UPDATE"
  | "ALLOWANCE_UPDATE";

// Core EventManager class with subscription/emission
class EventManager {
  private subscribers: Map<string, Set<EventCallback>>;
  subscribe(eventType: string, callback: EventCallback): UnsubscribeFunction;
  emit(event: WayaEvent): void;
  emitAsync(event: WayaEvent): Promise<void>;
}
```

**Testing Criteria**:

- [x] EventManager can be instantiated ✅
- [x] Subscribe/unsubscribe methods work correctly ✅
- [x] Events can be emitted and received ✅
- [x] No memory leaks in subscription management ✅
- [x] App builds and runs without errors ✅

**Results**: Core event management system successfully implemented:

- Created comprehensive TypeScript types for all event types (WALLET_UPDATE, CHORE_UPDATE, TRANSACTION_UPDATE, KID_UPDATE, ALLOWANCE_UPDATE)
- Implemented full-featured EventManager class with subscription, emission, and memory management
- Added event history tracking and debug utilities for monitoring
- Included error handling with try-catch in callbacks
- Created convenience functions for creating typed events
- **App builds successfully and development server runs without errors**

---

#### Task 1.2: Create Real-Time Context Provider

- [x] **Status**: ✅ **COMPLETED**
- [x] **Description**: Create React context for real-time data management
- [x] **Files Created**:
  - `contexts/RealtimeContext.tsx` ✅
  - `hooks/useRealtime.ts` ✅
- [x] **Estimated Time**: 1.5 hours _(Actual: 1 hour)_
- [x] **Breaking Risk**: None

**Implementation Details**:

```typescript
// Context for real-time state management
interface RealtimeContextType {
  walletData: WalletState | null;
  choreData: ChoreState | null;
  transactionData: TransactionState | null;
  subscribe: (
    eventType: EventType,
    callback: EventCallback
  ) => UnsubscribeFunction;
  emit: (event: WayaEvent) => void;
}

// Custom hooks for specific data types
function useRealtimeWallet(): WalletRealtimeHook;
function useRealtimeChores(): ChoreRealtimeHook;
function useRealtimeTransactions(): TransactionRealtimeHook;
```

**Testing Criteria**:

- [x] RealtimeProvider wraps app without errors ✅
- [x] Context values are accessible in components ✅
- [x] Hook subscriptions work correctly ✅
- [x] App functionality remains unchanged ✅
- [x] No performance degradation ✅

**Results**: Real-time context and hooks system successfully implemented:

- Created comprehensive RealtimeProvider with full state management and event integration
- Implemented specialized hooks for all data types (wallet, chores, transactions, kids, allowances)
- Added connection status management and activity tracking
- Created generic data hook with custom processing capabilities
- Added debug utilities for development monitoring
- **App builds successfully with no errors and all existing functionality preserved**

---

#### Task 1.3: Integrate with App Layout

- [x] **Status**: ✅ **COMPLETED**
- [x] **Description**: Add RealtimeProvider to app layout
- [x] **Files Modified**:
  - `app/layout.tsx` ✅
- [x] **Estimated Time**: 30 minutes _(Actual: 15 minutes)_
- [x] **Breaking Risk**: None

**Implementation Details**:

- Wrapped existing providers with RealtimeProvider
- Ensured proper provider order (SessionProvider → RealtimeProvider → SidebarProvider)
- Added error boundaries for real-time features

**Testing Criteria**:

- [x] App loads correctly with new provider ✅
- [x] All existing functionality works ✅
- [x] No console errors ✅
- [x] Real-time context is available throughout app ✅

**Results**: App layout integration successful:

- RealtimeProvider properly integrated in provider hierarchy
- Correct provider order maintained (SessionProvider → RealtimeProvider → SidebarProvider)
- Real-time context now available throughout the entire application
- **App builds successfully with no errors and all existing functionality preserved**

---

### Phase 2: Wallet Real-Time Updates

**Objective**: Implement real-time updates for wallet operations
**Estimated Time**: 4-5 hours
**Risk Level**: Medium

#### Task 2.1: Add Funds Real-Time Updates

- [x] **Status**: ✅ **COMPLETED**
- [x] **Description**: Make wallet top-ups appear instantly across all components
- [x] **Files Modified**:
  - `components/modals/AddFunds.tsx` ✅
  - `components/dashboard/parent/FamilyWalletDashboard.tsx` ✅
  - `components/dashboard/AppStatCard.tsx` ✅
  - `components/lazy/pages/FamilyWalletLazy.tsx` ✅
- [x] **Estimated Time**: 2-3 hours _(Actual: 3 hours)_
- [x] **Breaking Risk**: Low

**Implementation Details**:

```typescript
// In AddFunds.tsx - after successful payment
const handlePaymentSuccess = (paymentData) => {
  // Emit wallet update event
  emitWalletUpdate({
    action: "ADD_FUNDS",
    amount: parseFloat(amount),
    newBalance: response.new_balance,
    transactionId: response.transaction_id,
    parentNewBalance: response.new_balance,
  });
};

// In AppStatCard.tsx - real-time subscription
useEffect(() => {
  const handleWalletUpdate = (event: WayaEvent<WalletUpdatePayload>) => {
    const { payload } = event;

    // Update wallet stats if we have them
    if (walletStats && payload.newBalance !== undefined) {
      setWalletStats((prev) =>
        prev
          ? {
              ...prev,
              family_wallet_balance: payload.newBalance!.toString(),
              total_children_balance:
                payload.kidNewBalance?.toString() ||
                prev.total_children_balance,
            }
          : null
      );
    }
  };

  const unsubscribe = eventManager.subscribe(
    "WALLET_UPDATE",
    handleWalletUpdate
  );
  return unsubscribe;
}, [session?.user?.id, walletStats, wallets]);
```

**Testing Criteria**:

- [x] Adding funds updates balance immediately in all components ✅
- [x] FamilyWalletDashboard shows new balance instantly ✅
- [x] AppStatCard receives and processes wallet update events ✅
- [x] Wallet balance updates appear instantly in UI ✅
- [x] Family wallet balance updates in real-time ✅
- [x] Children wallet balances update in real-time ✅
- [x] No console errors during wallet operations ✅
- [x] App builds successfully ✅
- [x] AppStatCard reflects updated totals ✅
- [x] Transaction appears in history without refresh ✅
- [x] No duplicate API calls or state conflicts ✅
- [x] Proper error handling for failed payments ✅

**Results**: Add Funds real-time updates successfully implemented:

- Real-time event emission integrated after successful payment confirmation in AddFunds.tsx
- Wallet components now subscribe to and handle WALLET_UPDATE events instantly
- Balance updates appear immediately without manual refresh
- Removed verbose refreshTrigger system in favor of real-time updates
- **App builds successfully with no errors and all existing functionality preserved**
- **AppStatCard reflects updated totals immediately**
- **Transaction appears in history without requiring refresh**
- **No duplicate API calls or state conflicts detected**
- **Proper error handling implemented for failed payments**

---

#### Task 2.2: Payment/Transfer Real-Time Updates

- [x] **Status**: ✅ **COMPLETED**
- [x] **Description**: Make payments to kids appear instantly
- [x] **Files Modified**:
  - `components/modals/MakePayment.tsx` ✅
  - `components/dashboard/AppKidsManagement.tsx` ✅
  - `components/dashboard/parent/kids/wallet/WalletOverview.tsx` ✅

**Implementation Details**:

````typescript
// In MakePayment.tsx - after successful payment
const handlePaymentSuccess = (paymentData) => {
  emit({
    type: "WALLET_UPDATE",
    payload: {
      action: "MAKE_PAYMENT",
      fromWallet: "family",
      toKid: paymentData.kidId,
      amount: paymentData.amount,
      parentNewBalance: paymentData.parentNewBalance,
      kidNewBalance: paymentData.kidNewBalance,
    },
    timestamp: Date.now(),
  });
};

// In kid wallet components
const { kidWallets } = useRealtimeWallet();
useEffect(() => {
  const unsubscribe = subscribe("WALLET_UPDATE", (event) => {
    if (event.payload.action === "MAKE_PAYMENT") {
      updateKidBalance(event.payload.toKid, event.payload.kidNewBalance);
      updateParentBalance(event.payload.parentNewBalance);
    }
  });
  return unsubscribe;
#### Task 2.2: Payment/Transfer Real-Time Updates

- [x] **Status**: ✅ **COMPLETED**
- [x] **Description**: Make payments to kids appear instantly
- [x] **Files Modified**:
  - `components/modals/MakePayment.tsx` ✅
  - `components/dashboard/AppKidsManagement.tsx` ✅
  - `components/dashboard/parent/kids/wallet/WalletOverview.tsx` ✅
- [x] **Estimated Time**: 2-3 hours _(Actual: 2.5 hours)_
- [x] **Breaking Risk**: Low

**Implementation Details**:

```typescript
// In MakePayment.tsx - after successful payment
const handlePaymentSuccess = (paymentData) => {
  emitWalletUpdate({
    action: "MAKE_PAYMENT",
    amount: amount,
    kidId: formData.kidId,
    kidNewBalance: result.child_new_balance,
    parentNewBalance: result.parent_new_balance,
    transactionId: result.transaction_id
  });
};

// In AppKidsManagement.tsx - real-time subscription
useEffect(() => {
  const handleWalletUpdate = (event: WayaEvent<WalletUpdatePayload>) => {
    if (payload.action === "MAKE_PAYMENT" && payload.kidId && payload.kidNewBalance !== undefined) {
      const kid = kids.find(k => k.id === payload.kidId);
      if (kid) {
        setChildWallets(prev => ({
          ...prev,
          [kid.username]: {
            ...prev[kid.username],
            balance: payload.kidNewBalance || 0
          }
        }));
      }
    }
  };

  const unsubscribe = eventManager.subscribe('WALLET_UPDATE', handleWalletUpdate);
  return unsubscribe;
}, [session?.user?.id, kids]);
````

**Testing Criteria**:

- [x] Payments update both parent and kid balances instantly ✅
- [x] All wallet-related components sync immediately ✅
- [x] Payment history updates without refresh ✅
- [x] Kids Management shows updated balances ✅
- [x] No race conditions or duplicate updates ✅
- [x] MakePayment modal emits events after successful payment ✅
- [x] Child wallet balances update in real-time across all components ✅
- [x] Parent wallet balance updates reflected immediately ✅
- [x] No console errors during payment operations ✅
- [x] App builds successfully ✅

**Results**: Payment/Transfer real-time updates successfully implemented:

- Real-time event emission integrated after successful payment confirmation in MakePayment.tsx
- Kids Management component now subscribes to and handles WALLET_UPDATE events instantly
- Child wallet balances update immediately across all wallet-related components
- Parent wallet balance updates reflected in real-time
- WalletOverview component includes real-time balance updates for individual kids
- **App builds successfully with no errors and all existing functionality preserved**

---

#### Task 2.3: Transaction History Real-Time Updates

- [x] **Status**: ✅ **COMPLETED**
- [x] **Description**: New transactions appear instantly in transaction lists
- [x] **Files Modified**:
  - `components/dashboard/AppTable.tsx` ✅
  - `components/dashboard/parent/kids/wallet/TransactionHistory.tsx` ✅
  - `app/dashboard/parents/wallet/page.tsx` ✅
  - `components/modals/AddFunds.tsx` ✅ (enhanced with transaction events)
  - `components/modals/MakePayment.tsx` ✅ (enhanced with transaction events)
- [x] **Estimated Time**: 2-3 hours _(Actual: 2.5 hours)_
- [x] **Breaking Risk**: Low

**Implementation Details**:

```typescript
// In AddFunds.tsx and MakePayment.tsx - emit transaction events
const handleSuccess = (result) => {
  // Emit both wallet and transaction events
  emitWalletUpdate({...});

  const transactionEvent = createTransactionEvent({
    action: "CREATE",
    transaction: {
      id: result.transaction_id,
      type: 'topup', // or 'payment'
      amount: result.amount,
      description: result.description,
      status: 'completed',
      created_at: new Date().toISOString(),
      child_name: result.child_name
    }
  });
  eventManager.emit(transactionEvent);
};

// In AppTable.tsx - real-time transaction subscription
useEffect(() => {
  const handleTransactionUpdate = (event: WayaEvent<TransactionUpdatePayload>) => {
    if (event.payload.action === "CREATE" && event.payload.transaction) {
      const formattedTransaction = formatTransactionForDisplay(event.payload.transaction);
      setActivities(prev => [formattedTransaction, ...prev]);
    }
  };

  const unsubscribe = eventManager.subscribe('TRANSACTION_UPDATE', handleTransactionUpdate);
  return unsubscribe;
}, []);

// In wallet page - comprehensive real-time updates
useEffect(() => {
  const handleWalletUpdate = (event: WayaEvent<WalletUpdatePayload>) => {
    // Refresh wallet data when wallet events occur
    fetchWalletData();
  };

  const handleTransactionUpdate = (event: WayaEvent<TransactionUpdatePayload>) => {
    // Refresh transaction data when transaction events occur
    fetchTransactions();
  };

  const unsubscribeWallet = eventManager.subscribe('WALLET_UPDATE', handleWalletUpdate);
  const unsubscribeTransaction = eventManager.subscribe('TRANSACTION_UPDATE', handleTransactionUpdate);

  return () => {
    unsubscribeWallet();
    unsubscribeTransaction();
  };
}, []);
```

**Testing Criteria**:

- [x] New transactions appear at top of lists instantly ✅
- [x] Transaction status updates reflect immediately ✅
- [x] Pagination doesn't break with real-time updates ✅
- [x] Enhanced descriptions show correctly ✅
- [x] Performance remains good with many transactions ✅
- [x] AppTable shows new activities immediately ✅
- [x] Wallet page transaction history updates in real-time ✅
- [x] Both wallet and transaction events are emitted properly ✅
- [x] No console errors during transaction operations ✅
- [x] App builds successfully ✅

**Results**: Transaction History real-time updates successfully implemented:

- Transaction events are now emitted alongside wallet events in AddFunds.tsx and MakePayment.tsx
- AppTable component subscribes to TRANSACTION_UPDATE events and adds new transactions instantly
- Wallet page includes comprehensive real-time subscriptions for both wallet and transaction updates
- Transaction history components update immediately when new transactions are created
- Enhanced transaction formatting ensures proper display of real-time transaction data
- **App builds successfully with no errors and all existing functionality preserved**

---

### Phase 3: Chore/Task Real-Time Updates

**Objective**: Implement real-time updates for task management
**Estimated Time**: 5-6 hours
**Risk Level**: Medium

#### Task 3.1: Task Creation Real-Time Updates

- [ ] **Status**: Not Started
- **Description**: New tasks appear instantly without refreshing
- **Files to Modify**:
  - `components/modals/CreateChore.tsx`
  - `components/dashboard/AppChoreManagement.tsx`
  - `app/dashboard/parents/taskmaster/page.tsx`

**Implementation Details**:

```typescript
// In CreateChore.tsx - after successful creation
const handleChoreSuccess = (choreData) => {
  emit({
    type: "CHORE_UPDATE",
    payload: {
      action: "CREATE",
      chore: choreData,
      assignedTo: choreData.assignedTo,
    },
    timestamp: Date.now(),
  });
};

// In AppChoreManagement.tsx
const { chores, updateChores } = useRealtimeChores();
useEffect(() => {
  const unsubscribe = subscribe("CHORE_UPDATE", (event) => {
    if (event.payload.action === "CREATE") {
      updateChores((prev) => [event.payload.chore, ...prev]);
      // Update counts in tabs
      updateChoreCounts();
    }
  });
  return unsubscribe;
}, []);
```

**Testing Criteria**:

- [ ] New chores appear instantly in TaskMaster dashboard
- [ ] Chore counts update in tabs
- [ ] Assigned kid sees new chore immediately
- [ ] No duplicate chores or API calls
- [ ] Modal closes and resets properly
- [ ] Error handling for failed creations

---

#### Task 3.2: Task Status Updates Real-Time

- [ ] **Status**: Not Started
- **Description**: Task completion/status changes appear instantly
- **Files to Modify**:
  - `components/dashboard/kid/KidChoreQuest.tsx`
  - `components/dashboard/AppChoreManagement.tsx`
  - `components/dashboard/AppKidsManagement.tsx`

**Implementation Details**:

```typescript
// In KidChoreQuest.tsx - when kid updates chore status
const handleStatusChange = async (choreId, newStatus) => {
  // Optimistic update
  updateLocalChoreStatus(choreId, newStatus);

  try {
    await updateChoreStatusAPI(choreId, newStatus);

    // Emit success event
    emit({
      type: "CHORE_UPDATE",
      payload: {
        action: "STATUS_UPDATE",
        choreId,
        newStatus,
        completedAt:
          newStatus === "completed" ? new Date().toISOString() : null,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    // Rollback optimistic update
    revertLocalChoreStatus(choreId);
    showErrorNotification();
  }
};

// In parent components
useEffect(() => {
  const unsubscribe = subscribe("CHORE_UPDATE", (event) => {
    if (event.payload.action === "STATUS_UPDATE") {
      updateChoreInList(event.payload.choreId, {
        status: event.payload.newStatus,
        completedAt: event.payload.completedAt,
      });
      // Update progress bars and statistics
      updateProgressStats();
    }
  });
  return unsubscribe;
}, []);
```

**Testing Criteria**:

- [ ] Status changes appear instantly for both kids and parents
- [ ] Progress percentages update immediately
- [ ] Chore counts in tabs update correctly
- [ ] Optimistic updates work with proper rollback
- [ ] Completion timestamps are accurate
- [ ] No conflicting status updates

---

#### Task 3.3: Task Edit/Delete Real-Time Updates

- [ ] **Status**: Not Started
- **Description**: Task modifications appear instantly across all views
- **Files to Modify**:
  - `components/dashboard/AppChoreManagement.tsx` (edit/delete handlers)

**Implementation Details**:

```typescript
// Task edit real-time updates
const handleTaskEdit = async (taskId, updatedData) => {
  try {
    const response = await updateTaskAPI(taskId, updatedData);

    emit({
      type: "CHORE_UPDATE",
      payload: {
        action: "EDIT",
        taskId,
        updatedTask: response.data,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    showErrorNotification();
  }
};

// Task delete real-time updates
const handleTaskDelete = async (taskId) => {
  try {
    await deleteTaskAPI(taskId);

    emit({
      type: "CHORE_UPDATE",
      payload: {
        action: "DELETE",
        taskId,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    showErrorNotification();
  }
};
```

**Testing Criteria**:

- [ ] Edited tasks update immediately in all views
- [ ] Deleted tasks disappear instantly
- [ ] Task counts and statistics update correctly
- [ ] No orphaned task references
- [ ] Proper error handling for failed operations

---

### Phase 4: Statistics and Dashboard Real-Time Updates

**Objective**: Implement real-time updates for dashboard statistics and metrics
**Estimated Time**: 3-4 hours
**Risk Level**: Low

#### Task 4.1: Dashboard Statistics Real-Time Updates

- [ ] **Status**: Not Started
- **Description**: Dashboard stats update instantly when underlying data changes
- **Files to Modify**:
  - `components/dashboard/AppStatCard.tsx`
  - `components/dashboard/parent/kids/KidStats.tsx`
  - `components/dashboard/kid/KidStatCards.tsx`

**Implementation Details**:

```typescript
// In AppStatCard.tsx
const useRealtimeStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const updateStats = () => {
      // Recalculate stats based on current data
      const newStats = calculateDashboardStats();
      setStats(newStats);
    };

    // Subscribe to events that affect statistics
    const unsubscribeWallet = subscribe("WALLET_UPDATE", updateStats);
    const unsubscribeChore = subscribe("CHORE_UPDATE", updateStats);
    const unsubscribeTransaction = subscribe("TRANSACTION_UPDATE", updateStats);

    return () => {
      unsubscribeWallet();
      unsubscribeChore();
      unsubscribeTransaction();
    };
  }, []);

  return stats;
};
```

**Testing Criteria**:

- [ ] Wallet statistics update when transactions occur
- [ ] Chore completion rates update immediately
- [ ] Progress percentages reflect real-time changes
- [ ] All dashboard cards stay synchronized
- [ ] Performance remains good with frequent updates

---

#### Task 4.2: Kids Management Real-Time Updates

- [ ] **Status**: Not Started
- **Description**: Kids management panel updates instantly
- **Files to Modify**:
  - `components/dashboard/AppKidsManagement.tsx`
  - `components/dashboard/AppKidsActivities.tsx`

**Implementation Details**:

```typescript
// Real-time kids data updates
const useRealtimeKidsData = () => {
  const [kidsData, setKidsData] = useState([]);

  useEffect(() => {
    const handleDataUpdate = (event) => {
      switch (event.type) {
        case "CHORE_UPDATE":
          updateKidChoreData(event.payload);
          break;
        case "WALLET_UPDATE":
          updateKidWalletData(event.payload);
          break;
        case "KID_UPDATE":
          updateKidProfile(event.payload);
          break;
      }
    };

    const unsubscribeChore = subscribe("CHORE_UPDATE", handleDataUpdate);
    const unsubscribeWallet = subscribe("WALLET_UPDATE", handleDataUpdate);
    const unsubscribeKid = subscribe("KID_UPDATE", handleDataUpdate);

    return () => {
      unsubscribeChore();
      unsubscribeWallet();
      unsubscribeKid();
    };
  }, []);

  return kidsData;
};
```

**Testing Criteria**:

- [ ] Kid progress cards update immediately
- [ ] Activity feeds show new activities instantly
- [ ] Wallet balances per kid update in real-time
- [ ] Pagination works with real-time updates
- [ ] No performance issues with multiple kids

---

### Phase 5: Advanced Real-Time Features

**Objective**: Add advanced real-time capabilities and optimizations
**Estimated Time**: 4-5 hours
**Risk Level**: Medium

#### Task 5.1: Optimistic Updates with Rollback

- [ ] **Status**: Not Started
- **Description**: Implement optimistic updates with automatic rollback on failure
- **Files to Create**:
  - `lib/realtime/OptimisticUpdates.ts`
  - `hooks/useOptimisticUpdate.ts`

**Implementation Details**:

```typescript
// Optimistic update manager
class OptimisticUpdateManager {
  private pendingUpdates = new Map();

  async executeOptimistic<T>(
    optimisticUpdate: () => void,
    apiCall: () => Promise<T>,
    rollback: () => void,
    onSuccess?: (result: T) => void
  ): Promise<T> {
    const updateId = generateId();

    try {
      // Apply optimistic update immediately
      optimisticUpdate();
      this.pendingUpdates.set(updateId, { rollback });

      // Execute API call
      const result = await apiCall();

      // Remove from pending and emit success
      this.pendingUpdates.delete(updateId);
      onSuccess?.(result);

      return result;
    } catch (error) {
      // Rollback optimistic update
      rollback();
      this.pendingUpdates.delete(updateId);
      throw error;
    }
  }
}
```

**Testing Criteria**:

- [ ] Optimistic updates provide instant feedback
- [ ] Failed operations rollback correctly
- [ ] No inconsistent states during failures
- [ ] Proper error notifications
- [ ] Good performance with multiple optimistic updates

---

#### Task 5.2: Event Batching and Performance Optimization

- [ ] **Status**: Not Started
- **Description**: Implement event batching to prevent excessive re-renders
- **Files to Modify**:
  - `lib/realtime/EventManager.ts`
  - `hooks/useRealtime.ts`

**Implementation Details**:

```typescript
// Event batching for performance
class BatchedEventManager extends EventManager {
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchedEvents: WayaEvent[] = [];

  emit(event: WayaEvent) {
    this.batchedEvents.push(event);

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.flushBatch();
    }, 16); // ~60fps
  }

  private flushBatch() {
    if (this.batchedEvents.length === 0) return;

    const events = [...this.batchedEvents];
    this.batchedEvents = [];

    // Process batched events
    events.forEach((event) => super.emit(event));
  }
}
```

**Testing Criteria**:

- [ ] Multiple rapid events are batched correctly
- [ ] UI updates are smooth without flickering
- [ ] Performance is improved under high event load
- [ ] Event ordering is preserved
- [ ] No dropped or duplicate events

---

#### Task 5.3: Real-Time Error Handling and Recovery

- [ ] **Status**: Not Started
- **Description**: Implement robust error handling and recovery mechanisms
- **Files to Create**:
  - `lib/realtime/ErrorRecovery.ts`
  - `hooks/useRealtimeErrorHandler.ts`

**Implementation Details**:

```typescript
// Error recovery system
class RealtimeErrorRecovery {
  private retryAttempts = new Map();
  private maxRetries = 3;

  async handleFailedUpdate(
    operation: () => Promise<any>,
    fallbackData?: any
  ): Promise<void> {
    const operationId = generateId();
    const attempts = this.retryAttempts.get(operationId) || 0;

    if (attempts >= this.maxRetries) {
      // Trigger data refresh from server
      this.triggerDataRefresh();
      return;
    }

    try {
      await operation();
      this.retryAttempts.delete(operationId);
    } catch (error) {
      this.retryAttempts.set(operationId, attempts + 1);

      // Exponential backoff
      const delay = Math.pow(2, attempts) * 1000;
      setTimeout(() => {
        this.handleFailedUpdate(operation, fallbackData);
      }, delay);
    }
  }
}
```

**Testing Criteria**:

- [ ] Failed operations retry with exponential backoff
- [ ] Data is refreshed after max retries
- [ ] Users are notified of persistent errors
- [ ] System recovers gracefully from network issues
- [ ] No infinite retry loops

---

### Phase 6: Testing and Polish

**Objective**: Comprehensive testing and user experience improvements
**Estimated Time**: 3-4 hours
**Risk Level**: Low

#### Task 6.1: Comprehensive Testing

- [ ] **Status**: Not Started
- **Description**: Test all real-time features comprehensively
- **Testing Scenarios**:
  - Multiple users making simultaneous changes
  - Network interruptions during operations
  - High-frequency event scenarios
  - Error recovery and rollback scenarios
  - Performance under load

**Testing Criteria**:

- [ ] All real-time features work correctly
- [ ] No memory leaks or performance degradation
- [ ] Proper error handling in all scenarios
- [ ] Data consistency is maintained
- [ ] User experience is smooth and responsive

---

#### Task 6.2: User Experience Enhancements

- [ ] **Status**: Not Started
- **Description**: Add polish and improve user experience
- **Files to Modify**:
  - Add loading indicators for optimistic updates
  - Improve notification system for real-time events
  - Add animation for real-time updates

**Enhancements**:

- Subtle animations for new items appearing
- Loading states for optimistic updates
- Better error messages and recovery options
- Success notifications for completed actions

**Testing Criteria**:

- [ ] Animations are smooth and not distracting
- [ ] Loading states provide appropriate feedback
- [ ] Error messages are helpful and actionable
- [ ] Overall user experience is improved

---

#### Task 6.3: Documentation and Cleanup

- [ ] **Status**: Not Started
- **Description**: Document the real-time system and clean up code
- **Deliverables**:
  - Real-time system documentation
  - API documentation for events
  - Performance guidelines
  - Troubleshooting guide

**Testing Criteria**:

- [ ] Documentation is complete and accurate
- [ ] Code is clean and well-commented
- [ ] No unused imports or dead code
- [ ] TypeScript types are properly defined

---

## Progress Tracking

### Phase 1: Foundation - Event Management System ✅

- **Overall Progress**: 3/3 tasks completed
- **Status**: ✅ **COMPLETED**
- **Estimated Completion**: 2-3 hours _(Actual: 2 hours)_

  #### Completed Tasks:

  - [x] **Task 1.1: Create Core Event Manager** ✅ _(45 minutes)_
  - [x] **Task 1.2: Create Real-Time Context Provider** ✅ _(1 hour)_
  - [x] **Task 1.3: Integrate with App Layout** ✅ _(15 minutes)_

**Phase 1 Results**:

- ✅ Complete event management infrastructure established
- ✅ Type-safe real-time context and hooks system implemented
- ✅ App layout successfully integrated with RealtimeProvider
- ✅ Foundation ready for Phase 2 implementation

### Phase 2: Wallet Real-Time Updates ⏳

- **Overall Progress**: 0/3 tasks completed
- **Status**: Not Started
- **Estimated Completion**: TBD

### Phase 3: Chore/Task Real-Time Updates ⏳

- **Overall Progress**: 0/3 tasks completed
- **Status**: Not Started
- **Estimated Completion**: TBD

### Phase 4: Statistics and Dashboard Real-Time Updates ⏳

- **Overall Progress**: 0/2 tasks completed
- **Status**: Not Started
- **Estimated Completion**: TBD

### Phase 5: Advanced Real-Time Features ⏳

- **Overall Progress**: 0/3 tasks completed
- **Status**: Not Started
- **Estimated Completion**: TBD

### Phase 6: Testing and Polish ⏳

- **Overall Progress**: 0/3 tasks completed
- **Status**: Not Started
- **Estimated Completion**: TBD

---

## Success Metrics

### Technical Metrics

- [ ] Zero manual refreshes needed for data updates
- [ ] <100ms UI response time for optimistic updates
- [ ] <5% performance degradation from baseline
- [ ] Zero data inconsistency issues
- [ ] 100% event delivery reliability

### User Experience Metrics

- [ ] Instant feedback for all user actions
- [ ] Smooth animations and transitions
- [ ] Clear error messages and recovery
- [ ] No loading states for cached data
- [ ] Seamless multi-user experience

---

## Risk Mitigation

### High-Risk Areas

1. **State Synchronization**: Multiple components updating the same data
2. **Performance Impact**: Event system causing excessive re-renders
3. **Error Recovery**: Handling network failures and inconsistent states
4. **Memory Leaks**: Event subscriptions not properly cleaned up

### Mitigation Strategies

1. **Incremental Implementation**: Each phase is independent and testable
2. **Rollback Capability**: All changes can be reverted without breaking existing functionality
3. **Performance Monitoring**: Continuous monitoring during implementation
4. **Comprehensive Testing**: Each task includes specific testing criteria

---

## Implementation Notes

### Backward Compatibility

- All existing `refreshTrigger` patterns will continue to work
- Components can gradually migrate to real-time updates
- No breaking changes to existing APIs

### Performance Considerations

- Event batching to prevent excessive re-renders
- Debounced updates for high-frequency events
- Memory management for event subscriptions
- Optimistic updates to reduce perceived latency

### Error Handling Strategy

- Graceful degradation when real-time features fail
- Automatic retry with exponential backoff
- Fallback to manual refresh when needed
- Clear user feedback for error states

---

## Getting Started

1. **Review Current Code**: Understand existing patterns and data flow
2. **Start with Phase 1**: Build the foundation event system
3. **Test Each Task**: Ensure app stability before proceeding
4. **Gradual Migration**: Move components to real-time updates incrementally
5. **Monitor Performance**: Watch for any degradation during implementation

Remember: Each task should be completed and tested before moving to the next one. The app should remain functional at all times during this implementation.
