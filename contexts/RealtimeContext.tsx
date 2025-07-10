/**
 * Real-Time Context Provider for Waya App
 * Provides centralized real-time data management and event system access
 */

'use client';

import React, { createContext, useContext, useCallback, useMemo, useReducer, useEffect } from 'react';
import { eventManager } from '@/lib/realtime/EventManager';
import type {
    EventType,
    WayaEvent,
    EventCallback,
    UnsubscribeFunction,
    WalletUpdatePayload,
    ChoreUpdatePayload,
    TransactionUpdatePayload,
    KidUpdatePayload,
    AllowanceUpdatePayload,
    EventPayloadMap
} from '@/lib/realtime/types';

// State interfaces
interface WalletState {
    balance: number;
    transactions: any[];
    kidWallets: Record<string, { balance: number; transactions: any[] }>;
    lastUpdated: number;
}

interface ChoreState {
    chores: any[];
    choresByKid: Record<string, any[]>;
    choreCounts: {
        pending: number;
        completed: number;
        inProgress: number;
    };
    lastUpdated: number;
}

interface TransactionState {
    transactions: any[];
    recentTransactions: any[];
    lastUpdated: number;
}

interface KidState {
    kids: any[];
    kidStats: Record<string, any>;
    lastUpdated: number;
}

interface AllowanceState {
    allowances: any[];
    allowancesByKid: Record<string, any[]>;
    lastUpdated: number;
}

// Combined state interface
interface RealtimeState {
    wallet: WalletState | null;
    chores: ChoreState | null;
    transactions: TransactionState | null;
    kids: KidState | null;
    allowances: AllowanceState | null;
    isConnected: boolean;
    lastActivity: number;
}

// Context type
interface RealtimeContextType {
    state: RealtimeState;

    // Event system access
    subscribe: typeof eventManager.subscribe;
    emit: typeof eventManager.emit;

    // Convenience methods
    updateWalletData: (data: Partial<WalletState>) => void;
    updateChoreData: (data: Partial<ChoreState>) => void;
    updateTransactionData: (data: Partial<TransactionState>) => void;
    updateKidData: (data: Partial<KidState>) => void;
    updateAllowanceData: (data: Partial<AllowanceState>) => void;

    // Status methods
    getConnectionStatus: () => boolean;
    getLastActivity: () => number;
    resetState: () => void;
}

// Action types for reducer
type RealtimeAction =
    | { type: 'UPDATE_WALLET'; payload: Partial<WalletState> }
    | { type: 'UPDATE_CHORES'; payload: Partial<ChoreState> }
    | { type: 'UPDATE_TRANSACTIONS'; payload: Partial<TransactionState> }
    | { type: 'UPDATE_KIDS'; payload: Partial<KidState> }
    | { type: 'UPDATE_ALLOWANCES'; payload: Partial<AllowanceState> }
    | { type: 'SET_CONNECTED'; payload: boolean }
    | { type: 'UPDATE_ACTIVITY'; payload: number }
    | { type: 'RESET_STATE' };

// Initial state
const initialState: RealtimeState = {
    wallet: null,
    chores: null,
    transactions: null,
    kids: null,
    allowances: null,
    isConnected: true,
    lastActivity: Date.now(),
};

// Reducer function
function realtimeReducer(state: RealtimeState, action: RealtimeAction): RealtimeState {
    switch (action.type) {
        case 'UPDATE_WALLET':
            return {
                ...state,
                wallet: state.wallet ? { ...state.wallet, ...action.payload } : action.payload as WalletState,
                lastActivity: Date.now(),
            };

        case 'UPDATE_CHORES':
            return {
                ...state,
                chores: state.chores ? { ...state.chores, ...action.payload } : action.payload as ChoreState,
                lastActivity: Date.now(),
            };

        case 'UPDATE_TRANSACTIONS':
            return {
                ...state,
                transactions: state.transactions ? { ...state.transactions, ...action.payload } : action.payload as TransactionState,
                lastActivity: Date.now(),
            };

        case 'UPDATE_KIDS':
            return {
                ...state,
                kids: state.kids ? { ...state.kids, ...action.payload } : action.payload as KidState,
                lastActivity: Date.now(),
            };

        case 'UPDATE_ALLOWANCES':
            return {
                ...state,
                allowances: state.allowances ? { ...state.allowances, ...action.payload } : action.payload as AllowanceState,
                lastActivity: Date.now(),
            };

        case 'SET_CONNECTED':
            return {
                ...state,
                isConnected: action.payload,
                lastActivity: Date.now(),
            };

        case 'UPDATE_ACTIVITY':
            return {
                ...state,
                lastActivity: action.payload,
            };

        case 'RESET_STATE':
            return initialState;

        default:
            return state;
    }
}

