import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { ZodError } from "zod";
import { ParentSignInSchema, KidSignInSchema, SignUpSchema } from "./schemas";
import { AuthService } from "@/lib/services/authService";
import { parseLoginErrorEnhanced, parseSignupErrorEnhanced, parseKidLoginErrorEnhanced } from '@/lib/utils/auth-errors';

// --- Type Declarations ---
declare module "next-auth" {
    interface Session { user: any & { firstName?: string } }
    interface User { [key: string]: any; firstName?: string }
}

declare module "@auth/core/jwt" {
    interface JWT extends DefaultJWT { [key: string]: any; firstName?: string }
}

// --- NextAuth Config ---
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: { params: { scope: "openid email profile" } },
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
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
            async authorize(rawCredentials) {
                if (!rawCredentials) return null;

                const credentials = {
                    name: rawCredentials.name as string | undefined,
                    email: rawCredentials.email as string | undefined,
                    password: rawCredentials.password as string | undefined,
                    confirmPassword: rawCredentials.confirmPassword as string | undefined,
                    token: rawCredentials.token as string | undefined,
                    uidb64: rawCredentials.uidb64 as string | undefined,
                    csrfToken: rawCredentials.csrfToken as string | undefined,
                };

                try {
                    // Signup
                    if (credentials.name && credentials.email && credentials.password && credentials.confirmPassword) {
                        try {
                            SignUpSchema.parse({
                                fullName: credentials.name,
                                email: credentials.email,
                                password: credentials.password,
                                confirmPassword: credentials.confirmPassword,
                                agreeToTerms: true,
                            });
                        } catch (error) {
                            return { id: 'signup-error', error: parseSignupErrorEnhanced(error), role: 'parent' };
                        }
                        const { data, error } = await AuthService.signup({
                            full_name: credentials.name,
                            email: credentials.email,
                            password: credentials.password,
                            password2: credentials.confirmPassword,
                            terms_accepted: true,
                        });
                        if (error) {
                            const errMsg = typeof error === "string" ? error : String(error);
                            if (
                                errMsg.toLowerCase().includes('verification email failed to send')
                                || errMsg.toLowerCase().includes('try resending from the verification page')
                            ) {
                                return {
                                    id: data?.user?.id ?? 'temp-id',
                                    name: credentials.name,
                                    firstName: credentials.name?.split(" ")[0],
                                    email: credentials.email,
                                    role: 'parent',
                                    emailVerified: null,
                                    avatar: null,
                                    verification: {
                                        message: errMsg,
                                        needsVerification: true,
                                        failedToSend: true,
                                    },
                                };
                            }
                            return { id: 'signup-error', error: parseSignupErrorEnhanced(error), role: 'parent' };
                        }
                    }

                    // Email verification
                    if (credentials.token && credentials.uidb64) {
                        const { data, error } = await AuthService.verifyEmail({
                            uidb64: credentials.uidb64,
                            token: credentials.token
                        });
                        if (error) throw new Error(error);
                        return {
                            id: credentials.uidb64,
                            name: undefined,
                            firstName: undefined,
                            email: undefined,
                            role: 'parent',
                            emailVerified: new Date(),
                            avatar: null,
                        };
                    }

                    // Login
                    if (credentials.email && credentials.password) {
                        try {
                            ParentSignInSchema.parse({
                                email: credentials.email,
                                password: credentials.password,
                            });
                        } catch (error) {
                            return { id: 'login-error', error: parseLoginErrorEnhanced(error), role: 'parent' };
                        }
                        const { data, error } = await AuthService.login({
                            email: credentials.email,
                            password: credentials.password,
                        });
                        if (process.env.NODE_ENV === 'development') {
                            console.log('AuthService.login response:', JSON.stringify(data, null, 2));
                        }
                        if (error) {
                            return { id: 'login-error', error: parseLoginErrorEnhanced(error), role: 'parent' };
                        }
                        const firstName = data?.name?.split(" ")[0] ?? data?.email?.split("@")[0];
                        return {
                            id: data?.id ?? '',
                            name: data?.name ?? '',
                            firstName,
                            email: data?.email ?? '',
                            role: 'parent',
                            emailVerified: new Date(),
                            avatar: data?.avatar ?? null,
                            accessToken: data?.token,
                            refreshToken: data?.refresh,
                        };
                    }
                    return null;
                } catch (error) {
                    if (credentials?.name) {
                        let errorMessage = error instanceof ZodError ? error.errors[0].message : (error as Error)?.message || 'An error occurred during sign up.';
                        return { id: 'signup-error', error: parseSignupErrorEnhanced(errorMessage), role: 'parent' };
                    }
                    if (credentials?.email && credentials?.password) {
                        let errorMessage = error instanceof ZodError ? error.errors[0].message : (error as Error)?.message || 'An error occurred during sign in.';
                        return { id: 'login-error', error: parseLoginErrorEnhanced(errorMessage), role: 'parent' };
                    }
                    let errorMessage = error instanceof Error ? error.message : 'Authentication failed';
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
            },
            async authorize(rawCredentials) {
                if (!rawCredentials) return null;

                const credentials = {
                    username: rawCredentials.username as string | undefined,
                    pin: rawCredentials.pin as string | undefined,
                };

                if (!credentials.username || !credentials.pin) return null;
                try {
                    KidSignInSchema.parse({
                        username: credentials.username,
                        pin: credentials.pin,
                    });
                } catch (error) {
                    return { id: 'login-error', error: parseKidLoginErrorEnhanced(error), role: 'kid' };
                }
                const { data, error } = await AuthService.childLogin({
                    username: credentials.username,
                    pin: credentials.pin,
                });
                if (error) {
                    return { id: 'login-error', error: parseKidLoginErrorEnhanced(error), role: 'kid' };
                }
                // --- PATCH: Always extract firstName from backend name, fallback to username ---
                const firstName = data?.name?.split(" ")[0] ?? credentials.username;

                return {
                    id: data?.childId ?? data?.id ?? '',
                    name: data?.name ?? credentials.username,
                    firstName, // <--- Always present!
                    username: data?.username ?? credentials.username,
                    role: "kid",
                    emailVerified: new Date(),
                    avatar: data?.avatar ?? null,
                    accessToken: data?.token,
                    refreshToken: data?.refresh,
                    childId: data?.childId ?? data?.id,
                    childUsername: data?.username ?? credentials.username,
                    childName: data?.name ?? credentials.username,
                    isChild: true,
                };
            }
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
            console.log('Sign in event:', { user: user?.email ?? user?.username ?? user?.id, provider: account?.provider, isNewUser });
        },
        async signOut(params) {
            console.log('Sign out event:', { params });
        },
        async createUser({ user }) {
            console.log('User created:', { user: user?.email });
        },
        async linkAccount({ user, account, profile }) {
            console.log('Account linked:', { user: user?.email, provider: account?.provider });
        },
        async session({ session, token }) {
            if (Math.random() < 0.1) {
                console.log('Session event:', { user: session?.user?.email, role: session?.user?.role });
            }
        },
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (user.id === 'signup-error' && user.error) {
                const errorMessage = encodeURIComponent(user.error);
                return `/auth/signup?error=${errorMessage}`;
            }
            if (user.id === 'login-error' && user.error) {
                const errorMessage = encodeURIComponent(user.error);
                return `/auth/signin?error=${errorMessage}`;
            }

            // --- OAuth users: ensure ID and add other fields ---
            if (account?.provider === "google" || account?.provider === "facebook") {
                const email = user.email || profile?.email || '';
                const firstName = profile?.given_name || (user.name ? user.name.split(" ")[0] : undefined) || (email ? email.split("@")[0] : undefined);
                user.id = profile?.sub || user.id || email || '';
                user.email = email;
                user.role = "parent";
                user.firstName = firstName;
                user.emailVerified = new Date();
                user.avatar = profile?.picture ?? user.image ?? null;
            }
            return true;
        },

        async session({ session, token }) {
            session.user = session.user || {};
            if (token.sub || token.user) {
                const fullUser = {
                    id: token.sub || token.user?.id || '',
                    name: token.name || token.user?.name,
                    firstName: token.firstName || token.user?.firstName, // <--- propagate firstName
                    email: token.email || token.user?.email || null,
                    role: token.role || token.user?.role || "parent",
                    emailVerified: token.emailVerified ? new Date(token.emailVerified as string) : null,
                    avatar: token.avatar ?? token.user?.avatar ?? null,
                    accessToken: token.accessToken || token.user?.accessToken,
                    refreshToken: token.refreshToken || token.user?.refreshToken,
                    childId: token.childId || token.user?.childId,
                    childUsername: token.childUsername || token.user?.childUsername,
                    childName: token.childName || token.user?.childName,
                    isChild: token.isChild ?? token.user?.isChild,
                };
                session.user = { ...session.user, ...fullUser };
                if (session.user.isChild && session.user.childName) session.user.name = session.user.childName;
            }
            return session;
        },

        async jwt({ token, user, account, profile }) {
            if (user?.id === 'error-user' && user.error) {
                throw new Error(user.error);
            }
            if (user) {
                token.sub = user.id;
                token.user = {
                    id: user.id,
                    name: user.name,
                    firstName: user.firstName, // <--- propagate firstName
                    email: user.email,
                    role: user.role,
                    emailVerified: user.emailVerified,
                    avatar: user.avatar ?? null,
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    childId: user.childId,
                    childUsername: user.childUsername,
                    childName: user.childName,
                    isChild: user.isChild,
                };
                token.role = user.role;
                token.email = user.email;
                token.name = user.name;
                token.firstName = user.firstName; // <--- propagate firstName
                token.emailVerified = user.emailVerified;
                token.avatar = user.avatar ?? null;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.childId = user.childId;
                token.childUsername = user.childUsername;
                token.childName = user.childName;
                token.isChild = user.isChild;
            }
            if (
                (account?.provider === "google" || account?.provider === "facebook")
                && profile?.picture && !token.avatar
            ) {
                token.avatar = profile.picture ?? null;
            }
            return token;
        },
    },
    debug: process.env.NODE_ENV === 'development',
});