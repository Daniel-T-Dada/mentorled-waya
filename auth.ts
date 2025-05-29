import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { ZodError } from "zod";
import { ParentSignInSchema, SignUpSchema } from "./schemas";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';


declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string;
            email?: string | null;
            username?: string;
            role: string;
            emailVerified?: Date | null;
            parentId?: string;
            avatar?: string | null;
            verification?: {
                token: string;
                uidb64: string;
            } | null;
        }
    }

    interface User {
        id: string;
        name?: string;
        email?: string;
        username?: string;
        role: string;
        emailVerified?: Date | null;
        parentId?: string;
        avatar?: string | null;
        verification?: {
            token: string;
            uidb64: string;
        } | null;
    }
}

declare module "@auth/core/jwt" {
    interface JWT extends DefaultJWT {
        role?: string;
        email?: string;
        avatar?: string | null;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        }),
        CredentialsProvider({
            id: "parent-credentials",
            name: "Parent Credentials",
            credentials: {
                name: { label: "Name", type: "text" },
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                confirmPassword: { label: "Confirm Password", type: "password" },
                token: { label: "Token", type: "text" },
                uidb64: { label: "User ID", type: "text" },
                csrfToken: { label: "CSRF Token", type: "text" },
            },
            async authorize(credentials) {
                console.log("Received credentials:", credentials);

                if (!credentials) {
                    console.log("No credentials provided");
                    return null;
                }

                try {
                    // Handle signup
                    if (credentials.name && credentials.email && credentials.password && credentials.confirmPassword) {
                        const validatedData = SignUpSchema.parse({
                            fullName: credentials.name,
                            email: credentials.email,
                            password: credentials.password,
                            confirmPassword: credentials.confirmPassword,
                            agreeToTerms: true,
                        });

                        const response = await fetch(getApiUrl(API_ENDPOINTS.SIGNUP), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                full_name: validatedData.fullName,
                                email: validatedData.email,
                                password: validatedData.password,
                                password2: validatedData.confirmPassword,
                                terms_accepted: true,
                            }),
                        });

                        if (!response.ok) {
                            try {
                                const data = await response.json();
                                if (data.email && Array.isArray(data.email)) {
                                    if (data.email[0].includes('already exists')) {
                                        throw new Error('This email is already registered. Please use a different email or sign in.');
                                    }
                                }
                                throw new Error(data.detail || "Failed to sign up");
                            } catch (parseError) {
                                // Handle non-JSON responses
                                console.error("Non-JSON response from signup API:", parseError);
                                const text = await response.text();
                                console.log("Response text:", text.substring(0, 500)); // Log first 500 chars
                                throw new Error(`Failed to sign up. Server response status: ${response.status}`);
                            }
                        }

                        let data;
                        try {
                            data = await response.json();
                            console.log("Signup response data:", data);
                        } catch (parseError) {
                            console.error("Error parsing signup response:", parseError);
                            throw new Error("Received invalid response from server");
                        }

                        // Return the user data with verification data included
                        return {
                            id: data.id || '',
                            name: data.full_name || '',
                            email: data.email || '',
                            role: data.role || 'parent',
                            emailVerified: data.is_verified ? new Date() : null,
                            avatar: data.avatar || null,
                            // Include verification data
                            verification: {
                                token: data.token,
                                uidb64: data.uidb64,
                                email_sent: data.verification_email_sent
                            }
                        };
                    }

                    // Handle email verification
                    if (credentials.token && credentials.uidb64) {
                        console.log('Handling email verification with:', { token: credentials.token, uidb64: credentials.uidb64 });

                        // Use the correct URL format for verification - no trailing slash
                        const baseUrl = getApiUrl(API_ENDPOINTS.VERIFY_EMAIL);
                        const verifyUrl = `${baseUrl}/${credentials.uidb64}/${credentials.token}`;

                        console.log('Verification URL:', verifyUrl);

                        try {
                            const response = await fetch(verifyUrl, {
                                method: "GET",
                                headers: {
                                    "Accept": "application/json"
                                }
                            });

                            console.log('Verification response status:', response.status);

                            if (!response.ok) {
                                // Make a clone of the response before trying to read its body
                                const clonedResponse = response.clone();

                                try {
                                    const error = await clonedResponse.json();
                                    throw new Error(error.message || "Failed to verify email");
                                } catch (parseError) {
                                    // Handle non-JSON responses
                                    console.error("Non-JSON error response from verify-email API:", parseError);

                                    const text = await response.text();
                                    console.log("Error response text:", text.substring(0, 500)); // Log first 500 chars
                                    throw new Error(`Failed to verify email. Server response status: ${response.status}`);
                                }
                            }

                            let data;
                            try {
                                data = await response.json();
                                console.log('Verification response data:', data);
                            } catch {
                                // If the response is not JSON but the status was OK, we can still consider it a success
                                console.log("Verification successful but response is not JSON");
                                return {
                                    id: credentials.uidb64,
                                    name: "Verified User",
                                    email: "",
                                    role: "parent",
                                    emailVerified: new Date(),
                                    avatar: null,
                                };
                            }

                            return {
                                id: data.id || credentials.uidb64,
                                name: data.name || data.full_name || "Verified User",
                                email: data.email || "",
                                role: data.role || 'parent',
                                emailVerified: new Date(),
                                avatar: data.avatar || null,
                            };
                        } catch (error) {
                            console.error("Verification error:", error);
                            throw error;
                        }
                    }

                    // Handle login
                    if (credentials.email && credentials.password) {
                        const validatedData = ParentSignInSchema.parse({
                            email: credentials.email,
                            password: credentials.password,
                        });

                        try {
                            console.log("Attempting login with:", {
                                email: validatedData.email,
                                passwordLength: validatedData.password.length
                            });

                            const response = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
                                method: "POST",
                                headers: {
                                    // 'accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    // 'X-CSRFTOKEN': credentials.csrfToken?.toString() || ''
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                    email: validatedData.email,
                                    password: validatedData.password
                                }),
                            });

                            console.log("Login response status:", response.status);

                            // Try to parse response as JSON
                            let data;
                            try {
                                data = await response.json();
                                console.log("Login response data:", data);
                            } catch (parseError) {
                                console.error("Error parsing login response:", parseError);
                                const text = await response.text();
                                console.log("Login response text:", text.substring(0, 500));
                                throw new Error("Received invalid response from login server");
                            }

                            if (!response.ok) {
                                // Handle specific error cases
                                if (data.detail === "Invalid credentials") {
                                    console.log("Invalid credentials error from backend");
                                    throw new Error("Invalid email or password. Please try again.");
                                }

                                // Handle email not verified error
                                if (response.status === 403 && data.error === 'email_not_verified') {
                                    console.log("Email not verified error from backend");
                                    // Include verification needs in the error message
                                    throw new Error(`${data.message || "Please verify your email address before logging in."}`);
                                }

                                console.log("Other login error:", data);
                                throw new Error(data.detail || data.error || "Failed to log in");
                            }

                            // Handle the specific response format from the backend
                            const userData = data.user || data;
                            console.log("Login successful, user data:", userData);

                            return {
                                id: userData.id || '',
                                name: userData.full_name || userData.name,
                                email: userData.email,
                                role: userData.role || 'parent',



                                // Use is_verified from the response if available
                                emailVerified: userData.is_verified ? new Date() : null,
                                avatar: userData.avatar || null,
                                parentId: userData.parent_id || null,
                                username: userData.username || null



                            };
                        } catch (error) {
                            console.error('Login error:', error);
                            throw new Error(error instanceof Error ? error.message : 'Failed to log in');
                        }
                    }

                    return null;
                } catch (error) {
                    console.error("Authorization error:", error);
                    if (error instanceof ZodError) {
                        throw new Error(error.errors[0].message);
                    }
                    throw error;
                }
            }
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        error: '/auth/error',
        signOut: '/',
        verifyRequest: '/auth/verify-email', // Add verify-request page
    },

    callbacks: {
        async session({ session, token }) {
            if (token.sub) {
                session.user.id = token.sub;
                session.user.role = (token.role as string) || "user";
                session.user.email = (token.email as string) || "";
                session.user.name = token.name as string | undefined;
                session.user.emailVerified = token.emailVerified ? new Date(token.emailVerified as string) : null;
                session.user.avatar = token.avatar as string | null;
                // Add any additional user data from the token
                if (token.user) {
                    session.user = {
                        ...session.user,
                        ...token.user
                    };
                }
            }
            return session;
        },

        async jwt({ token, user }) {
            if (user) {
                // Store the complete user object in the token
                token.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    emailVerified: user.emailVerified,
                    avatar: user.avatar
                };
                // Also store individual fields for backward compatibility
                token.role = user.role;
                token.email = user.email;
                token.name = user.name;
                token.emailVerified = user.emailVerified;
                token.avatar = user.avatar;
            }
            return token;
        },
    },
    // Only enable debug mode in development
    debug: process.env.NODE_ENV === 'production',
})