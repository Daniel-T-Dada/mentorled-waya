/**
 * API Error Handling Utilities
 * 
 * This file provides utilities for handling API errors, particularly known issues
 * with the backend that need special handling in the frontend.
 */

import { toast } from "sonner";
import { useState, useEffect } from "react";

// Known backend error messages and their user-friendly equivalents
const KNOWN_ERRORS = {
    // ChildWallet manager errors
    "AttributeError: 'ChildWalletManager' object has no attribute 'for_parent'": {
        message: "Unable to retrieve wallet information. Please try again later.",
        isBackendIssue: true,
    },
    "500 Internal Server Error": {
        message: "The server encountered an error. Our team has been notified.",
        isBackendIssue: true,
    },
    // Missing endpoints
    "404 Not Found": {
        message: "This feature is not yet available. Please check back later.",
        isBackendIssue: true,
    },
    // Connection issues
    "Failed to fetch": {
        message: "Unable to connect to the server. Please check your internet connection.",
        isBackendIssue: false,
    },
};

// Error type for API responses
export interface ApiError extends Error {
    status?: number;
    details?: any;
    isBackendIssue?: boolean;
}

/**
 * Format an error from an API response
 */
export const formatApiError = (error: any): ApiError => {
    const apiError = error as ApiError;

    // Check for known backend issues
    for (const [errorText, errorInfo] of Object.entries(KNOWN_ERRORS)) {
        if (error.message?.includes(errorText)) {
            apiError.message = errorInfo.message;
            apiError.isBackendIssue = errorInfo.isBackendIssue;
            return apiError;
        }
    }

    // Default error handling
    if (!apiError.message) {
        apiError.message = "An unexpected error occurred";
    }

    return apiError;
};

/**
 * Handle API errors with appropriate messaging
 */
export const handleApiError = (error: any, fallbackMessage = "An error occurred"): ApiError => {
    const formattedError = formatApiError(error);

    // Show toast with error message
    toast.error(formattedError.message || fallbackMessage, {
        description: formattedError.isBackendIssue ? "Backend Issue" : "Error",
    });

    // Log detailed error information for debugging
    console.error("API Error:", {
        message: formattedError.message,
        status: formattedError.status,
        details: formattedError.details,
        isBackendIssue: formattedError.isBackendIssue,
        originalError: error,
    });

    return formattedError;
};

/**
 * Safely fetch data from API with error handling
 * @example
 * const { data, error, isLoading } = useSafeApiCall(async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * });
 */
export const useSafeApiCall = <T>(
    apiCall: () => Promise<T>,
    options = { fallbackMessage: "Failed to fetch data" }
) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<ApiError | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await apiCall();
                setData(result);
            } catch (e) {
                const formattedError = handleApiError(e, options.fallbackMessage);
                setError(formattedError);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [apiCall, options.fallbackMessage]);

    return { data, error, isLoading };
};
