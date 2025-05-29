"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { useRouter } from "next/navigation";

interface VerifyEmailFormProps {
  email: string;
  token: string;
  uidb64: string;
}

export function VerifyEmailForm({ email, token, uidb64 }: VerifyEmailFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "waiting">("loading");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const verifyToken = async () => {
      console.log('VerifyEmailForm mounted with props:', { email, token, uidb64 });

      try {
        if (!token || !uidb64) {
          console.log('Missing token or uidb64:', { token, uidb64 });
          setStatus("waiting");
          return;
        }

        if (!email) {
          console.log('Missing email parameter');
          setStatus("error");
          setError("Email parameter is missing");
          return;
        }

        console.log('Attempting to verify email with:', { uidb64, token, email });
        const apiUrl = getApiUrl(API_ENDPOINTS.VERIFY_EMAIL);
        console.log('Making request to:', apiUrl);

        const requestBody = {
          uidb64,
          token
        };
        console.log('Request body:', requestBody);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(requestBody)
        });

        console.log('Verification response status:', response.status);
        const responseData = await response.json();
        console.log('Verification response data:', responseData);

        if (!response.ok) {
          const errorMessage = responseData.detail || responseData.message || "Failed to verify email";
          console.error('Verification failed:', errorMessage);
          throw new Error(errorMessage);
        }

        console.log('Email verification successful');
        setStatus("success");
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus("error");
        setError(error instanceof Error ? error.message : "Failed to verify email");
      }
    };

    verifyToken();
  }, [email, token, uidb64]);

  const handleResendEmail = async () => {
    try {
      setStatus("loading");
      const response = await fetch(getApiUrl(API_ENDPOINTS.RESEND_VERIFICATION), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

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

  // Mask email for privacy
  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

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