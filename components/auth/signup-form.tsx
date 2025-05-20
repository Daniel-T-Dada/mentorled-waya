'use client'


import * as z from "zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import CardWrapper from "./card-wrapper"
import { SignUpSchema } from "@/schemas"




import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"

import { Input } from "../ui/input"
import { Button } from "../ui/button"
import FormError from "../form-error"
import FormSuccess from "../form-sucess"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Checkbox } from "../ui/checkbox"



type SignUpFormValues = z.infer<typeof SignUpSchema>;



const SignUpForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState<string | undefined>("")
    const [error, setError] = useState<string | null>(null);



    // const form = useForm<z.infer<typeof SignInSchema>>({
    //     resolver: zodResolver(SignInSchema),
    //     defaultValues: {
    //         email: "",
    //         password: "",
    //     },
    //     mode: "onChange"
    // })
    const signUpForm = useForm<SignUpFormValues>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            email: "",
            password: "",
            fullName: "",
            confirmPassword: "",
            agreeToTerms: false,
        },
        mode: "onChange"
    })

    // Sign up submission
    async function onSignUpSubmit(values: SignUpFormValues) {
        // console.log("Signup Form Values:", {
        //     name: values.fullName,
        //     email: values.email,
        //     password: values.password
        // });
        setIsLoading(true);
        setError(null);
        setSuccess("");


        try {
            // Call Auth.js signup
            const result = await signIn("parent-credentials", {
                name: values.fullName,
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl: `/auth/verify-email?email=${encodeURIComponent(values.email)}`
            });

            if (result?.error) {
                setError(result.error);
                return;
            }

            // Redirect to verification page
            router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
        } catch (error) {
            setError("Something went wrong. Please try again.");
            console.error("Registration failed:", error);
        } finally {
            setIsLoading(false);
        }
    }


    // const onSubmit = (values: z.infer<typeof SignInSchema>) => {
    //     startTransition(() => {
    //         console.log(values)
    //     })
    // }



    return (
        <CardWrapper
            headerLabel="Building Smart Money Habits, One Chore at a Time!"
            titleLabel="Create an account"
            backButtonLabel="Already have an account? Sign in"
            backButtonHref="/auth/signin"
            showSocial
        >
            {error && (
                <div className="p-2 sm:p-3 text-xs sm:text-sm bg-destructive/15 text-destructive rounded-md mb-3 sm:mb-4">
                    {error}
                </div>
            )}
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
                                        <Input {...field}
                                            placeholder="******"
                                            type="password"
                                            className="h-9 sm:h-10 text-sm sm:text-base"
                                        />
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
                                        <Input {...field}
                                            placeholder="******"
                                            type="password"
                                            className="h-9 sm:h-10 text-sm sm:text-base"
                                        />
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
                                        <label className="font-medium text-[12px] sm:text-sm">
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
                    <FormError message="" />
                    <FormSuccess message={success} />
                    <Button
                        disabled={isLoading}
                        type="submit"
                        className="w-full h-9 sm:h-10 text-sm sm:text-base dark:text-secondary-foreground"
                    >
                        {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>

    )
}
export default SignUpForm
