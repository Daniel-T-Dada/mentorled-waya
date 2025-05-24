import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { ZodError } from "zod";
import { ParentSignInSchema, SignUpSchema } from "./schemas";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
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
                        console.log("Validating credentials with schema...");
                        const validatedData = SignUpSchema.parse({
                            fullName: credentials.name,
                            email: credentials.email,
                            password: credentials.password,
                            confirmPassword: credentials.confirmPassword,
                            agreeToTerms: true,
                        });

                        console.log("Validated data:", validatedData);

                        // TODO: Remember to hash the password later
                        // Hash the password before sending to API decided to that cause I was seeing the plain password in the console...not good
                        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

                        const response = await fetch(getApiUrl(API_ENDPOINTS.SIGNUP), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name: validatedData.fullName,
                                email: validatedData.email,
                                password: hashedPassword,
                                confirmPassword: hashedPassword
                            }),
                        });

                        console.log("API Response status:", response.status);
                        const data = await response.json();
                        console.log("API Response data:", data);

                        if (!response.ok) {
                            console.error("Signup failed:", {
                                status: response.status,
                                statusText: response.statusText,
                                data: data
                            });
                            throw new Error(data.error || data.message || "Failed to sign up");
                        }

                        // Return the user data
                        return {
                            id: data.user.id,
                            name: data.user.name,
                            email: data.user.email,
                            role: data.user.role,
                            emailVerified: new Date(),
                            avatar: data.user.avatar || null,
                        };
                    }
                    // TODO: Remember to re-add email verification later. Disabled for now cause the Backend Developer Blocker
                    // Handle email verification
                    if (credentials.token && credentials.email) {
                        const response = await fetch(getApiUrl(API_ENDPOINTS.VERIFY_EMAIL), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                token: credentials.token,
                                email: credentials.email,
                            }),
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.error || "Failed to verify email");
                        }

                        const data = await response.json();
                        return {
                            id: data.id,
                            name: data.name,
                            email: data.email,
                            role: data.role,
                            emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
                            avatar: data.avatar || null,
                        };
                    }

                    // Handle login
                    if (credentials.email && credentials.password) {
                        const validatedData = ParentSignInSchema.parse({
                            email: credentials.email,
                            password: credentials.password,
                        });

                        const response = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(validatedData),
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.error || "Failed to log in");
                        }

                        const data = await response.json();

                        // Let the backend handle password verification from what I saw in her implementation during our Standup
                        return {
                            id: data.id,
                            name: data.name,
                            email: data.email,
                            role: data.role,
                            emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
                            avatar: data.avatar || null,
                        };
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
            }
            return session;
        },

        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.email = user.email;
                token.name = user.name;
                token.emailVerified = user.emailVerified;
                token.avatar = user.avatar;
            }
            return token;
        },
    },
    debug: true,
})