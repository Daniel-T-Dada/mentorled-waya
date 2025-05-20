'use client'


import * as z from "zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import CardWrapper from "./card-wrapper"
import { ParentSignInSchema, KidSignInSchema } from "@/schemas"
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";



import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"

import { Input } from "../ui/input"
import { Button } from "../ui/button"
import FormError from "../form-error"
import FormSuccess from "../form-sucess"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";


type ParentFormValues = z.infer<typeof ParentSignInSchema>;
type KidFormValues = z.infer<typeof KidSignInSchema>


const SignInForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState<"parent" | "kid">("parent");
    const [success, setSuccess] = useState<string | undefined>("")
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showPin, setShowPin] = useState(false);


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
            const result = await signIn("parent-credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
                callbackUrl: "/dashboard/parents"
            });

            if (result?.error) {
                console.log("Authentication error:", result.error);
                setError("Invalid email or password. Please try again.");
                return;
            }

            setSuccess("Successfully signed in!");
            if (result?.url) {
                router.push(result.url);
            } else {
                router.push("/dashboard/parents");
            }
            router.refresh();
        } catch (error) {
            console.error("Login error:", error);
            setError("Something went wrong. Please try again.");
        } finally {
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
            const result = await signIn("kid-credentials", {
                username: values.username,
                pin: values.pin,
                redirect: false,
                callbackUrl: "/dashboard/kids"
            });

            if (result?.error) {
                console.log("Authentication error:", result.error);
                setError("Invalid username or PIN. Please try again.");
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
            console.error("Login error:", error);
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
        >
            <Tabs
                defaultValue="parent"
                className="w-full mb-4 sm:mb-6"
                onValueChange={handleTabChange}
            >
                <TabsList className="w-full grid grid-cols-2 h-10 sm:h-12 dark:bg-secondary rounded-md dark:border">
                    <TabsTrigger value="parent" className="rounded-l-md text-sm sm:text-base">Parent</TabsTrigger>
                    <TabsTrigger value="kid" className="rounded-r-md text-sm sm:text-base">Kid</TabsTrigger>
                </TabsList>
            </Tabs>

            {error && (
                <div className="p-2 sm:p-3 text-xs sm:text-sm bg-destructive/15 text-destructive rounded-md mb-3 sm:mb-4">
                    {error}
                </div>
            )}
            {/* Parent Form */}
            {userType === "parent" && (
                <Form {...parentForm}>
                    <form onSubmit={parentForm.handleSubmit(onParentSubmit)}
                        className="space-y-4 sm:space-y-6"
                    >
                        <div className="space-y-3 sm:space-y-4">
                            <FormField
                                control={parentForm.control}
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
                                control={parentForm.control}
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
                        </div>
                        <FormError message="" />
                        <FormSuccess message={success} />
                        <Button
                            disabled={isLoading}
                            type="submit"
                            className="w-full h-9 sm:h-10 text-sm sm:text-base dark:text-secondary-foreground"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </Form>
            )}




            {/* Kid Form */}
            {userType === "kid" && (
                <Form {...kidForm}>
                    <form onSubmit={kidForm.handleSubmit(onKidSubmit)}
                        className="space-y-4 sm:space-y-6"
                    >
                        <div className="space-y-3 sm:space-y-4">
                            <FormField
                                control={kidForm.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Username</FormLabel>
                                        <FormControl>
                                            <Input {...field}
                                                placeholder="Enter your username"
                                                type="text"
                                                className="h-9 sm:h-10 text-sm sm:text-base"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs sm:text-sm" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={kidForm.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Pin</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input {...field}
                                                    placeholder="******"
                                                    type={showPin ? "text" : "password"}
                                                    maxLength={4}
                                                    className="h-9 sm:h-10 text-sm sm:text-base"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={togglePinVisibility}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                                >
                                                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
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
                            className="w-full h-9 sm:h-10 text-sm sm:text-base dark:text-secondary-foreground"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </Form>
            )}
        </CardWrapper>

    )
}
export default SignInForm
