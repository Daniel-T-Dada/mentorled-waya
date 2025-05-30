import { ScaleIn } from "@/components/animations/scale-in"


const KidsPage = () => {
    return (
        <div className="flex flex-col w-full h-screen items-center justify-center">
            <section className="relative overflow-hidden text-center">
                <div className="container mx-auto p-20  text-primary font-bold animate-float-delayed">
                    <ScaleIn>
                        <h1 className="text-7xl mb-4 animate-bounce animate-delay-100">Kids Dashboard</h1>
                        <p className="text-4xl">🚧 Still under construction </p>
                    </ScaleIn>
                </div>
            </section>
        </div>
    )
}
export default KidsPage