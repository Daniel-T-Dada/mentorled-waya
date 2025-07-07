'use client';

import { useState } from 'react';
import { CacheUtils } from '@/lib/utils/api';

interface AuthDebuggerProps {
    isEnabled?: boolean;
}

export default function AuthDebugger({ isEnabled = process.env.NODE_ENV === 'development' }: AuthDebuggerProps) {
    const [isClearing, setIsClearing] = useState(false);
    const [message, setMessage] = useState('');

    const handleClearCaches = async () => {
        setIsClearing(true);
        setMessage('');

        try {
            await CacheUtils.clearAllCaches();
            await CacheUtils.refreshServiceWorker();
            setMessage('✅ All caches cleared successfully! Refresh the page to complete the reset.');
        } catch (error) {
            console.error('Error clearing caches:', error);
            setMessage('❌ Error clearing caches. Check console for details.');
        } finally {
            setIsClearing(false);
        }
    };

    const handleForceRefresh = () => {
        if (typeof window !== 'undefined') {
            // Force a hard refresh
            window.location.reload();
        }
    };

    if (!isEnabled) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-50">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                🔧 Auth Debugger
            </div>

            <div className="space-y-2">
                <button
                    onClick={handleClearCaches}
                    disabled={isClearing}
                    className="w-full px-3 py-2 text-xs bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded"
                >
                    {isClearing ? 'Clearing...' : 'Clear All Caches'}
                </button>

                <button
                    onClick={handleForceRefresh}
                    className="w-full px-3 py-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                    Force Refresh
                </button>
            </div>

            {message && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {message}
                </div>
            )}

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Use when experiencing login issues
            </div>
        </div>
    );
}
