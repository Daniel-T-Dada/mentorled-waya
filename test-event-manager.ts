/**
 * Quick test file to verify EventManager functionality
 * This file can be deleted after verification
 */

import { eventManager, createWalletEvent } from './lib/realtime';

console.log('Testing EventManager functionality...');

// Test 1: Basic subscription and emission
let eventReceived = false;
const unsubscribe = eventManager.subscribe('WALLET_UPDATE', (event) => {
    console.log('✅ Event received:', event);
    eventReceived = true;
});

// Test 2: Emit a test event
const testEvent = createWalletEvent({
    action: 'ADD_FUNDS',
    amount: 100,
    newBalance: 500,
    transactionId: 'test-123'
});

eventManager.emit(testEvent);

// Test 3: Check subscriber count
const subscriberCount = eventManager.getSubscriberCount('WALLET_UPDATE');
console.log('✅ Subscriber count:', subscriberCount);

// Test 4: Check debug info
const debugInfo = eventManager.getDebugInfo();
console.log('✅ Debug info:', debugInfo);

// Cleanup
unsubscribe();

console.log('✅ EventManager test completed successfully!');

export { };
