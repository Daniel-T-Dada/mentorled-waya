import { Button } from "@/components/ui/button";
import { Users, PlusCircle } from "lucide-react";

interface KidsActionButtonsProps {
    kidId: string;
    onAssignChore: (kidId: string) => void;
}

const KidsActionButtons = ({ kidId, onAssignChore }: KidsActionButtonsProps) => (
    <div className="flex gap-2 mt-4 xl:mt-4 md:mt-6">
        <Button
            variant="outline"
            className="flex-1 h-8 md:h-10 text-base"
            // View profile does nothing for now
            onClick={() => {}}
        >
            <Users className="mr-2 h-4 w-4 md:h-5 md:w-5" /> View Profile
        </Button>
        <Button
            className="flex-1 h-8 md:h-10 text-base"
            onClick={() => onAssignChore(kidId)}
        >
            <PlusCircle className="mr-2 h-4 w-4 md:h-5 md:w-5" /> Assign Chore
        </Button>
    </div>
);

export default KidsActionButtons;