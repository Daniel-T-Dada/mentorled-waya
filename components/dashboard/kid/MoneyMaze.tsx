'use client'

import KidLearn from "./KidLearn"
import KidStartLevel from "./KidStartLevel"

const MoneyMaze = () => {
    return (
        <main>

            <div className="mb-6 flex items-center justify-between">
                <div className="">

                    <h2 className="text-xl font-semibold">Money Maze</h2>
                    <p className="text-muted-foreground">Learn Financial Concepts, Answer Financial Quiz and Earn Reward </p>
                </div>
                {/* <Button
                    className="bg-primary hover:bg-primary/90"
                
                >
                    Create kid&apos;s account

                </Button> */}

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 ">
                <div className="lg:col-span-3 ">
                    <KidStartLevel />
                </div>

                <div className="lg:col-span-3 ">
                    <KidLearn/>
                </div>
            </div>

        </main>
    )
}
export default MoneyMaze