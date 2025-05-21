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
import { Eye, EyeOff } from "lucide-react"



type SignUpFormValues = z.infer<typeof SignUpSchema>;



const SignUpForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState<string | undefined>("")
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);



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
                confirmPassword: values.confirmPassword,
                redirect: false,
                // TODO: Temporarily commented out email verification redirect
                // callbackUrl: `/auth/verify-email?email=${encodeURIComponent(values.email)}`
                callbackUrl: "/auth/signin"
            });

            console.log("SignIn result:", result);

            if (result?.error) {
                console.error("Signup error:", result.error);
                setError(result.error);
                return;
            }

            if (!result?.ok) {
                console.error("Signup failed:", result);
                setError("Failed to create account. Please try again.");
                return;
            }

            // TODO: Temporarily commented out email verification redirect
            // router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
            router.push("/auth/signin");
        } catch (error) {
            console.error("Registration failed:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }


    // const onSubmit = (values: z.infer<typeof SignInSchema>) => {
    //     startTransition(() => {
    //         console.log(values)
    //     })
    // }


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };


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
