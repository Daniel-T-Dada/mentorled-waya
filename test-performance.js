// Simple test to verify performance monitoring is working
// This would be run in the browser console to check metrics

// Check if PerformanceLogger is available
if (typeof PerformanceLogger !== 'undefined') {
    console.log('Performance metrics collected:');
    console.log(PerformanceLogger.getMetrics());
    console.log('\nLatest metrics:');
    console.log(PerformanceLogger.getLatestMetrics());
    console.log('\nPerformance summary:');
    console.log(PerformanceLogger.getPerformanceSummary());
} else {
    console.log('PerformanceLogger not available in global scope');
}
