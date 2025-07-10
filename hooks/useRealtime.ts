/**
 * Custom hooks for real-time data management
 * Provides specific hooks for different data types
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRealtime } from '@/contexts/RealtimeContext';
import { eventManager } from '@/lib/realtime';
import type {
  WalletUpdatePayload,
  ChoreUpdatePayload,
  TransactionUpdatePayload,
  KidUpdatePayload,
  AllowanceUpdatePayload,
  WayaEvent
} from '@/lib/realtime/types';

// Hook for wallet-related real-time updates
export function useRealtimeWallet() {
  const { state, updateWalletData } = useRealtime();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [kidWallets, setKidWallets] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to wallet updates
  useEffect(() => {
    const handleWalletUpdate = (event: WayaEvent<WalletUpdatePayload>) => {
      const { payload } = event;

      switch (payload.action) {
        case 'ADD_FUNDS':
          if (payload.newBalance !== undefined) {
            setWalletBalance(payload.newBalance);
          }
          break;
        case 'MAKE_PAYMENT':
          if (payload.parentNewBalance !== undefined) {
            setWalletBalance(payload.parentNewBalance);
          }
          if (payload.kidId && payload.kidNewBalance !== undefined) {
            setKidWallets(prev => ({
              ...prev,
              [payload.kidId!]: {
                ...prev[payload.kidId!],
                balance: payload.kidNewBalance
              }
            }));
          }
          break;
        case 'BALANCE_UPDATE':
          if (payload.newBalance !== undefined) {
            setWalletBalance(payload.newBalance);
          }
          break;
      }
    };

    const unsubscribe = eventManager.subscribe('WALLET_UPDATE', handleWalletUpdate);
    return unsubscribe;
  }, []);

  // Emit wallet update
  const emitWalletUpdate = useCallback((payload: WalletUpdatePayload) => {
    eventManager.emit({
      type: 'WALLET_UPDATE',
      payload,
      timestamp: Date.now()
    });
  }, []);

  return {
    walletBalance,
    kidWallets,
    isLoading,
    walletState: state.wallet,
    emitWalletUpdate,
    setWalletBalance,
    setKidWallets,
    setIsLoading
  };
}

// Hook for chore-related real-time updates
export function useRealtimeChores() {
  const { state, updateChoreData } = useRealtime();
  const [chores, setChores] = useState<any[]>([]);
  const [choresByKid, setChoresByKid] = useState<Record<string, any[]>>({});
  const [choreCounts, setChoreCounts] = useState({
    pending: 0,
    completed: 0,
    inProgress: 0
  });

  // Subscribe to chore updates
  useEffect(() => {
    const handleChoreUpdate = (event: WayaEvent<ChoreUpdatePayload>) => {
      const { payload } = event;

      switch (payload.action) {
        case 'CREATE':
          if (payload.chore) {
            setChores(prev => [payload.chore, ...prev]);
            if (payload.assignedTo) {
              setChoresByKid(prev => ({
                ...prev,
                [payload.assignedTo!]: [payload.chore, ...(prev[payload.assignedTo!] || [])]
              }));
            }
          }
          break;
        case 'STATUS_UPDATE':
          if (payload.choreId && payload.newStatus) {
            setChores(prev => prev.map(chore =>
              chore.id === payload.choreId
                ? { ...chore, status: payload.newStatus, completedAt: payload.completedAt }
                : chore
            ));
          }
          break;
        case 'EDIT':
          if (payload.updatedTask) {
            setChores(prev => prev.map(chore =>
              chore.id === payload.updatedTask.id ? payload.updatedTask : chore
            ));
          }
          break;
        case 'DELETE':
          if (payload.choreId) {
            setChores(prev => prev.filter(chore => chore.id !== payload.choreId));
          }
          break;
      }
    };

    const unsubscribe = eventManager.subscribe('CHORE_UPDATE', handleChoreUpdate);
    return unsubscribe;
  }, []);

  // Emit chore update
  const emitChoreUpdate = useCallback((payload: ChoreUpdatePayload) => {
    eventManager.emit({
      type: 'CHORE_UPDATE',
      payload,
      timestamp: Date.now()
    });
  }, []);

  return {
    chores,
    choresByKid,
    choreCounts,
    choreState: state.chores,
    emitChoreUpdate,
    setChores,
    setChoresByKid,
    setChoreCounts
  };
}

// Hook for transaction-related real-time updates
export function useRealtimeTransactions() {
  const { state, updateTransactionData } = useRealtime();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Subscribe to transaction updates
  useEffect(() => {
    const handleTransactionUpdate = (event: WayaEvent<TransactionUpdatePayload>) => {
      const { payload } = event;

      switch (payload.action) {
        case 'CREATE':
          if (payload.transaction) {
            setTransactions(prev => [payload.transaction, ...prev]);
            setRecentTransactions(prev => [payload.transaction, ...prev.slice(0, 4)]);
          }
          break;
        case 'UPDATE':
          if (payload.transaction) {
            setTransactions(prev => prev.map(tx =>
              tx.id === payload.transaction.id ? payload.transaction : tx
            ));
          }
          break;
        case 'DELETE':
          if (payload.transactionId) {
            setTransactions(prev => prev.filter(tx => tx.id !== payload.transactionId));
          }
          break;
      }
    };

    const unsubscribe = eventManager.subscribe('TRANSACTION_UPDATE', handleTransactionUpdate);
    return unsubscribe;
  }, []);

  // Emit transaction update
  const emitTransactionUpdate = useCallback((payload: TransactionUpdatePayload) => {
    eventManager.emit({
      type: 'TRANSACTION_UPDATE',
      payload,
      timestamp: Date.now()
    });
  }, []);

  return {
    transactions,
    recentTransactions,
    transactionState: state.transactions,
    emitTransactionUpdate,
    setTransactions,
    setRecentTransactions
  };
}

// Hook for kid-related real-time updates
export function useRealtimeKids() {
  const { state, updateKidData } = useRealtime();
  const [kids, setKids] = useState<any[]>([]);
  const [kidStats, setKidStats] = useState<Record<string, any>>({});

  // Subscribe to kid updates
  useEffect(() => {
    const handleKidUpdate = (event: WayaEvent<KidUpdatePayload>) => {
      const { payload } = event;

      switch (payload.action) {
        case 'CREATE':
          if (payload.kid) {
            setKids(prev => [payload.kid, ...prev]);
          }
          break;
        case 'UPDATE':
          if (payload.kid) {
            setKids(prev => prev.map(kid =>
              kid.id === payload.kid.id ? payload.kid : kid
            ));
          }
          break;
        case 'DELETE':
          if (payload.kidId) {
            setKids(prev => prev.filter(kid => kid.id !== payload.kidId));
          }
          break;
      }
    };

    const unsubscribe = eventManager.subscribe('KID_UPDATE', handleKidUpdate);
    return unsubscribe;
  }, []);

  // Emit kid update
  const emitKidUpdate = useCallback((payload: KidUpdatePayload) => {
    eventManager.emit({
      type: 'KID_UPDATE',
      payload,
      timestamp: Date.now()
    });
  }, []);

  return {
    kids,
    kidStats,
    kidState: state.kids,
    emitKidUpdate,
    setKids,
    setKidStats
  };
}

// Hook for allowance-related real-time updates
export function useRealtimeAllowances() {
  const { state, updateAllowanceData } = useRealtime();
  const [allowances, setAllowances] = useState<any[]>([]);
  const [allowancesByKid, setAllowancesByKid] = useState<Record<string, any[]>>({});

  // Subscribe to allowance updates
  useEffect(() => {
    const handleAllowanceUpdate = (event: WayaEvent<AllowanceUpdatePayload>) => {
      const { payload } = event;

      switch (payload.action) {
        case 'CREATE':
          if (payload.allowance) {
            setAllowances(prev => [payload.allowance, ...prev]);
            if (payload.kidId) {
              setAllowancesByKid(prev => ({
                ...prev,
                [payload.kidId!]: [payload.allowance, ...(prev[payload.kidId!] || [])]
              }));
            }
          }
          break;
        case 'UPDATE':
          if (payload.allowance) {
            setAllowances(prev => prev.map(allowance =>
              allowance.id === payload.allowance.id ? payload.allowance : allowance
            ));
          }
          break;
        case 'PAYMENT':
          // Handle allowance payment updates
          if (payload.kidId && payload.amount) {
            // Update payment status or balance
          }
          break;
      }
    };

    const unsubscribe = eventManager.subscribe('ALLOWANCE_UPDATE', handleAllowanceUpdate);
    return unsubscribe;
  }, []);

  // Emit allowance update
  const emitAllowanceUpdate = useCallback((payload: AllowanceUpdatePayload) => {
    eventManager.emit({
      type: 'ALLOWANCE_UPDATE',
      payload,
      timestamp: Date.now()
    });
  }, []);

  return {
    allowances,
    allowancesByKid,
    allowanceState: state.allowances,
    emitAllowanceUpdate,
    setAllowances,
    setAllowancesByKid
  };
}

// Generic hook for subscribing to any event type
export function useRealtimeEvent<T extends keyof import('@/lib/realtime/types').EventPayloadMap>(
  eventType: T,
  callback: (event: WayaEvent<import('@/lib/realtime/types').EventPayloadMap[T]>) => void
) {
  useEffect(() => {
    const unsubscribe = eventManager.subscribe(eventType, callback);
    return unsubscribe;
  }, [eventType, callback]);
}

// Hook for getting real-time connection status
export function useRealtimeStatus() {
  const { state, getConnectionStatus, getLastActivity } = useRealtime();

  return {
    isConnected: getConnectionStatus(),
    lastActivity: getLastActivity(),
    hasRecentActivity: Date.now() - getLastActivity() < 60000, // Active in last minute
  };
}