// Create context
const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

// Provider component
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(realtimeReducer, initialState);

    // Event subscription wrapper
    const subscribe = useCallback(
        eventManager.subscribe.bind(eventManager),
        []
    );

    // Event emission wrapper
    const emit = useCallback(
        eventManager.emit.bind(eventManager),
        []
    );

    // Data update methods
    const updateWalletData = useCallback((data: Partial<WalletState>) => {
        dispatch({ type: 'UPDATE_WALLET', payload: data });
    }, []);

    const updateChoreData = useCallback((data: Partial<ChoreState>) => {
        dispatch({ type: 'UPDATE_CHORES', payload: data });
    }, []);

    const updateTransactionData = useCallback((data: Partial<TransactionState>) => {
        dispatch({ type: 'UPDATE_TRANSACTIONS', payload: data });
    }, []);

    const updateKidData = useCallback((data: Partial<KidState>) => {
        dispatch({ type: 'UPDATE_KIDS', payload: data });
    }, []);

    const updateAllowanceData = useCallback((data: Partial<AllowanceState>) => {
        dispatch({ type: 'UPDATE_ALLOWANCES', payload: data });
    }, []);

    // Status methods
    const getConnectionStatus = useCallback(() => state.isConnected, [state.isConnected]);
    const getLastActivity = useCallback(() => state.lastActivity, [state.lastActivity]);
    const resetState = useCallback(() => dispatch({ type: 'RESET_STATE' }), []);

    // Set up global event listeners
    useEffect(() => {
        const handleWalletUpdate = (event: WayaEvent<WalletUpdatePayload>) => {
            // Auto-update wallet state based on events
            const { payload } = event;
            updateWalletData({
                lastUpdated: event.timestamp,
                // Additional wallet state updates based on payload
            });
        };

        const handleChoreUpdate = (event: WayaEvent<ChoreUpdatePayload>) => {
            updateChoreData({
                lastUpdated: event.timestamp,
            });
        };

        const handleTransactionUpdate = (event: WayaEvent<TransactionUpdatePayload>) => {
            updateTransactionData({
                lastUpdated: event.timestamp,
            });
        };

        const handleKidUpdate = (event: WayaEvent<KidUpdatePayload>) => {
            updateKidData({
                lastUpdated: event.timestamp,
            });
        };

        const handleAllowanceUpdate = (event: WayaEvent<AllowanceUpdatePayload>) => {
            updateAllowanceData({
                lastUpdated: event.timestamp,
            });
        };

        // Subscribe to all event types using eventManager directly
        const unsubscribeWallet = eventManager.subscribe('WALLET_UPDATE', handleWalletUpdate);
        const unsubscribeChore = eventManager.subscribe('CHORE_UPDATE', handleChoreUpdate);
        const unsubscribeTransaction = eventManager.subscribe('TRANSACTION_UPDATE', handleTransactionUpdate);
        const unsubscribeKid = eventManager.subscribe('KID_UPDATE', handleKidUpdate);
        const unsubscribeAllowance = eventManager.subscribe('ALLOWANCE_UPDATE', handleAllowanceUpdate);

        // Cleanup
        return () => {
            unsubscribeWallet();
            unsubscribeChore();
            unsubscribeTransaction();
            unsubscribeKid();
            unsubscribeAllowance();
        };
    }, [updateWalletData, updateChoreData, updateTransactionData, updateKidData, updateAllowanceData]);

    // Memoize context value
    const contextValue = useMemo<RealtimeContextType>(() => ({
        state,
        subscribe,
        emit,
        updateWalletData,
        updateChoreData,
        updateTransactionData,
        updateKidData,
        updateAllowanceData,
        getConnectionStatus,
        getLastActivity,
        resetState,
    }), [
        state,
        subscribe,
        emit,
        updateWalletData,
        updateChoreData,
        updateTransactionData,
        updateKidData,
        updateAllowanceData,
        getConnectionStatus,
        getLastActivity,
        resetState,
    ]);

    return (
        <RealtimeContext.Provider value={contextValue}>
            {children}
        </RealtimeContext.Provider>
    );
}

// Hook to use realtime context
export function useRealtime(): RealtimeContextType {
    const context = useContext(RealtimeContext);
    if (context === undefined) {
        throw new Error('useRealtime must be used within a RealtimeProvider');
    }
    return context;
}

// Export types for external use
export type { RealtimeContextType, RealtimeState, WalletState, ChoreState, TransactionState, KidState, AllowanceState };
