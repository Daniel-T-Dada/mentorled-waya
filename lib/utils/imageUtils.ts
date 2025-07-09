/**
 * Utility functions for image optimization
 */

/**
 * Simple blur placeholder data URL
 * A 10x10 pixel gray blur placeholder
 */
export const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyEcMvlIGkuoiIc/wAdR7zC0CmLZGGNZ8/1qJ8lQq5RLGJ1l77SJtyB7QrW5lKW1xayxKynlqwxPQbCqxqrj7j9J"

/**
 * Get blur placeholder for different image types
 */
export const getBlurPlaceholder = (type: 'light' | 'dark' | 'purple' = 'light') => {
    switch (type) {
        case 'dark':
            return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        case 'purple':
            return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAcEAACAQUBAAAAAAAAAAAAAAABAgADBAUGERIh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAVEQEBAAAAAAAAAAAAAAAAAAABEf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyEcMvlIGkuoiIc/wAdR7zC0CmLZGGNZ8/1qJ8lQq5RLGJ1l77SJtyB7QrW5lKW1xayxKynlqwxPQbCqxqrj7j9R"
        default:
            return blurDataURL
    }
}

/**
 * Get optimized sizes attribute for responsive images
 */
export const getImageSizes = (type: 'hero' | 'card' | 'icon' | 'full-width' = 'card') => {
    switch (type) {
        case 'hero':
            return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
        case 'icon':
            return "80px"
        case 'full-width':
            return "100vw"
        case 'card':
        default:
            return "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
    }
}
