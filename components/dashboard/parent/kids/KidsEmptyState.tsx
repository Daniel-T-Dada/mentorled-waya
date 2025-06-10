import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import type { KidsEmptyStateProps } from './types';

export const KidsEmptyState = ({ onAddKid }: KidsEmptyStateProps) => {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Users className="h-24 w-24 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No kids added yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
                Start by adding your first kid to begin tracking their chores and progress.
            </p>
            <Button onClick={onAddKid}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Kid
            </Button>
        </div>
    );
};
