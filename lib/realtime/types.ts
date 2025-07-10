/**
 * Real-time event types and interfaces for Waya app
 * Provides type-safe event definitions for the event management system
 */

export type EventType =
  | "WALLET_UPDATE"
  | "CHORE_UPDATE"
  | "TRANSACTION_UPDATE"
  | "KID_UPDATE"
  | "ALLOWANCE_UPDATE";

export interface WayaEvent<T = any> {
  type: EventType;
  payload: T;
  timestamp: number;
  source?: string;
  id?: string;
}

export type EventCallback<T = any> = (event: WayaEvent<T>) => void;
export type UnsubscribeFunction = () => void;

// Wallet event payloads
export interface WalletUpdatePayload {
  action: "ADD_FUNDS" | "MAKE_PAYMENT" | "BALANCE_UPDATE";
  amount?: number;
  newBalance?: number;
  transactionId?: string;
  fromWallet?: string;
  toKid?: string;
  parentNewBalance?: number;
  kidNewBalance?: number;
  kidId?: string;
}

// Chore event payloads
export interface ChoreUpdatePayload {
  action: "CREATE" | "STATUS_UPDATE" | "EDIT" | "DELETE";
  chore?: any;
  choreId?: string;
  assignedTo?: string;
  newStatus?: string;
  completedAt?: string | null;
  updatedTask?: any;
}

// Transaction event payloads
export interface TransactionUpdatePayload {
  action: "CREATE" | "UPDATE" | "DELETE";
  transaction?: any;
  transactionId?: string;
}

// Kid event payloads
export interface KidUpdatePayload {
  action: "CREATE" | "UPDATE" | "DELETE";
  kid?: any;
  kidId?: string;
  updatedData?: any;
}

// Allowance event payloads
export interface AllowanceUpdatePayload {
  action: "CREATE" | "UPDATE" | "PAYMENT";
  allowance?: any;
  allowanceId?: string;
  kidId?: string;
  amount?: number;
}

// Event mapping for type safety
export interface EventPayloadMap {
  WALLET_UPDATE: WalletUpdatePayload;
  CHORE_UPDATE: ChoreUpdatePayload;
  TRANSACTION_UPDATE: TransactionUpdatePayload;
  KID_UPDATE: KidUpdatePayload;
  ALLOWANCE_UPDATE: AllowanceUpdatePayload;
}
