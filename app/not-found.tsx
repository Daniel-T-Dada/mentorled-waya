import { FadeInOld } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

// export default function NotFound() {
//     return (
//         <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 pt-24 md:pt-32">
//             <div className="container mx-auto max-w-6xl">

//                 {/* Main Content - Image and Text Side by Side */}
//                 <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 mb-12">

//                     {/* Image Section */}
//                     <div className="w-full lg:w-1/2 flex justify-center">
//                         <div className="relative w-full max-w-md">
//                             <Image
//                                 src="/assets/saving-money.svg"
//                                 alt="Page not found"
//                                 width={400}
//                                 height={400}
//                                 className="w-full h-auto dark:brightness-80 dark:contrast-80"
//                             />
//                         </div>
//                     </div>

//                     {/* Text Section */}
//                     <div className="w-full lg:w-1/2 text-center lg:text-left">
//                         <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">
//                             404
//                         </h1>

//                         <h2 className="text-2xl md:text-4xl font-bold text-primary mb-4">
//                             Oops! Page Not Found
//                         </h2>

//                         <p className="text-lg md:text-xl text-muted-foreground mb-8">
//                             Looks like this page went on an adventure without us!
//                             Don&apos;t worry, even the best money-smart kids sometimes take a wrong turn.
//                             Let&apos;s get you back on track to building those financial superpowers!
//                         </p>

//                         {/* Action Buttons */}
//                         <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
//                             <Link href="/">
//                                 <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-full">
//                                     Go Home
//                                 </Button>
//                             </Link>

//                             <Link href="/contact">
//                                 <Button
//                                     variant="outline"
//                                     className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-3 px-8 rounded-full"
//                                 >
//                                     Contact Support
//                                 </Button>
//                             </Link>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Helpful Links */}
//                 <div className="text-center">
//                     <div className="mt-12">
//                         <p className="text-muted-foreground mb-4">
//                             Or try one of these popular pages:
//                         </p>
//                         <div className="flex flex-wrap justify-center gap-4">
//                             <Link
//                                 href="/features"
//                                 className="text-primary hover:text-primary/80 underline underline-offset-4"
//                             >
//                                 Features
//                             </Link>
//                             <Link
//                                 href="/about"
//                                 className="text-primary hover:text-primary/80 underline underline-offset-4"
//                             >
//                                 About Us
//                             </Link>
//                             <Link
//                                 href="/auth/signup"
//                                 className="text-primary hover:text-primary/80 underline underline-offset-4"
//                             >
//                                 Sign Up
//                             </Link>
//                             <Link
//                                 href="/auth/signin"
//                                 className="text-primary hover:text-primary/80 underline underline-offset-4"
//                             >
//                                 Sign In
//                             </Link>
//                         </div>
//                     </div>

//                     {/* Fun Money Fact */}
//                     <div className="mt-16 p-6 bg-primary/5 rounded-lg border border-primary/20 max-w-2xl mx-auto">
//                         <h3 className="text-lg font-semibold text-primary mb-2">
//                             💡 Fun Money Fact!
//                         </h3>
//                         <p className="text-muted-foreground">
//                             Did you know? Teaching kids about money early can increase their
//                             financial literacy by up to 70% as adults. While you&apos;re here,
//                             why not start their financial journey with Waya?
//                         </p>
//                     </div>
//                 </div>

//             </div>

//             {/* Decorative Wave Elements */}
//             <div className="absolute bottom-0 left-0 w-full -z-10 opacity-30">
//                 <div className="w-full h-auto">
//                     <Image
//                         src="/assets/wave-1.svg"
//                         width={3400}
//                         height={10}
//                         alt="Decorative wave pattern"
//                         className="w-full h-auto -rotate-[2deg]"
//                     />
//                 </div>
//             </div>
//         </div>
//     )
// }

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 pt-24 md:pt-32">
            <div className="container mx-auto max-w-6xl">

                {/* Main Content - Image and Text Side by Side */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 mb-12">

                    {/* Image Section */}
                    <div className="w-full lg:w-1/2 flex justify-center">
                        <div className="relative w-full max-w-md">
                            <Image
                                src="/assets/saving-money.svg"
                                alt="Page not found"
                                width={400}
                                height={400}
                                className="w-full h-auto dark:brightness-80 dark:contrast-80"
                            />
                        </div>
                    </div>

                    {/* Text Section */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">
                            404
                        </h1>

                        <h2 className="text-2xl md:text-4xl font-bold text-primary mb-4">
                            Oops! Page Not Found
                        </h2>

                        <p className="text-lg md:text-xl text-muted-foreground mb-8">
                            Looks like this page went on an adventure without us!
                            Don&apos;t worry, even the best money-smart kids sometimes take a wrong turn.
                            Let&apos;s get you back on track to building those financial superpowers!
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                            <Link href="/">
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-full">
                                    Go Home
                                </Button>
                            </Link>

                            <Link href="/contact">
                                <Button
                                    variant="outline"
                                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-3 px-8 rounded-full"
                                >
                                    Contact Support
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>{/* Helpful Links */}
                <div className="text-center">
                    <FadeInOld delay={0.7} direction="up">
                        <div className="mt-12">
                            <p className="text-muted-foreground mb-4">
                                Or try one of these popular pages:
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link
                                    href="/features"
                                    className="text-primary hover:text-primary/80 underline underline-offset-4"
                                >
                                    Features
                                </Link>
                                <Link
                                    href="/about"
                                    className="text-primary hover:text-primary/80 underline underline-offset-4"
                                >
                                    About Us
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="text-primary hover:text-primary/80 underline underline-offset-4"
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    href="/auth/signin"
                                    className="text-primary hover:text-primary/80 underline underline-offset-4"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </FadeInOld>

                    {/* Fun Money Fact */}
                    <FadeInOld delay={0.8} direction="up">
                        <div className="mt-16 p-6 bg-primary/5 rounded-lg border border-primary/20 max-w-2xl mx-auto">
                            <h3 className="text-lg font-semibold text-primary mb-2">
                                💡 Fun Money Fact!
                            </h3>
                            <p className="text-muted-foreground">
                                Did you know? Teaching kids about money early can increase their
                                financial literacy by up to 70% as adults. While you&apos;re here,
                                why not start their financial journey with Waya?
                            </p>
                        </div>
                    </FadeInOld>
                </div>

            </div>

            {/* Decorative Wave Elements */}
            <div className="absolute bottom-0 left-0 w-full -z-10 opacity-30">
                <div className="w-full h-auto">
                    <Image
                        src="/assets/wave-1.svg"
                        width={3400}
                        height={10}
                        alt="Decorative wave pattern"
                        className="w-full h-auto -rotate-[2deg]"
                    />
                </div>
            </div>
        </div>
    )
}
