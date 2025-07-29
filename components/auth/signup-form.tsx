'use client'

import * as z from "zod"
import { useState, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import CardWrapper from "./card-wrapper"
import { SignUpSchema } from "@/schemas"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import FormError from "../form-error"
import FormSuccess from "../form-sucess"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { Checkbox } from "../ui/checkbox"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { parseSignupErrorEnhanced } from "@/lib/utils/auth-errors"
import { sendVerificationEmail } from '@/lib/utils/sendVerificationEmail'

type SignUpFormValues = z.infer<typeof SignUpSchema>

interface SignInResult {
    error?: string;
    ok?: boolean;
    url?: string;
    data?: {
        id?: string;
        email?: string;
        full_name?: string;
        role?: string;
        is_verified?: boolean;
        avatar?: string | null;
        token?: string;
        uidb64?: string;
        verification_email_sent?: boolean;
        message?: string;
        verification?: {
            token?: string;
            uidb64?: string;
            email_sent?: boolean;
            needsVerification?: boolean;
            failedToSend?: boolean;
            message?: string;
        };
    };
    // allow for direct verification object at top level in result for flexibility
    verification?: {
        token?: string;
        uidb64?: string;
        email_sent?: boolean;
        needsVerification?: boolean;
        failedToSend?: boolean;
        message?: string;
    }
}

// ... (all your imports and code remain the same above) ...

const SignUpForm = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlError = searchParams.get("error")

    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState<string | undefined>("")
    const [error, setError] = useState<string | null>(urlError ? decodeURIComponent(urlError) : null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const signUpForm = useForm<SignUpFormValues>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: useMemo(() => ({
            email: "",
            password: "",
            fullName: "",
            confirmPassword: "",
            agreeToTerms: false,
        }), []),
        mode: "onChange"
    })

    // Helper to get verification object regardless of backend shape
    const getVerification = (result: any) => {
        if (result?.data?.verification) return result.data.verification;
        if (result?.verification) return result.verification;
        return null;
    };

    // Sign up submission
    const onSignUpSubmit = useCallback(async (values: SignUpFormValues) => {
        setIsLoading(true)
        setError(null)
        setSuccess("")
        try {
            const result = await signIn("parent-credentials", {
                name: values.fullName,
                email: values.email,
                password: values.password,
                confirmPassword: values.confirmPassword,
                redirect: false,
            }) as SignInResult

            if (result?.error) {

                const enhancedError = parseSignupErrorEnhanced(result.error)

                if (
                    enhancedError.toLowerCase().includes('verification email failed to send') ||
                    enhancedError.toLowerCase().includes('try resending from the verification page')
                ) {
                    const verification_link = `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(values.email)}&verified=1`
                    try {
                        await sendVerificationEmail({ email: values.email, fullName: values.fullName, verification_link })
                        setSuccess("Verification email has been sent. Please check your inbox.")
                        setError(null)
                        await signOut({ redirect: false })
                        setTimeout(() => {
                            router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`)
                        }, 1500)
                    } catch {
                        setSuccess("Tried to resend, but something went wrong. Please try again from the verification page.")
                        setError(null)
                    }
                    return
                }

                setError(enhancedError)
                return
            }

            // Prefer userData from .data, but fallback to direct result object
            const userData = (result?.data || result || {}) as any
            const email = ('email' in userData ? userData.email : undefined) || values.email
            const fullName = values.fullName

            const verification = getVerification(result);
            const needsVerification = verification?.needsVerification;
            const failedToSend = verification?.failedToSend;

            // Only trigger sendVerificationEmail if backend failed to send it
            if (needsVerification && failedToSend) {
                const verification_link = `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(email)}&verified=1`
                try {
                    await sendVerificationEmail({ email, fullName, verification_link })
                    setSuccess("Verification email has been resent. Please check your inbox.")
                    setError(null)
                } catch {
                    setError(null)
                    // setSuccess("Tried to resend, but something went wrong. Please try again from the verification page.")
                }
            }

            const successMessage = ('message' in userData ? userData.message : undefined) || "Account created successfully! Please verify your email."
            setSuccess(successMessage)

            await signOut({ redirect: false })

            setTimeout(() => {
                router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
            }, 1500)
        } catch (error) {
            setError(parseSignupErrorEnhanced(error))
        } finally {
            setIsLoading(false)
        }
    }, [router])

    const togglePasswordVisibility = useCallback(() => setShowPassword(v => !v), [])
    const toggleConfirmPasswordVisibility = useCallback(() => setShowConfirmPassword(v => !v), [])

    return (
        <CardWrapper
            headerLabel="Building Smart Money Habits, One Chore at a Time!"
            titleLabel="Create an account"
            backButtonLabel="Already have an account? Sign in"
            backButtonHref="/auth/signin"
            showSocial
        >
            <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
                    className="space-y-4 sm:space-y-6"
                >
                    <div className="space-y-3 sm:space-y-4">
                        <FormField
                            control={signUpForm.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm sm:text-base">Full Name</FormLabel>
                                    <FormControl>
                                        <Input {...field}
                                            placeholder="Enter your full name"
                                            type="text"
                                            className="h-9 sm:h-10 text-sm sm:text-base"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs sm:text-sm" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                                    <FormControl>
                                        <Input {...field}
                                            placeholder="Enter your email"
                                            type="email"
                                            className="h-9 sm:h-10 text-sm sm:text-base"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs sm:text-sm" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm sm:text-base">Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input {...field}
                                                placeholder="******"
                                                type={showPassword ? "text" : "password"}
                                                className="h-9 sm:h-10 text-sm sm:text-base"
                                            />
                                            <button
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                                tabIndex={-1}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs sm:text-sm" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm sm:text-base">Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input {...field}
                                                placeholder="******"
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="h-9 sm:h-10 text-sm sm:text-base"
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleConfirmPasswordVisibility}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                                tabIndex={-1}
                                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs sm:text-sm" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signUpForm.control}
                            name="agreeToTerms"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <label className=" text-[12px] sm:text-[12px]">
                                            By signing up you agree to the{" "}
                                            <Link href="/#terms" className="text-blue-500 hover:underline">
                                                Terms of Service
                                            </Link>{" "}
                                            and{" "}
                                            <Link href="/#privacy" className="text-blue-500 hover:underline">
                                                Privacy Policy
                                            </Link>
                                        </label>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        disabled={isLoading}
                        type="submit"
                        className="w-full h-9 sm:h-10 text-sm sm:text-base dark:text-secondary-foreground"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : "Create account"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}

export default SignUpForm