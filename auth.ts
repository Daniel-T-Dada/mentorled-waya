import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { ZodError } from "zod";
import { ParentSignInSchema, KidSignInSchema, SignUpSchema } from "./schemas";
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
            accessToken?: string;
            refreshToken?: string;
            verification?: {
                token?: string;
                uidb64?: string;
                message?: string;
                needsVerification?: boolean;
            } | null;
        }
    }interface User {
        id: string;
        name?: string;
        email?: string;
        username?: string;
        role: string;
        emailVerified?: Date | null;
        parentId?: string;
        avatar?: string | null;
        accessToken?: string;
        refreshToken?: string;
        verification?: {
            token?: string;
            uidb64?: string;
            message?: string;
            needsVerification?: boolean;
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
            authorization: {
                params: {
                    scope: "openid email profile"
                }
            }
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        }), CredentialsProvider({
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
                        }); if (!response.ok) {
                            const data = await response.json();
                            if (data.email && Array.isArray(data.email)) {
                                if (data.email[0].includes('already exists')) {
                                    throw new Error('This email is already registered. Please use a different email or sign in.');
                                }
                            }
                            throw new Error(data.detail || "Failed to sign up");
                        }

                        let data;
                        try {
                            data = await response.json();
                            console.log("Signup response data:", data);
                        } catch (parseError) {
                            console.error("Error parsing signup response:", parseError);
                            throw new Error("Received invalid response from server");
                        }

                        // According to API documentation, signup returns:
                        // Response (201): { "message": "Registration successful! Check your email to verify your account." }
                        // For our frontend, we need to return user-like data for the session

                        return {
                            id: data.user?.id || 'temp-id', // Temporary ID until email verification
                            name: validatedData.fullName,
                            email: validatedData.email,
                            role: 'parent',
                            emailVerified: null, // Not verified until email confirmation
                            avatar: null,
                            
                            // Include verification data from the response if available
                            verification: {
                                message: data.message,
                                needsVerification: true
                            }
                        };
                    }

                    // Handle email verification
                    if (credentials.token && credentials.uidb64) {
                        const response = await fetch(getApiUrl(API_ENDPOINTS.VERIFY_EMAIL), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                uidb64: credentials.uidb64,
                                token: credentials.token,
                            }),
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.message || "Failed to verify email");
                        }

                        const data = await response.json();

                        return {
                            id: data.id || '',
                            name: data.name,
                            email: data.email,
                            role: data.role || 'parent',
                            emailVerified: new Date(),
                            avatar: data.avatar || null,
                        };
                    }

                    // Handle login
                    if (credentials.email && credentials.password) {
                        const validatedData = ParentSignInSchema.parse({
                            email: credentials.email,
                            password: credentials.password,
                        });

                        try {
                            const response = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
                                method: "POST",
                                headers: {
                                    'accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'X-CSRFTOKEN': credentials.csrfToken?.toString() || ''
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                    email: validatedData.email,
                                    password: validatedData.password
                                }),
                            });

                            const data = await response.json();

                            if (!response.ok) {
                                // Handle specific error cases
                                if (data.detail === "Invalid credentials") {
                                    throw new Error("Invalid email or password. Please try again.");
                                }

                                // Handle email not verified error
                                if (response.status === 403 && data.error === 'email_not_verified') {
                                    // Include verification needs in the error message
                                    throw new Error(`${data.message || "Please verify your email address before logging in."}`);
                                }

                                throw new Error(data.detail || data.error || "Failed to log in");
                            }
                            // Handle the API response format from documentation
                            // Response: { "id": "uuid", "name": "string", "email": "string", "avatar": null, "token": "jwt", "refresh": "jwt" }

                            return {
                                id: data.id || '',
                                name: data.name || '',
                                email: data.email || '',
                                role: 'parent', // Parent login always returns parent role
                                emailVerified: new Date(), // If login succeeds, email is verified
                                avatar: data.avatar || null,
                                // Store JWT tokens for future API calls
                                accessToken: data.token,
                                refreshToken: data.refresh
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







        CredentialsProvider({
            id: "kid-credentials",
            name: "Kid Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                pin: { label: "PIN", type: "password" },
            }, async authorize(credentials) {
                console.log("Kid credentials received:", credentials);

                if (!credentials || !credentials.username || !credentials.pin) {
                    console.log("Missing kid credentials");
                    return null;
                }

                try {
                    // Validate with schema
                    const validatedData = KidSignInSchema.parse({
                        username: credentials.username,
                        pin: credentials.pin,
                    });

                    // Call the backend API for child login
                    const response = await fetch(getApiUrl(API_ENDPOINTS.CHILD_LOGIN), {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'accept': 'application/json'
                        },
                        body: JSON.stringify({
                            username: validatedData.username,
                            pin: validatedData.pin,
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        // Handle specific error cases from API documentation
                        if (response.status === 401) {
                            console.log("Invalid kid credentials from API");
                            throw new Error("Invalid username or PIN. Please try again.");
                        }

                        throw new Error(data.detail || data.error || "Failed to log in");
                    }

                    // According to the API documentation, child login returns:
                    // { "childId": "uuid", "token": "jwt", "refresh": "jwt" }
                    return {
                        id: data.childId,
                        name: data.username || validatedData.username, // API doesn't return name, use username
                        username: validatedData.username,
                        role: 'kid',
                        emailVerified: new Date(), // Kids don't need email verification
                        avatar: null,
                        // Store the JWT token for later use if needed
                        accessToken: data.token,
                        refreshToken: data.refresh
                    };

                } catch (error) {
                    console.error("Kid authorization error:", error);
                    if (error instanceof Error) {
                        throw error;
                    }
                    return null;
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
    }, callbacks: {
        async signIn({ user, account, profile }) {

            // For OAuth providers (Google, Facebook), assign parent role by default
            if (account?.provider === "google" || account?.provider === "facebook") {
                console.log("OAuth sign-in detected, assigning parent role");
                console.log("OAuth account data:", account);
                console.log("OAuth profile data:", profile);

                user.role = "parent";
                user.emailVerified = new Date(); // OAuth users are considered verified

                // Capture profile image from OAuth providers
                if (profile?.picture) {
                    user.avatar = profile.picture;
                    console.log("Profile image set from profile.picture:", profile.picture);
                } else if (user.image) {
                    user.avatar = user.image;
                    console.log("Profile image set from user.image:", user.image);
                } else {
                    console.log("No profile image found in OAuth data");
                }

                console.log("Final OAuth user data:", user);
            }
            return true;
        },

        async session({ session, token }) {
            if (token.sub) {
                session.user.id = token.sub;

                // Default to parent for OAuth users
                session.user.role = (token.role as string) || "parent"; 
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

                console.log("Session callback - final session user:", {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                    avatar: session.user.avatar,
                    role: session.user.role
                });
            }
            return session;
        },

        async jwt({ token, user, account, profile }) {
            if (user) {
                console.log("JWT callback - processing user:", {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role
                });

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

            // Handle OAuth providers - capture profile image on first login
            if (account?.provider === "google" || account?.provider === "facebook") {
                console.log("JWT callback - OAuth provider detected:", account.provider);
                if (profile?.picture && !token.avatar) {
                    console.log("JWT callback - setting avatar from profile:", profile.picture);
                    token.avatar = profile.picture;
                }
            }

            console.log("JWT callback - final token avatar:", token.avatar);
            return token;
        },
    },
    debug: process.env.NODE_ENV === 'development',
})