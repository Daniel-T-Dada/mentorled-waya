'use client'


import * as z from "zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import CardWrapper from "./card-wrapper"
import { ParentSignInSchema, KidSignInSchema } from "@/schemas"
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { handleProviderSwitch } from "@/lib/utils/auth-utils";



import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"

import { Input } from "../ui/input"
import { Button } from "../ui/button"
import FormError from "../form-error"
import FormSuccess from "../form-sucess"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { parseLoginErrorEnhanced, parseKidLoginErrorEnhanced } from "@/lib/utils/auth-errors";


type ParentFormValues = z.infer<typeof ParentSignInSchema>;
type KidFormValues = z.infer<typeof KidSignInSchema>


const SignInForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlError = searchParams.get("error");
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState<"parent" | "kid">("parent");
    const [success, setSuccess] = useState<string | undefined>("")
    const [error, setError] = useState<string | null>(urlError ? decodeURIComponent(urlError) : null);
    const [showPassword, setShowPassword] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);


    const parentForm = useForm<ParentFormValues>({
        resolver: zodResolver(ParentSignInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onChange"
    })

    // The Kid Login Form Implementation
    const kidForm = useForm<KidFormValues>({
        resolver: zodResolver(KidSignInSchema),
        defaultValues: {
            username: "",
            pin: "",
        },
        mode: "onChange"
    })

    // Handle tab change
    const handleTabChange = (value: string) => {
        const newUserType = value as "parent" | "kid";
        setUserType(newUserType);
        setError(null);

        // Reset only the form being switched to
        if (newUserType === "parent") {
            parentForm.reset();
        } else {
            kidForm.reset();
        }
    };

    // Parent login submission
    async function onParentSubmit(values: ParentFormValues) {
        console.log("Parent Form Values:", {
            email: values.email,
            password: values.password
        });
        setIsLoading(true);
        setError(null);
        setSuccess("");

        try {
            // Clear auth cache when switching to credentials
            handleProviderSwitch('credentials');

            const result = await signIn("parent-credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl: "/dashboard/parents"
            });

            console.log("SignIn result:", result);
            if (result?.url) {
                const redirectedUrl = new URL(result.url);
                const errorParam = redirectedUrl.searchParams.get("error");
                if (errorParam) {
                    setError(decodeURIComponent(errorParam));
                    setIsLoading(false);
                    return;
                }
            }
            if (result?.error) {
                setError(parseLoginErrorEnhanced(result.error));
                setIsLoading(false);
                return;
            }
            if (result?.ok && result?.url) {
                router.push(result.url);
            } else if (result?.ok) {
                setSuccess("Sign in successful!");
                router.push("/dashboard/parents");
            } else {
                setError("An unexpected error occurred during sign in.");
                setIsLoading(false);
            }
        } catch (e) {
            console.error("Exception during sign in:", e);
            setError("An unexpected error occurred.");
            setIsLoading(false);
        }
    }


    // Kid login submission
    async function onKidSubmit(values: KidFormValues) {
        // console.log("Kid Form Values:", {
        //     username: values.username,
        //     pin: values.pin
        // });
        setIsLoading(true);
        setError(null);
        setSuccess("");

        try {
            // Clear auth cache when switching to credentials
            handleProviderSwitch('credentials');

            const result = await signIn("kid-credentials", {
                username: values.username,
                pin: values.pin,
                redirect: false,
                callbackUrl: "/dashboard/kids"
            }); if (result?.error) {
                console.log("Authentication error:", result.error);

                // Use enhanced error parsing for kid login errors
                const errorMessage = parseKidLoginErrorEnhanced(result.error);
                setError(errorMessage);
                return;
            }

            setSuccess("Successfully signed in!");
            if (result?.url) {
                router.push(result.url);
            } else {
                router.push("/dashboard/kids");
            }
            router.refresh();
        } catch (error) {
            console.error("Kid login error:", error);
            const errorMessage = parseKidLoginErrorEnhanced(error);
            setError(errorMessage);
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

    const togglePinVisibility = () => {
        setShowPin(!showPin);
    };

    return (
        <CardWrapper
            headerLabel="Welcome to Waya!"
            titleLabel="Welcome back!"
            backButtonLabel="Don't have an account? Sign up"
            backButtonHref="/auth/signup"
            showSocial
            className=""
        >
            <Tabs
                defaultValue="parent"
                className="w-full mb-3 sm:mb-4"
                onValueChange={handleTabChange}
            >
                <TabsList className="w-full grid grid-cols-2 h-9 sm:h-11 dark:bg-secondary rounded-md dark:border">
                    <TabsTrigger value="parent" className="rounded-l-md text-xs sm:text-sm">Parent</TabsTrigger>
                    <TabsTrigger value="kid" className="rounded-r-md text-xs sm:text-sm">Kid</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Only show the error above the button, not at the top */}
            {userType === "parent" && (
                <Form {...parentForm}>
                    <form onSubmit={parentForm.handleSubmit(onParentSubmit)}
                        className="space-y-3 sm:space-y-4"
                    >
                        <div className="space-y-2 sm:space-y-3">
                            <FormField
                                control={parentForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs sm:text-sm">Email</FormLabel>
                                        <FormControl>
                                            <Input {...field}
                                                placeholder="Enter your email"
                                                type="email"
                                                className="h-8 sm:h-9 text-xs sm:text-sm"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] sm:text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={parentForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs sm:text-sm">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input {...field}
                                                    placeholder="******"
                                                    type={showPassword ? "text" : "password"}
                                                    className="h-8 sm:h-9 text-xs sm:text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={togglePasswordVisibility}
                                                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] sm:text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember-me"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="text-xs sm:text-sm text-muted-foreground cursor-pointer"
                                >
                                    Remember me
                                </label>
                            </div>
                            <Link
                                href="/auth/forgot-password"
                                className="text-xs sm:text-sm text-primary hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <FormError message={error} />
                        <FormSuccess message={success} />
                        <Button
                            disabled={isLoading}
                            type="submit"
                            className="w-full h-8 sm:h-9 text-xs sm:text-sm dark:text-secondary-foreground"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : "Sign in"}
                        </Button>
                    </form>
                </Form>
            )}

            {/* Kid Form */}
            {userType === "kid" && (
                <Form {...kidForm}>
                    <form onSubmit={kidForm.handleSubmit(onKidSubmit)}
                        className="space-y-3 sm:space-y-4"
                    >
                        <div className="space-y-2 sm:space-y-3">
                            <FormField
                                control={kidForm.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs sm:text-sm">Username</FormLabel>
                                        <FormControl>
                                            <Input {...field}
                                                placeholder="Enter your username"
                                                type="text"
                                                className="h-8 sm:h-9 text-xs sm:text-sm"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] sm:text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={kidForm.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs sm:text-sm">Pin</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input {...field}
                                                    placeholder="******"
                                                    type={showPin ? "text" : "password"}
                                                    maxLength={4}
                                                    className="h-8 sm:h-9 text-xs sm:text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={togglePinVisibility}
                                                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                                >
                                                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] sm:text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormError message={error} />
                        <FormSuccess message={success} />
                        <Button
                            disabled={isLoading}
                            type="submit"
                            className="w-full h-8 sm:h-9 text-xs sm:text-sm dark:text-secondary-foreground"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : "Sign in"}
                        </Button>
                    </form>
                </Form>
            )}
        </CardWrapper>

    )
}
export default SignInForm
