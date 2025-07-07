/**
 * Test cases for avatar URL utilities
 * Run this in a browser console or Node.js environment to test
 */

import { getAvatarUrl, isOAuthAvatar, isBackendAvatar, getAvatarDebugInfo } from './avatarUtils';

// Mock the environment variable
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://127.0.0.1:8000';

console.log('Testing Avatar URL Utilities:');
console.log('=====================================');

// Test 1: Google OAuth avatar (full URL)
const googleAvatar = 'https://lh3.googleusercontent.com/a/ACg8ocK1234567890';
console.log('Test 1: Google OAuth Avatar');
console.log('Input:', googleAvatar);
console.log('Result:', getAvatarUrl(googleAvatar));
console.log('Is OAuth:', isOAuthAvatar(googleAvatar));
console.log('Is Backend:', isBackendAvatar(googleAvatar));
console.log('Expected: Same URL, true for OAuth, false for backend');
console.log('---');

// Test 2: Backend relative path
const backendAvatar = '/media/avatars/user123.jpg';
console.log('Test 2: Backend Relative Path');
console.log('Input:', backendAvatar);
console.log('Result:', getAvatarUrl(backendAvatar));
console.log('Is OAuth:', isOAuthAvatar(backendAvatar));
console.log('Is Backend:', isBackendAvatar(backendAvatar));
console.log('Expected: http://127.0.0.1:8000/media/avatars/user123.jpg, false for OAuth, true for backend');
console.log('---');

// Test 3: Just filename
const filename = 'profile.jpg';
console.log('Test 3: Just Filename');
console.log('Input:', filename);
console.log('Result:', getAvatarUrl(filename));
console.log('Is OAuth:', isOAuthAvatar(filename));
console.log('Is Backend:', isBackendAvatar(filename));
console.log('Expected: http://127.0.0.1:8000/media/profile.jpg, false for OAuth, true for backend');
console.log('---');

// Test 4: Null/undefined
console.log('Test 4: Null/Undefined/Empty');
console.log('Null:', getAvatarUrl(null));
console.log('Undefined:', getAvatarUrl(undefined));
console.log('Empty string:', getAvatarUrl(''));
console.log('Expected: undefined for all');
console.log('---');

// Test 5: Facebook OAuth avatar
const facebookAvatar = 'https://graph.facebook.com/1234567890/picture?type=large';
console.log('Test 5: Facebook OAuth Avatar');
console.log('Input:', facebookAvatar);
console.log('Result:', getAvatarUrl(facebookAvatar));
console.log('Is OAuth:', isOAuthAvatar(facebookAvatar));
console.log('Is Backend:', isBackendAvatar(facebookAvatar));
console.log('Expected: Same URL, true for OAuth, false for backend');
console.log('---');

// Test 6: Debug info
console.log('Test 6: Debug Info');
console.log('Google Debug Info:', getAvatarDebugInfo(googleAvatar));
console.log('Backend Debug Info:', getAvatarDebugInfo(backendAvatar));
console.log('Null Debug Info:', getAvatarDebugInfo(null));
console.log('---');

// Test 7: Edge cases
console.log('Test 7: Edge Cases');
const whitespaceAvatar = '  https://example.com/avatar.jpg  ';
console.log('Whitespace URL:', getAvatarUrl(whitespaceAvatar));
console.log('Expected: trimmed URL');

const githubAvatar = 'https://avatars.githubusercontent.com/u/123456?v=4';
console.log('GitHub Avatar:', getAvatarUrl(githubAvatar));
console.log('Is OAuth:', isOAuthAvatar(githubAvatar));
console.log('Expected: Same URL, true for OAuth');
