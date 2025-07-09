'use client';

import { useEffect, useCallback } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import { PerformanceLogger } from '@/lib/utils/performance';

export function WebVitals() {
    const getRating = useCallback((name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
        switch (name) {
            case 'CLS':
                return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
            case 'INP':
                return value < 200 ? 'good' : value < 500 ? 'needs-improvement' : 'poor';
            case 'FCP':
                return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
            case 'LCP':
                return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
            case 'TTFB':
                return value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor';
            default:
                return 'poor';
        }
    }, []);

    const onPerfEntry = useCallback((metric: any) => {
        const { name, value, id } = metric;
        const rating = getRating(name, value);

        // Log to performance logger
        PerformanceLogger.logMetric({
            name,
            value: Math.round(value),
            rating,
            timestamp: new Date().toISOString(),
            id
        });

        // In production, you might want to send to analytics
        // Example: sendToAnalytics(metric);
    }, [getRating]);

    useEffect(() => {
        // Track Core Web Vitals
        onCLS(onPerfEntry);
        onINP(onPerfEntry); // INP replaces FID in newer versions
        onFCP(onPerfEntry);
        onLCP(onPerfEntry);
        onTTFB(onPerfEntry);
    }, [onPerfEntry]);

    // This component doesn't render anything
    return null;
}
