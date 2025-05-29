import { ScaleIn } from "@/components/animations/scale-in"

const Contact = () => {
    return (
        <div className="flex flex-col w-full min-h-screen items-center justify-center">
            <section className="relative overflow-hidden text-center w-full">
                <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-8 sm:py-12 md:py-16 lg:py-20 text-[#500061] font-bold animate-float-delayed">
                    <ScaleIn>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-2 sm:mb-3 md:mb-4 animate-bounce animate-delay-100">Contact Us Page</h1>
                        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">🚧 Still under construction </p>
                    </ScaleIn>
                </div>
            </section>
        </div>
    )
}
export default Contact
