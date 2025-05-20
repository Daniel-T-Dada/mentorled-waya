import * as z from "zod"


// Parent Sign-In form schema
const ParentSignInSchema = z.object({
    email: z.string().email({
        message: "Enter a valid email address to sign in",
    }),
    password: z.string().min(1, {
        message: "Password is required to sign in",
    }),
})

// Kid Sign-In form schema
const KidSignInSchema = z.object({
    username: z.string().min(1, {
        message: "Enter a valid username to sign in",
    }),
    pin: z.string().min(1, {
        message: "Enter your 4 digit pin to sign in",
    }),
})

const SignUpSchema = z.object({
    email: z.string().email({
        message: "Invalid email address",
    }),
    password: z.string()
        .min(6, { message: "Password must be at least 6 characters" }),
    // .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    // .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    fullName: z.string().min(1, {
        message: "Full name is required",
    }),
    confirmPassword: z.string(),

    agreeToTerms: z.boolean().refine(val => val === true, {
        message: "You must agree to the terms and conditions.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})


export { ParentSignInSchema, KidSignInSchema, SignUpSchema }