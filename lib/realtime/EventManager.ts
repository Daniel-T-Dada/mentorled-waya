/**
 * Core Event Manager for Waya Real-time Updates
 * Provides centralized event subscription and emission capabilities
 */

import {
  EventType,
  WayaEvent,
  EventCallback,
  UnsubscribeFunction,
  EventPayloadMap
} from './types';

class EventManager {
  private subscribers: Map<string, Set<EventCallback>> = new Map();
  private eventHistory: WayaEvent[] = [];
  private maxHistorySize = 100;

  /**
   * Subscribe to events of a specific type
   * @param eventType - The type of event to subscribe to
   * @param callback - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  subscribe<T extends EventType>(
    eventType: T,
    callback: EventCallback<EventPayloadMap[T]>
  ): UnsubscribeFunction {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    const subscribers = this.subscribers.get(eventType)!;
    subscribers.add(callback as EventCallback);

    // Return unsubscribe function
    return () => {
      subscribers.delete(callback as EventCallback);
      if (subscribers.size === 0) {
        this.subscribers.delete(eventType);
      }
    };
  }

  /**
   * Emit an event to all subscribers
   * @param event - The event to emit
   */
  emit<T extends EventType>(event: WayaEvent<EventPayloadMap[T]>): void {
    // Add timestamp and ID if not provided
    const enrichedEvent: WayaEvent<EventPayloadMap[T]> = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      id: event.id || this.generateEventId(),
    };

    // Add to history
    this.addToHistory(enrichedEvent);

    // Emit to subscribers
    const subscribers = this.subscribers.get(event.type);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(enrichedEvent);
        } catch (error) {
          console.error(`Error in event callback for ${event.type}:`, error);
        }
      });
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EventManager] Emitted ${event.type}:`, enrichedEvent);
    }
  }

  /**
   * Emit an event asynchronously
   * @param event - The event to emit
   */
  async emitAsync<T extends EventType>(
    event: WayaEvent<EventPayloadMap[T]>
  ): Promise<void> {
    return new Promise((resolve) => {
      // Use setTimeout to ensure async behavior
      setTimeout(() => {
        this.emit(event);
        resolve();
      }, 0);
    });
  }

  /**
   * Get all subscribers for a specific event type
   * @param eventType - The event type to check
   * @returns Number of subscribers
   */
  getSubscriberCount(eventType: EventType): number {
    const subscribers = this.subscribers.get(eventType);
    return subscribers ? subscribers.size : 0;
  }

  /**
   * Get recent event history
   * @param eventType - Optional event type filter
   * @param limit - Maximum number of events to return
   * @returns Array of recent events
   */
  getEventHistory(eventType?: EventType, limit = 10): WayaEvent[] {
    let events = this.eventHistory;

    if (eventType) {
      events = events.filter(event => event.type === eventType);
    }

    return events.slice(-limit);
  }

  /**
   * Clear all subscribers and event history
   */
  clear(): void {
    this.subscribers.clear();
    this.eventHistory = [];
  }

  /**
   * Get debug information about the event manager
   */
  getDebugInfo() {
    const subscriberCounts: Record<string, number> = {};

    this.subscribers.forEach((subscribers, eventType) => {
      subscriberCounts[eventType] = subscribers.size;
    });

    return {
      totalEventTypes: this.subscribers.size,
      subscriberCounts,
      historySize: this.eventHistory.length,
      recentEvents: this.getEventHistory(undefined, 5),
    };
  }

  private addToHistory(event: WayaEvent): void {
    this.eventHistory.push(event);

    // Keep history size manageable
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
export const eventManager = new EventManager();

// Export the class for testing
export { EventManager };
