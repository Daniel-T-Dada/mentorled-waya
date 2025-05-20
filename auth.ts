import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { ZodError } from "zod";
import { ParentSignInSchema, SignUpSchema } from "./schemas";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email?: string;
            username?: string;
            role: string;
            emailVerified?: Date | null;
            parentId?: string;
            avatar?: string;
        }
    }

    interface User {
        id: string;
        name: string;
        email?: string;
        username?: string;
        role: string;
        emailVerified?: Date | null;
        parentId?: string;
        avatar?: string;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
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
                            agreeToTerms: true, // Since we're handling this in the form
                        });

                        console.log("Validated data:", validatedData);

                        console.log("Making API request to:", "http://localhost:3001/api/signup");
                        const response = await fetch("http://localhost:3001/api/signup", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name: validatedData.fullName,
                                email: validatedData.email,
                                password: validatedData.password,
                                confirmPassword: validatedData.confirmPassword
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
                            emailVerified: new Date(), // TODO: I temporarily set to email verify true until I implement it verification functionality later
                            avatar: data.user.avatar,
                        };
                    }

                    // Handle email verification
                    if (credentials.token && credentials.email) {
                        const response = await fetch("http://localhost:3001/api/verify-email", {
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
                            avatar: data.avatar,
                        };
                    }

                    // Handle login
                    if (credentials.email && credentials.password) {
                        const validatedData = ParentSignInSchema.parse({
                            email: credentials.email,
                            password: credentials.password,
                        });

                        const response = await fetch("http://localhost:3001/api/login", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(validatedData),
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.error || "Failed to log in");
                        }

                        const data = await response.json();
                        return {
                            id: data.id,
                            name: data.name,
                            email: data.email,
                            role: data.role,
                            emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
                            avatar: data.avatar,
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
    pages: {
        error: '/auth/error',
    },
    debug: true,
})