import { optimize } from 'svgo';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// SVGO configuration for optimal compression while preserving quality
const svgoConfig = {
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    // Keep viewBox for responsive scaling
                    removeViewBox: false,
                    // Keep IDs that might be referenced
                    cleanupIds: false,
                    // Preserve some structure for better debugging
                    collapseGroups: false,
                },
            },
        },
        // Remove unnecessary metadata
        'removeDimensions',
        'removeOffCanvasPaths',
        'reusePaths',
        // Optimize colors
        'convertColors',
        // Optimize paths
        'convertPathData',
        // Remove empty elements
        'removeEmptyContainers',
        'removeEmptyText',
        // Minify styles
        'minifyStyles',
    ],
};

function getFileSizeInKB(filePath) {
    const stats = statSync(filePath);
    return (stats.size / 1024).toFixed(2);
}

function optimizeSVGFile(filePath) {
    try {
        const svgContent = readFileSync(filePath, 'utf8');
        const result = optimize(svgContent, svgoConfig);

        if (result.error) {
            console.error(`Error optimizing ${filePath}:`, result.error);
            return { success: false, error: result.error };
        }

        const originalSize = getFileSizeInKB(filePath);
        writeFileSync(filePath, result.data);
        const newSize = getFileSizeInKB(filePath);
        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);

        return {
            success: true,
            file: filePath,
            originalSize: `${originalSize}KB`,
            newSize: `${newSize}KB`,
            reduction: `${reduction}%`,
            saved: `${(originalSize - newSize).toFixed(2)}KB`
        };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        return { success: false, error: error.message };
    }
}

function optimizeSVGsInDirectory(dirPath) {
    const results = [];
    const files = readdirSync(dirPath);

    for (const file of files) {
        const filePath = join(dirPath, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            // Recursively process subdirectories
            results.push(...optimizeSVGsInDirectory(filePath));
        } else if (extname(file).toLowerCase() === '.svg') {
            console.log(`Optimizing: ${filePath}`);
            const result = optimizeSVGFile(filePath);
            results.push(result);
        }
    }

    return results;
}

// Main execution
console.log('🎨 Starting SVG Optimization...\n');

const publicDir = './public';
const logoDir = join(publicDir, 'Logo');
const assetsDir = join(publicDir, 'assets');

let allResults = [];

// Optimize Logo SVGs
console.log('📁 Optimizing Logo SVGs...');
allResults.push(...optimizeSVGsInDirectory(logoDir));

// Optimize Assets SVGs
console.log('\n📁 Optimizing Assets SVGs...');
allResults.push(...optimizeSVGsInDirectory(assetsDir));

// Print results
console.log('\n📊 Optimization Results:');
console.log('='.repeat(80));

let totalOriginalSize = 0;
let totalNewSize = 0;
let successCount = 0;

allResults.forEach(result => {
    if (result.success) {
        console.log(`✅ ${result.file}`);
        console.log(`   ${result.originalSize} → ${result.newSize} (saved ${result.saved}, -${result.reduction})`);

        totalOriginalSize += parseFloat(result.originalSize);
        totalNewSize += parseFloat(result.newSize);
        successCount++;
    } else {
        console.log(`❌ ${result.file || 'Unknown file'}: ${result.error}`);
    }
});

const totalReduction = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1);
const totalSaved = (totalOriginalSize - totalNewSize).toFixed(2);

console.log('\n📈 Summary:');
console.log(`Files optimized: ${successCount}`);
console.log(`Total size before: ${totalOriginalSize.toFixed(2)}KB`);
console.log(`Total size after: ${totalNewSize.toFixed(2)}KB`);
console.log(`Total saved: ${totalSaved}KB (${totalReduction}% reduction)`);
console.log('\n🎉 SVG optimization complete!');
