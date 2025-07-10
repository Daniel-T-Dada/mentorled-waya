/**
 * Real-time updates system for Waya app
 * Central exports for event management and real-time functionality
 */

export { EventManager, eventManager } from './EventManager';
export type {
    EventType,
    WayaEvent,
    EventCallback,
    UnsubscribeFunction,
    WalletUpdatePayload,
    ChoreUpdatePayload,
    TransactionUpdatePayload,
    KidUpdatePayload,
    AllowanceUpdatePayload,
    EventPayloadMap,
} from './types';

// Convenience functions for common operations
export const createEvent = <T extends import('./types').EventType>(
    type: T,
    payload: import('./types').EventPayloadMap[T],
    source?: string
): import('./types').WayaEvent<import('./types').EventPayloadMap[T]> => ({
    type,
    payload,
    timestamp: Date.now(),
    source,
});

// Helper functions for specific event types
export const createWalletEvent = (
    payload: import('./types').WalletUpdatePayload,
    source?: string
) => createEvent('WALLET_UPDATE', payload, source);

export const createChoreEvent = (
    payload: import('./types').ChoreUpdatePayload,
    source?: string
) => createEvent('CHORE_UPDATE', payload, source);

export const createTransactionEvent = (
    payload: import('./types').TransactionUpdatePayload,
    source?: string
) => createEvent('TRANSACTION_UPDATE', payload, source);

export const createKidEvent = (
    payload: import('./types').KidUpdatePayload,
    source?: string
) => createEvent('KID_UPDATE', payload, source);

export const createAllowanceEvent = (
    payload: import('./types').AllowanceUpdatePayload,
    source?: string
) => createEvent('ALLOWANCE_UPDATE', payload, source);
