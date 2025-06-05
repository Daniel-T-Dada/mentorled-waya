'use client'

import KidMyChore from "./KidMyChore"

const KidChoreQuest = () => {
    return (
        <main>
            <div className="mb-6 flex items-center justify-between">
                <div className="">

                    <h2 className="text-xl font-semibold">My Chore</h2>
                    <p className="text-muted-foreground">View, complete your chore and gain reward.</p>
                </div>
                {/* <Button
                    className="bg-primary hover:bg-primary/90"
                
                >
                    Create kid&apos;s account

                </Button> */}

            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <KidMyChore />
            </div>

        </main>
    )
}
export default KidChoreQuest