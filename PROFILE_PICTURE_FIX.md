# User Profile Picture Issue - Analysis & Fix

## Issue Summary

User profile pictures from OAuth providers (Google, Facebook) were not displaying in the sidebar and dashboard navbar components.

## Root Cause Analysis

### Primary Issue

The main problem was in the NextAuth configuration in `auth.ts` file, specifically in the `signIn` callback. When users authenticated via OAuth providers, the system was not capturing and storing the profile images provided by these services.

### Secondary Issues

1. **Missing Profile Data Capture**: The `signIn` callback didn't access the `profile` parameter which contains the user's profile image from OAuth providers.
2. **Incomplete JWT Token Handling**: The JWT callback wasn't properly handling profile images for OAuth users.
3. **Missing Error Handling**: Avatar components lacked proper error handling and logging for troubleshooting.

## Changes Made

### 1. Fixed OAuth Profile Image Capture (`auth.ts`)

**Before:**

```typescript
async signIn({ user, account }) {
    if (account?.provider === "google" || account?.provider === "facebook") {
        user.role = "parent";
        user.emailVerified = new Date();
    }
    return true;
}
```

**After:**

```typescript
async signIn({ user, account, profile }) {
    if (account?.provider === "google" || account?.provider === "facebook") {
        user.role = "parent";
        user.emailVerified = new Date();

        // Capture profile image from OAuth providers
        if (profile?.picture) {
            user.avatar = profile.picture;
        } else if (user.image) {
            user.avatar = user.image;
        }

        console.log("OAuth user profile image:", user.avatar);
    }
    return true;
}
```

### 2. Enhanced JWT Token Handling (`auth.ts`)

Added proper OAuth profile image handling in the JWT callback:

```typescript
async jwt({ token, user, account, profile }) {
    // ... existing user handling ...

    // Handle OAuth providers - capture profile image on first login
    if (account?.provider === "google" || account?.provider === "facebook") {
        if (profile?.picture && !token.avatar) {
            token.avatar = profile.picture;
        }
    }

    return token;
}
```

### 3. Improved Google OAuth Configuration (`auth.ts`)

Added explicit scope configuration to ensure profile information is requested:

```typescript
Google({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorization: {
    params: {
      scope: "openid email profile",
    },
  },
});
```

### 4. Enhanced Error Handling and Debugging

**AppSidebar.tsx:**

- Added `referrerPolicy="no-referrer"` to handle cross-origin image requests
- Added comprehensive error logging
- Added user data debugging

**DashboardNavbar.tsx:**

- Added `referrerPolicy="no-referrer"` to handle cross-origin image requests
- Added comprehensive error logging
- Added user data debugging

## How OAuth Profile Images Work

1. **User Signs In**: User clicks "Sign in with Google" button
2. **OAuth Redirect**: User is redirected to Google's OAuth server
3. **User Grants Permission**: User grants access to profile information
4. **Google Returns Data**: Google returns user data including:

   - `profile.picture` - The user's profile image URL
   - `user.image` - Alternative image property
   - `profile.name` - User's display name
   - `profile.email` - User's email address

5. **NextAuth Processing**: Our `signIn` callback now captures the profile image
6. **Session Storage**: The avatar URL is stored in the JWT token and session
7. **Component Display**: Avatar components now receive and display the image URL

## Testing the Fix

### For New OAuth Users:

1. Sign out if currently logged in
2. Sign in using "Sign in with Google"
3. Profile picture should now appear in sidebar and navbar

### For Existing OAuth Users:

Since existing users may not have avatar data in their sessions, they should:

1. Sign out completely
2. Sign back in with Google/Facebook
3. The profile image should now be captured and displayed

### Debugging

Added console logging to track avatar data:

- Check browser console for "OAuth user profile image:" messages
- Check for "AppSidebar - User data:" and "DashboardNavbar - User data:" logs
- Error messages will appear if image loading fails

## Environment Variables Required

Ensure these are set in your environment:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id (if using Facebook)
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret (if using Facebook)
```

## Additional Notes

- **CORS Handling**: Added `referrerPolicy="no-referrer"` to handle cross-origin image requests from Google/Facebook
- **Fallback Handling**: If profile image fails to load, the system falls back to user initials
- **Performance**: Images are loaded lazily in the navbar component
- **Security**: Using proper referrer policies for external image requests

## Future Improvements

1. **Image Caching**: Consider implementing image caching for better performance
2. **Default Avatars**: Add support for custom default avatar images
3. **Image Optimization**: Use Next.js Image component for better optimization
4. **Profile Updates**: Allow users to change their profile pictures after OAuth sign-in
