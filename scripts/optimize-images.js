const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertToWebP(inputPath, outputPath, quality = 80) {
    try {
        await sharp(inputPath)
            .webp({ quality })
            .toFile(outputPath);

        const inputStats = fs.statSync(inputPath);
        const outputStats = fs.statSync(outputPath);
        const reduction = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(2);

        console.log(`✅ ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
        console.log(`   Size: ${(inputStats.size / 1024).toFixed(2)}KB -> ${(outputStats.size / 1024).toFixed(2)}KB (${reduction}% reduction)`);

        return { original: inputStats.size, converted: outputStats.size, reduction };
    } catch (error) {
        console.error(`❌ Error converting ${inputPath}:`, error.message);
        return null;
    }
}

async function convertDirectoryPngs(dirPath, outputDir) {
    const files = fs.readdirSync(dirPath);
    const results = [];

    for (const file of files) {
        if (path.extname(file).toLowerCase() === '.png') {
            const inputPath = path.join(dirPath, file);
            const outputPath = path.join(outputDir, file.replace('.png', '.webp'));

            // Ensure output directory exists
            fs.mkdirSync(outputDir, { recursive: true });

            const result = await convertToWebP(inputPath, outputPath);
            if (result) results.push(result);
        }
    }

    return results;
}

async function main() {
    console.log('🚀 Starting image optimization...\n');

    const directories = [
        { input: 'public/assets', output: 'public/assets' },
        { input: 'public/Logo', output: 'public/Logo' },
        { input: 'public', output: 'public', rootOnly: true }
    ];

    let totalOriginal = 0;
    let totalConverted = 0;

    for (const dir of directories) {
        console.log(`📁 Processing ${dir.input}...`);

        if (dir.rootOnly) {
            // Only process PNG files in the root, not subdirectories
            const files = fs.readdirSync(dir.input).filter(file =>
                path.extname(file).toLowerCase() === '.png' &&
                fs.statSync(path.join(dir.input, file)).isFile()
            );

            for (const file of files) {
                const inputPath = path.join(dir.input, file);
                const outputPath = path.join(dir.output, file.replace('.png', '.webp'));

                const result = await convertToWebP(inputPath, outputPath);
                if (result) {
                    totalOriginal += result.original;
                    totalConverted += result.converted;
                }
            }
        } else {
            const results = await convertDirectoryPngs(dir.input, dir.output);
            results.forEach(result => {
                totalOriginal += result.original;
                totalConverted += result.converted;
            });
        }

        console.log(''); // Add spacing
    }

    const totalReduction = ((totalOriginal - totalConverted) / totalOriginal * 100).toFixed(2);
    console.log('📊 OPTIMIZATION SUMMARY:');
    console.log(`   Original total: ${(totalOriginal / 1024).toFixed(2)}KB`);
    console.log(`   Optimized total: ${(totalConverted / 1024).toFixed(2)}KB`);
    console.log(`   Total reduction: ${totalReduction}% (${((totalOriginal - totalConverted) / 1024).toFixed(2)}KB saved)`);
}

main().catch(console.error);
