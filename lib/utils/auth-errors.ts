/**
 * Helper functions for handling authentication errors
 */

/**
 * Parse login errors into user-friendly messages
 */
export function parseLoginError(error: string): string {
    // Email verification errors
    if (error.includes("verify your email")) {
        return "Please verify your email before logging in. Check your inbox for the verification link or <a href='/auth/verify-email' class='text-blue-500 hover:underline'>request a new one</a>.";
    }

    // Account existence errors
    if (error.includes("not found") || error.includes("no user")) {
        return "No account found with this email address. Please check your email or <a href='/auth/signup' class='text-blue-500 hover:underline'>sign up</a>.";
    }

    // Password errors
    if (error.includes("password") || error.includes("credentials")) {
        return "Incorrect password. Please try again or <a href='/auth/forgot-password' class='text-blue-500 hover:underline'>reset your password</a>.";
    }

    // Rate limiting or account locking
    if (error.includes("many attempts") || error.includes("locked")) {
        return "Too many failed login attempts. Please try again later or <a href='/auth/forgot-password' class='text-blue-500 hover:underline'>reset your password</a>.";
    }

    // Network errors
    if (error.includes("network") || error.includes("connection")) {
        return "Network error. Please check your internet connection and try again.";
    }

    // Server errors
    if (error.includes("server") || error.includes("internal")) {
        return "Server error. Our team has been notified. Please try again later.";
    }

    // Fallback error message
    return error || "Authentication failed. Please try again.";
}

/**
 * Parse signup errors into user-friendly messages
 */
export function parseSignupError(error: string): string {
    // Email already exists
    if (error.includes("already exists") || error.includes("already in use")) {
        return "An account with this email already exists. Please <a href='/auth/signin' class='text-blue-500 hover:underline'>sign in</a> or use a different email address.";
    }

    // Password requirements
    if (error.includes("password") && (error.includes("requirements") || error.includes("weak"))) {
        return "Password doesn't meet security requirements. Please use at least 6 characters with a mix of letters and numbers.";
    }

    // Network errors
    if (error.includes("network") || error.includes("connection")) {
        return "Network error. Please check your internet connection and try again.";
    }

    // Validation errors
    if (error.includes("validation") || error.includes("invalid")) {
        return "Please check your information and try again. All fields must be filled correctly.";
    }

    // Server errors
    if (error.includes("server") || error.includes("internal")) {
        return "Server error. Our team has been notified. Please try again later.";
    }

    // Fallback error message
    return error || "There was a problem creating your account. Please try again.";
}

/**
 * Parse kid login errors into user-friendly messages
 */
export function parseKidLoginError(error: string): string {
    // Account existence errors
    if (error.includes("not found") || error.includes("no user")) {
        return "No account found with this username. Please check with your parent or <a href='/auth/signin' class='text-blue-500 hover:underline'>switch to parent login</a>.";
    }

    // PIN errors
    if (error.includes("pin") || error.includes("credentials")) {
        return "Incorrect PIN. Please try again or ask your parent to help.";
    }

    // Fallback error message
    return "Invalid username or PIN. Please try again.";
}

/**
 * Parse password reset errors into user-friendly messages
 */
export function parsePasswordResetError(error: string): string {
    // Network errors
    if (error.includes("network") || error.includes("connection")) {
        return "Network error. Please check your internet connection and try again.";
    }

    // Rate limiting
    if (error.includes("rate limit") || error.includes("too many")) {
        return "Too many requests. Please wait a moment before trying again.";
    }

    // For security, we avoid revealing if an email exists
    if (error.includes("invalid") || error.includes("not found")) {
        return "If an account exists with that email, we've sent password reset instructions. <a href='/auth/signin' class='text-blue-500 hover:underline'>Return to sign in</a>.";
    }

    // Fallback error message
    return "Something went wrong with your request. Please try again later.";
} 