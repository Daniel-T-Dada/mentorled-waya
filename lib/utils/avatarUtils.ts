import { getBaseApiUrl } from './api';

/**
 * Convert a relative avatar path to a full URL
 * @param avatarPath - The avatar path from the user data (can be relative or absolute)
 * @returns Full URL for the avatar image
 */
export const getAvatarUrl = (avatarPath: string | null | undefined): string | undefined => {
    if (!avatarPath) return undefined;
    
    // Trim whitespace
    const trimmedPath = avatarPath.trim();
    if (!trimmedPath) return undefined;
    
    // If the path is already a full URL (starts with http or https), return as is
    // This handles OAuth providers like Google, Facebook, etc.
    if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
        return trimmedPath;
    }
    
    // If the path starts with /media/ or similar, it's a relative path from the backend
    if (trimmedPath.startsWith('/')) {
        const baseUrl = getBaseApiUrl();
        return `${baseUrl}${trimmedPath}`;
    }
    
    // If it's just a filename, assume it's in the media folder
    const baseUrl = getBaseApiUrl();
    return `${baseUrl}/media/${trimmedPath}`;
};

/**
 * Check if the avatar URL is from an OAuth provider
 * @param avatarPath - The avatar path to check
 * @returns True if it's from an OAuth provider (Google, Facebook, etc.)
 */
export const isOAuthAvatar = (avatarPath: string | null | undefined): boolean => {
    if (!avatarPath) return false;
    
    const oauthDomains = [
        'lh3.googleusercontent.com',
        'graph.facebook.com',
        'avatars.githubusercontent.com',
        'cdn.discordapp.com'
    ];
    
    return oauthDomains.some(domain => avatarPath.includes(domain));
};

/**
 * Check if the avatar URL is from the backend/local storage
 * @param avatarPath - The avatar path to check
 * @returns True if it's from the backend
 */
export const isBackendAvatar = (avatarPath: string | null | undefined): boolean => {
    if (!avatarPath) return false;
    
    return avatarPath.includes('/media/') || 
           (!avatarPath.startsWith('http') && !isOAuthAvatar(avatarPath));
};

/**
 * Get debug information about an avatar URL
 * @param avatarPath - The avatar path to analyze
 * @returns Debug information object
 */
export const getAvatarDebugInfo = (avatarPath: string | null | undefined) => {
    const fullUrl = getAvatarUrl(avatarPath);
    
    return {
        originalPath: avatarPath,
        fullUrl,
        isOAuth: isOAuthAvatar(avatarPath),
        isBackend: isBackendAvatar(avatarPath),
        isEmpty: !avatarPath || avatarPath.trim() === '',
        baseUrl: getBaseApiUrl()
    };
};
