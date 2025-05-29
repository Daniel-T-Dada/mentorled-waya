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
                            const data = await response.json();
                            if (data.email && Array.isArray(data.email)) {
                                if (data.email[0].includes('already exists')) {
                                    throw new Error('This email is already registered. Please use a different email or sign in.');
                                }
                            }
                            throw new Error(data.detail || "Failed to sign up");
                        }

                        const data = await response.json();
                        console.log("Signup response data:", data);

                        // Return the user data - note that backend doesn't include token/uidb64
                        return {
                            id: data.id || '',
                            name: data.full_name,
                            email: data.email,
                            role: data.role,
                            emailVerified: new Date(), // Auto-verify email for now
                            avatar: data.avatar || null,
                            data: {

                                email: data.email
                            }
                        };
                    }
                    // TODO: Remember to re-add email verification later. Disabled for now cause the Backend Developer Blocker
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
                                throw new Error(data.detail || data.error || "Failed to log in");
                            }

                            // Handle the specific response format from the backend
                            const userData = data.user || data;

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
    debug: process.env.NODE_ENV === 'development',
})