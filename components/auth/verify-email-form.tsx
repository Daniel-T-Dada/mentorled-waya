"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { useRouter, useSearchParams } from "next/navigation";

interface VerifyEmailFormProps {
  email?: string;
  token?: string;
  uidb64?: string;
}

export function VerifyEmailForm({ email, token, uidb64 }: VerifyEmailFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "waiting">("loading");
  const [error, setError] = useState<string>("");

  // Allow for the parameters to come from URL search params if not provided as props
  const emailParam = email || searchParams.get('email') || '';
  const tokenParam = token || searchParams.get('token') || '';
  const uidb64Param = uidb64 || searchParams.get('uidb64') || '';

  useEffect(() => {
    const verifyToken = async () => {
      console.log('VerifyEmailForm mounted with:', { email: emailParam, token: tokenParam, uidb64: uidb64Param });

      try {
        if (!tokenParam || !uidb64Param) {
          console.log('Missing token or uidb64:', { token: tokenParam, uidb64: uidb64Param });
          setStatus("waiting");
          return;
        }

        // Email might be missing from params but we can still proceed with verification
        // The backend should be able to verify with just token and uidb64
        if (!emailParam) {
          console.log('Email parameter is missing, but continuing with verification attempt');
        }

        // Directly verify with the API instead of using NextAuth to avoid creating a session
        console.log('Attempting to verify email via direct API...');
        const baseUrl = getApiUrl(API_ENDPOINTS.VERIFY_EMAIL);
        const apiUrl = `${baseUrl}/${uidb64Param}/${tokenParam}`;

        console.log('Verification API URL:', apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json"
          }
        });

        console.log('Verification response status:', response.status);

        if (response.ok) {
          try {
            const responseData = await response.json();
            console.log('Verification response data:', responseData);
          } catch {
            console.log('Verification successful but response is not JSON');
          }

          console.log('Email verification successful via API');
          setStatus("success");
          return;
        }

        // Handle error response
        try {
          const responseData = await response.json();
          console.log('Verification error response data:', responseData);
          const errorMessage = responseData.detail || responseData.message || "Failed to verify email";
          console.error('Verification failed:', errorMessage);
          throw new Error(errorMessage);
        } catch {
          // If error response is not JSON
          const text = await response.text();
          console.error('Non-JSON error response:', text.substring(0, 200));
          throw new Error(`Verification failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus("error");
        setError(error instanceof Error ? error.message : "Failed to verify email");
      }
    };

    verifyToken();
  }, [emailParam, tokenParam, uidb64Param]);

  const handleResendEmail = async () => {
    try {
      setStatus("loading");
      const response = await fetch(getApiUrl(API_ENDPOINTS.RESEND_VERIFICATION), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailParam }),
      });

      console.log('Resend verification response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to resend verification email");
      }

      setStatus("waiting");
    } catch (error) {
      setStatus("error");
      setError(error instanceof Error ? error.message : "Failed to resend verification email");
    }
  };

  // Mask email for privacy - handle case when email is missing
  const maskedEmail = emailParam ? emailParam.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "your email";

  // For development testing only - allows bypassing the email verification
  const handleDevBypass = async () => {
    if (process.env.NODE_ENV !== 'development') return;

    try {
      console.log('Using developer bypass to mark email as verified');
      setStatus("success");
    } catch (error) {
      console.error('Developer bypass error:', error);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg">Verifying your email...</p>
      </div>
    );
  }

  if (status === "waiting") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-blue-100 p-3">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Check Your Email</h2>
        <p className="text-center text-gray-600">
          We&apos;ve sent a verification email to {maskedEmail}. Please check your inbox and click the
          verification link to continue.
        </p>
        <Button
          onClick={handleResendEmail}
          variant="outline"
          className="w-full"
        >
          Resend Verification Email
        </Button>

        {process.env.NODE_ENV === 'development' && (
          <Button
            onClick={handleDevBypass}
            variant="destructive"
            className="w-full mt-2"
            size="sm"
          >
            [DEV] Mark as Verified
          </Button>
        )}
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-green-100 p-3">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Email Verified!</h2>
        <p className="text-center text-gray-600">
          Your email has been successfully verified. You can now log in to your account.
        </p>
        <Button
          onClick={() => router.push("/auth/signin")}
          className="w-full"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-red-100 p-3">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Verification Failed</h2>
        <p className="text-center text-gray-600">{error}</p>
        <Button
          onClick={handleResendEmail}
          variant="outline"
          className="w-full"
        >
          Resend Verification Email
        </Button>
      </div>
    );
  }

  return null;
}

export default VerifyEmailForm; 