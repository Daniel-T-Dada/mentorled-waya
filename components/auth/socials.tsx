"use client"

import { signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"
import { Button } from "../ui/button"
import { FaFacebook, FaApple } from "react-icons/fa"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"
import { toast } from "sonner"
import { handleProviderSwitch } from "@/lib/utils/auth-utils"

const Social = () => {
    const onClick = (provider: "google" | "facebook" | "apple") => {
        if (provider === "google") {
            // Clear auth cache when switching to Google OAuth
            handleProviderSwitch('google');
            
            signIn(provider, {
                callbackUrl: DEFAULT_LOGIN_REDIRECT
            })
        } else if (provider === "facebook") {
            // Clear auth cache when switching to Facebook OAuth
            handleProviderSwitch('facebook');
            
            toast.info("Coming Soon", {
                description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication will be available soon!`
            })
        } else {
            toast.info("Coming Soon", {
                description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication will be available soon!`
            })
        }
    }
    return (
        <div className="flex items-center w-full gap-x-2">
            <Button
                size="lg"
                className="flex-1"
                variant="outline"
                onClick={() => onClick("google")}>
                <FcGoogle className="h-5 w-5" />
            </Button>
            <Button
                size="lg"
                className="flex-1"
                variant="outline"
                onClick={() => onClick("facebook")}
                disabled>
                <FaFacebook className="h-5 w-5 text-blue-600 dark:text-blue-100 rounded-full" />
            </Button>
            <Button
                size="lg"
                className="flex-1"
                variant="outline"
                onClick={() => onClick("apple")}
                disabled>
                <FaApple className="h-5 w-5 rounded-full" />
            </Button>
        </div>
    )
}

export default Social