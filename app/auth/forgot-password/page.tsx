'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import CardWrapper from "@/components/auth/card-wrapper"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import FormError from "@/components/form-error"
import FormSuccess from "@/components/form-sucess"
import { Loader2 } from "lucide-react"
import { parsePasswordResetError } from "@/lib/utils/auth-errors"

// Schema for email validation
const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
})

type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | undefined>("")

    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: "",
        },
        mode: "onChange"
    })

    async function onSubmit(values: ForgotPasswordValues) {
        setIsLoading(true)
        setError(null)
        setSuccess("")

        try {
            // TODO: Implement actual password reset functionality
            // This is a placeholder for now
            console.log("Reset password for:", values.email)

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            setSuccess("If an account exists with that email, we've sent password reset instructions.")
        } catch (error) {
            console.error("Password reset request failed:", error)

            // Use the utility function to parse password reset errors
            const errorMessage = error instanceof Error ? error.message : String(error)
            const parsedError = parsePasswordResetError(errorMessage)

            // Special case: if the "error" is actually a success message for security reasons
            if (parsedError.includes("If an account exists")) {
                setSuccess(parsedError)
            } else {
                setError(parsedError)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <CardWrapper
            headerLabel="Forgot your password?"
            titleLabel="Reset your password"
            backButtonLabel="Back to sign in"
            backButtonHref="/auth/signin"
            showSocial={false}
        >
            {error && (
                <div className="p-2 sm:p-3 text-xs sm:text-sm bg-destructive/15 text-destructive rounded-md mb-3 sm:mb-4">
                    {error}
                </div>
            )}

            {success ? (
                <div className="p-3 sm:p-4 text-xs sm:text-sm bg-green-500/15 text-green-500 rounded-md mb-3 sm:mb-4">
                    {success}
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                        <div className="space-y-2">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Enter your email address and we&apos;ll send you instructions to reset your password.
                            </p>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter your email"
                                                type="email"
                                                className="h-9 sm:h-10 text-xs sm:text-sm"
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormError message="" />
                        <FormSuccess message={success} />

                        <Button
                            disabled={isLoading}
                            type="submit"
                            className="w-full h-9 sm:h-10 text-xs sm:text-sm dark:text-secondary-foreground"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending instructions...
                                </>
                            ) : "Send reset instructions"}
                        </Button>
                    </form>
                </Form>
            )}
        </CardWrapper>
    )
} 