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


export { ParentSignInSchema, KidSignInSchema }