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

/**
 * Intercept and transform NextAuth error codes to user-friendly messages
 */
export function interceptNextAuthError(error: string): string {
    // Common NextAuth error codes that we want to transform
    const errorMappings: Record<string, string> = {
        'Configuration': 'There was a problem with the authentication setup. Please try refreshing the page.',
        'AccessDenied': 'Access was denied. Please make sure you have permission to access this application.',
        'Verification': 'Email verification failed. The link may have expired or already been used.',
        'Default': 'Sign in failed. Please check your credentials and try again.',
        'Signin': 'Sign in failed. Please check your credentials and try again.',
        'OAuthSignin': 'Authentication service error. Please try a different sign-in method.',
        'OAuthCallback': 'Authentication service error. Please try a different sign-in method.',
        'OAuthCreateAccount': 'Unable to create account with this provider. Please try a different method.',
        'EmailCreateAccount': 'Unable to create account with this email. Please try a different method.',
        'Callback': 'Authentication callback failed. Please try again.',
        'OAuthAccountNotLinked': 'This account is already linked to a different authentication method. Please use your original sign-in method.',
        'EmailSignin': 'Email sign-in failed. Please check the link in your email or request a new one.',
        'CredentialsSignin': 'Invalid credentials. Please check your email and password.',
        'SessionRequired': 'Please sign in to access this page.',
    };

    // Check if the error matches any of our known NextAuth errors
    for (const [errorCode, message] of Object.entries(errorMappings)) {
        if (error.toLowerCase().includes(errorCode.toLowerCase())) {
            return message;
        }
    }

    // If it's not a known NextAuth error, return the original error
    return error;
}

/**
 * Enhanced error parser that matches the Django backend error patterns
 */
export function parseBackendError(error: any): string {
    // Extract the actual error message from various response formats
    let errorMessage = '';

    // Handle different error response structures from Django/DRF
    if (error?.response?.data) {
        const data = error.response.data;        // Handle DRF serializer validation errors (field-specific)
        if (data.errors && typeof data.errors === 'object') {
            const fieldErrors = Object.values(data.errors)
                .map((messages) => {
                    const errorList = Array.isArray(messages) ? messages : [messages];
                    return errorList.join(', ');
                })
                .join('; ');
            errorMessage = fieldErrors;
        }
        // Handle DRF non-field errors
        else if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
            errorMessage = data.non_field_errors.join(', ');
        }
        // Handle standard Django error responses
        else if (data.detail) {
            errorMessage = data.detail;
        }
        else if (data.error) {
            errorMessage = data.error;
        }
        else if (data.message) {
            errorMessage = data.message;
        }        // Handle serializer errors from the backend
        else if (typeof data === 'object' && !Array.isArray(data)) {
            // Handle field validation errors
            const errors = Object.entries(data)
                .filter(([key]) => key !== 'detail' && key !== 'message')
                .map(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        return `${field}: ${messages.join(', ')}`;
                    }
                    return `${field}: ${messages}`;
                })
                .join('; ');
            errorMessage = errors || JSON.stringify(data);
        }
    }

    // Handle direct error messages
    if (!errorMessage && typeof error === 'string') {
        errorMessage = error;
    }

    // Handle error objects with message property
    if (!errorMessage && error?.message) {
        errorMessage = error.message;
    }

    return errorMessage || 'An unexpected error occurred.';
}

/**
 * Enhanced login error parser that matches Django backend responses
 */
