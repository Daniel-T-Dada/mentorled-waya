
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

// interface EmptyStateProps {
//     onCreateKid?: () => void;
// }

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Kids Added Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
            {/* Start by adding your kids to track their chores and progress. */}
        </p>
        <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add First Kid
        </Button>
    </div>
);

export default EmptyState;