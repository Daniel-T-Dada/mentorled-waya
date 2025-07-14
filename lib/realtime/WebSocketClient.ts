// lib/realtime/WebSocketClient.ts

/**
 * Global WebSocket client for real-time updates across the app.
 * Designed to be reusable for Kids Dashboard, Parent Dashboard, etc.
 */

export type WayaEventType =
    | "WALLET_UPDATE"
    | "CHORE_UPDATE"
    | "TRANSACTION_UPDATE"
    | "KID_UPDATE"
    | "ALLOWANCE_UPDATE"
    | "GOAL_UPDATE"
    | "MONEYMAZE_UPDATE"
    | "PROFILE_UPDATE";

// Export event types as a value for use in subscriptions
export const WayaEventTypes = {
    WALLET_UPDATE: "WALLET_UPDATE",
    CHORE_UPDATE: "CHORE_UPDATE",
    TRANSACTION_UPDATE: "TRANSACTION_UPDATE",
    KID_UPDATE: "KID_UPDATE",
    ALLOWANCE_UPDATE: "ALLOWANCE_UPDATE",
    GOAL_UPDATE: "GOAL_UPDATE",
    MONEYMAZE_UPDATE: "MONEYMAZE_UPDATE",
    PROFILE_UPDATE: "PROFILE_UPDATE",
} as const;

export type WayaEventPayload = Record<string, any>;

export interface WayaEvent {
    type: WayaEventType;
    payload: WayaEventPayload;
    timestamp: number;
    source?: string;
}

export type EventCallback = (event: WayaEvent) => void;

class WebSocketClient {
    private socket: WebSocket | null = null;
    private subscribers: Map<WayaEventType, Set<EventCallback>> = new Map();
    private url: string;

    constructor(url: string) {
        this.url = url;
        this.connect();
    }

    private connect() {
        this.socket = new WebSocket(this.url);
        this.socket.onmessage = (message) => {
            try {
                const event: WayaEvent = JSON.parse(message.data);
                this.notify(event);
            } catch (err) {
                if (process.env.NODE_ENV === "development") {
                    console.error("WebSocket message parse error:", err);
                }
            }
        };
        this.socket.onclose = () => {
            // Auto-reconnect after delay
            setTimeout(() => this.connect(), 2000);
        };
    }

    private notify(event: WayaEvent) {
        const subs = this.subscribers.get(event.type);
        if (subs) {
            subs.forEach((cb) => {
                try {
                    cb(event);
                } catch (err) {
                    if (process.env.NODE_ENV === "development") {
                        console.error("WebSocket event callback error:", err);
                    }
                }
            });
        }
    }

    subscribe(eventType: WayaEventType, callback: EventCallback): () => void {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, new Set());
        }
        this.subscribers.get(eventType)!.add(callback);
        return () => {
            this.subscribers.get(eventType)!.delete(callback);
        };
    }

    emit(event: WayaEvent) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(event));
        }
    }
}

// Singleton instance for global use
let globalWebSocketClient: WebSocketClient | null = null;

export function getWebSocketClient(url?: string): WebSocketClient {
    if (!globalWebSocketClient) {
        if (!url) throw new Error("WebSocket URL required for first initialization");
        globalWebSocketClient = new WebSocketClient(url);
    }
    return globalWebSocketClient;
}

export default WebSocketClient;