export function parseLoginErrorEnhanced(error: any): string {
    const backendError = parseBackendError(error);
    const lowerError = backendError.toLowerCase();

    // Match specific Django backend error patterns

    // Authentication failed (from UserLoginView)
    if (lowerError.includes('invalid credentials')) {
        return "Invalid email or password. Please check your credentials and try again.";
    }

    // Account verification errors (from GoogleLoginView)
    if (lowerError.includes('account not verified')) {
        return "Please verify your email before logging in. Check your inbox for the verification link.";
    }

    // Google OAuth specific errors
    if (lowerError.includes('not registered as a parent')) {
        return "This Google account is not registered. Please sign up first or use a different account.";
    }

    if (lowerError.includes('only parents are allowed')) {
        return "Only parent accounts can access this application.";
    }

    // Access token errors
    if (lowerError.includes('access token is required')) {
        return "Authentication failed. Please try signing in again.";
    }

    if (lowerError.includes('failed to complete google login')) {
        return "Google sign-in failed. Please try again or use email/password.";
    }

    // Email verification required
    if (lowerError.includes('verify your email') || lowerError.includes('email verification')) {
        return "Please verify your email before logging in. Check your inbox for the verification link.";
    }

    // Account existence errors
    if (lowerError.includes('user with this email does not exist')) {
        return "No account found with this email address. Please check your email or sign up.";
    }

    // Password validation errors (from PasswordChangeSerializer)
    if (lowerError.includes('old password is not correct')) {
        return "Current password is incorrect. Please try again.";
    }

    // Rate limiting or temporary lockout
    if (lowerError.includes('too many') || lowerError.includes('rate limit')) {
        return "Too many login attempts. Please wait a few minutes before trying again.";
    }

    // Network/connection errors
    if (lowerError.includes('network') || lowerError.includes('connection')) {
        return "Network error. Please check your internet connection and try again.";
    }

    // Server errors (from CustomErrorHandlingMiddleware)
    if (lowerError.includes('internal server error') || lowerError.includes('server error')) {
        return "Server error. Our team has been notified. Please try again later.";
    }

    // Permission errors
    if (lowerError.includes('permission denied')) {
        return "Access denied. Please make sure you have permission to access this application.";
    }

    // Return the processed backend error or a fallback
    return backendError || "Authentication failed. Please try again.";
}

/**
 * Enhanced signup error parser that matches Django backend responses
 */
export function parseSignupErrorEnhanced(error: any): string {
    const backendError = parseBackendError(error);
    const lowerError = backendError.toLowerCase();

    // Match specific Django backend error patterns

    // Email already exists (from UserRegistrationSerializer)
    if (lowerError.includes('user with this email already exists')) {
        return "An account with this email already exists. Please sign in or use a different email address.";
    }

    // Password validation errors (from validate_password)
    if (lowerError.includes("password fields didn't match")) {
        return "Passwords do not match. Please make sure both password fields are identical.";
    }

    if (lowerError.includes('password') && (lowerError.includes('too short') || lowerError.includes('too common') || lowerError.includes('too similar'))) {
        return "Password doesn't meet security requirements. Please use at least 8 characters with a mix of letters, numbers, and symbols.";
    }

    // Terms acceptance error
    if (lowerError.includes('must accept the terms')) {
        return "You must accept the Terms and Conditions to create an account.";
    }

    // Email validation errors
    if (lowerError.includes('enter a valid email')) {
        return "Please enter a valid email address.";
    }

    // Email sending errors (from UserRegistrationView)
    if (lowerError.includes('failed to send verification email')) {
        return "Account created but verification email failed to send. Please try resending from the verification page.";
    }

    // Server errors during registration
    if (lowerError.includes('server error') || lowerError.includes('internal server error')) {
        return "Server error during registration. Our team has been notified. Please try again later.";
    }

    // Validation errors (from serializers)
    if (lowerError.includes('this field is required')) {
        return "Please fill in all required fields.";
    }

    // Return the processed backend error or a fallback
    return backendError || "There was a problem creating your account. Please try again.";
}

/**
 * Enhanced kid login error parser that matches Django backend responses
 */
export function parseKidLoginErrorEnhanced(error: any): string {
    const backendError = parseBackendError(error);
    const lowerError = backendError.toLowerCase();

    // Match specific Django backend error patterns from ChildLoginView

    // Invalid credentials (from ChildLoginView and ChildLoginSerializer)
    if (lowerError.includes('invalid credentials') || lowerError.includes('invalid username or pin')) {
        return "Invalid username or PIN. Please check with your parent or try again.";
    }

    // PIN validation errors (from ChildLoginSerializer)
    if (lowerError.includes('pin must contain only digits')) {
        return "PIN must contain only numbers. Please try again.";
    }

    if (lowerError.includes('pin must be exactly 4 digits')) {
        return "PIN must be exactly 4 digits. Please try again.";
    }

    // Username validation
    if (lowerError.includes('username') && lowerError.includes('required')) {
        return "Please enter your username.";
    }

    // Return the processed backend error or a fallback
    return backendError || "Invalid username or PIN. Please try again.";
}