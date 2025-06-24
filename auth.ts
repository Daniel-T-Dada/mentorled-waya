import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { ZodError } from "zod";
import { ParentSignInSchema, KidSignInSchema, SignUpSchema } from "./schemas";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { parseLoginErrorEnhanced, parseSignupErrorEnhanced, parseKidLoginErrorEnhanced } from '@/lib/utils/auth-errors';


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

            // Kid-specific fields
            childId?: string;
            childUsername?: string;
            isChild?: boolean;
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
        error?: string;
        verification?: {
            token?: string;
            uidb64?: string;
            message?: string;
            needsVerification?: boolean;
        } | null;

        // Kid-specific fields
        childId?: string;
        childUsername?: string;
        isChild?: boolean;
    }
}

declare module "@auth/core/jwt" {
    interface JWT extends DefaultJWT {
        role?: string;
        email?: string;
        avatar?: string | null;
        accessToken?: string;
        refreshToken?: string;
        error?: string;

        // Kid-specific fields
        childId?: string;
        childUsername?: string;
        isChild?: boolean;
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
                        }); if (!response.ok) {
                            const data = await response.json();
                            if (data.email && Array.isArray(data.email)) {
                                if (data.email[0].includes('already exists')) {
                                    return { id: 'signup-error', error: parseSignupErrorEnhanced('User with this email already exists'), role: 'parent' };
                                }
                            }
                            const detailMessage =
                                data?.detail ||
                                data?.message ||
                                Object.values(data || {}).flat().join(" ") || // collect all error strings if multiple
                                "Failed to sign up";

                            return { id: 'signup-error', error: detailMessage, role: 'parent' };
                        }

                        let data;
                        try {
                            data = await response.json();
                        } catch (parseError) {
                            const raw = await response.text();
                            console.error("Non-JSON API response:", raw);
                            return { id: 'signup-error', error: "Unexpected server response.", role: 'parent' };
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
                                    return { id: 'login-error', error: parseLoginErrorEnhanced('Invalid credentials'), role: 'parent' };
                                }

                                // Handle email not verified error
                                if (response.status === 403 && data.error === 'email_not_verified') {
                                    return { id: 'login-error', error: `${data.message || "Please verify your email address before logging in."}`, role: 'parent' };
                                }

                                return { id: 'login-error', error: data.detail || data.error || "Failed to log in", role: 'parent' };
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
                            const errorMessage = error instanceof Error ? error.message : 'Failed to log in';
                            return { id: 'login-error', error: parseLoginErrorEnhanced(errorMessage), role: 'parent' };
                        }
                    }

                    return null;
                } catch (error) {
                    console.error("Authorization error:", error);

                    // If this is a signup attempt, return an error object instead of throwing.
                    if (credentials?.name) {
                        let errorMessage = 'An error occurred during sign up.';
                        if (error instanceof ZodError) {
                            errorMessage = error.errors[0].message;
                        } else if (error instanceof Error) {
                            errorMessage = error.message;
                        }
                        return { id: 'signup-error', error: parseSignupErrorEnhanced(errorMessage), role: 'parent' };
                    }

                    // If this is a login attempt, return an error object instead of throwing.
                    if (credentials?.email && credentials?.password) {
                        let errorMessage = 'An error occurred during sign in.';
                        if (error instanceof ZodError) {
                            errorMessage = error.errors[0].message;
                        } else if (error instanceof Error) {
                            errorMessage = error.message;
                        }
                        return { id: 'login-error', error: parseLoginErrorEnhanced(errorMessage), role: 'parent' };
                    }

                    // For other cases, keep the old behavior of throwing errors.
                    if (error instanceof ZodError) {
                        const validationError = error.errors[0].message;
                        throw new Error(parseLoginErrorEnhanced(validationError));
                    }

                    // If the error is already formatted (from our earlier processing), keep it
                    if (error instanceof Error && error.message.includes('try again')) {
                        throw error;
                    }

                    // Otherwise, parse it as a login error
                    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
                    throw new Error(parseLoginErrorEnhanced(errorMessage));
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
                console.log("Kid login attempt:", { username: credentials?.username });

                if (!credentials?.username || !credentials?.pin) {
                    console.log("Missing kid credentials");
                    return null;
                }

                try {
                    // Import ChildrenService for kid authentication
                    const { ChildrenService } = await import('@/lib/services/childrenService');

                    // Call the kid login API
                    const kidLoginResponse = await ChildrenService.kidLogin({
                        username: credentials.username as string,
                        pin: credentials.pin as string
                    });

                    console.log("Kid login response:", kidLoginResponse);

                    // Return user object with kid context
                    return {
                        id: kidLoginResponse.parentId, // Use parent ID for session
                        name: kidLoginResponse.childUsername,
                        email: `${kidLoginResponse.childUsername}@kid.local`, // Dummy email for session
                        role: "kid",
                        emailVerified: new Date(),
                        avatar: null,
                        accessToken: kidLoginResponse.token,
                        refreshToken: kidLoginResponse.refresh,

                        // Kid-specific fields
                        childId: kidLoginResponse.childId,
                        childUsername: kidLoginResponse.childUsername,
                        parentId: kidLoginResponse.parentId,
                        isChild: true,
                    };
                } catch (error) {
                    console.error("Kid login error:", error);
                    const errorMessage = error instanceof Error ? error.message : "Invalid kid credentials";
                    throw new Error(parseKidLoginErrorEnhanced(errorMessage));
                }
            },
        }),
    ],






    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    events: {
        async signIn({ user, account, profile, isNewUser }) {
            console.log('Sign in event:', { user: user?.email, provider: account?.provider, isNewUser });
        }, async signOut(params) {
            console.log('Sign out event:', { params });
        },
        async createUser({ user }) {
            console.log('User created:', { user: user?.email });
        },
        async linkAccount({ user, account, profile }) {
            console.log('Account linked:', { user: user?.email, provider: account?.provider });
        },
        async session({ session, token }) {
            // Only log occasionally to avoid spam
            if (Math.random() < 0.1) {
                console.log('Session event:', { user: session?.user?.email, role: session?.user?.role });
            }
        },
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Check for the custom error object from the authorize function
            if (user.id === 'signup-error' && user.error) {
                const errorMessage = encodeURIComponent(user.error);
                return `/auth/signup?error=${errorMessage}`;
            }
            if (user.id === 'login-error' && user.error) {
                const errorMessage = encodeURIComponent(user.error);
                return `/auth/signin?error=${errorMessage}`;
            }

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
                session.user.accessToken = token.accessToken as string | undefined;
                session.user.refreshToken = token.refreshToken as string | undefined;

                // Add kid-specific fields
                session.user.childId = token.childId as string | undefined;
                session.user.childUsername = token.childUsername as string | undefined;
                session.user.isChild = token.isChild as boolean | undefined;

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
                    role: session.user.role,
                    isChild: session.user.isChild,
                    childId: session.user.childId
                });
            }
            return session;
        },

        async jwt({ token, user, account, profile }) {
            // Check for our special error user from the authorize callback
            if (user?.id === 'error-user' && user.error) {
                // This error will be caught by the client-side `signIn` call
                throw new Error(user.error);
            }
            if (user) {
                console.log("JWT callback - processing user:", {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                    isChild: user.isChild
                });

                // Store the complete user object in the token
                token.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    emailVerified: user.emailVerified,
                    avatar: user.avatar,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,

                    // Kid-specific fields
                    childId: user.childId,
                    childUsername: user.childUsername,
                    isChild: user.isChild
                };

                // Also store individual fields for backward compatibility
                token.role = user.role;
                token.email = user.email;
                token.name = user.name;
                token.emailVerified = user.emailVerified;
                token.avatar = user.avatar;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;

                // Store kid-specific fields
                token.childId = user.childId;
                token.childUsername = user.childUsername;
                token.isChild = user.isChild;
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