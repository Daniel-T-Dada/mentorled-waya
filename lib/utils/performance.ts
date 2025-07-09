// Performance logging utility for baseline measurements
export interface PerformanceMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    timestamp: string;
    id: string;
}

export class PerformanceLogger {
    private static metrics: PerformanceMetric[] = [];

    static logMetric(metric: PerformanceMetric) {
        this.metrics.push(metric);

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Performance] ${metric.name}: ${metric.value}ms (${metric.rating})`);
        }
    }

    static getMetrics(): PerformanceMetric[] {
        return this.metrics;
    }

    static getMetricsByName(name: string): PerformanceMetric[] {
        return this.metrics.filter(m => m.name === name);
    }

    static getLatestMetrics(): Record<string, PerformanceMetric> {
        const latest: Record<string, PerformanceMetric> = {};

        this.metrics.forEach(metric => {
            if (!latest[metric.name] ||
                new Date(metric.timestamp) > new Date(latest[metric.name].timestamp)) {
                latest[metric.name] = metric;
            }
        });

        return latest;
    }

    static getPerformanceSummary() {
        const latest = this.getLatestMetrics();
        const summary = {
            CLS: latest.CLS?.value || 0,
            INP: latest.INP?.value || 0,
            FCP: latest.FCP?.value || 0,
            LCP: latest.LCP?.value || 0,
            TTFB: latest.TTFB?.value || 0,
            overall: 'unknown' as 'good' | 'needs-improvement' | 'poor' | 'unknown'
        };

        // Calculate overall rating
        const ratings = Object.values(latest).map(m => m.rating);
        if (ratings.every(r => r === 'good')) {
            summary.overall = 'good';
        } else if (ratings.some(r => r === 'poor')) {
            summary.overall = 'poor';
        } else {
            summary.overall = 'needs-improvement';
        }

        return summary;
    }

    static exportMetrics(): string {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            summary: this.getPerformanceSummary()
        }, null, 2);
    }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
    (window as any).PerformanceLogger = PerformanceLogger;
}
