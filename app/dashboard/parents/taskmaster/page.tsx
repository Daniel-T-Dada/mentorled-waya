import { ScaleIn } from "@/components/animations/scale-in"
import { SignOutButton } from "@/components/auth/signout-button"

const TaskMasterPage = () => {
    return (
        <div className="flex flex-col w-full h-screen items-center justify-center">
            <section className="relative overflow-hidden text-center">
                <div className="container mx-auto p-20 text-primary font-bold animate-float-delayed">
                    <ScaleIn>
                        <h1 className="text-7xl mb-4 animate-bounce animate-delay-100">Task Master</h1>
                        <p className="text-4xl mb-8">🚧 Still under construction </p>
                        <SignOutButton
                            variant="outline"
                            className="text-lg dark:text-foreground"
                            size="lg"
                        />
                    </ScaleIn>
                </div>
            </section>
        </div>
    )
}
export default TaskMasterPage