import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { KidsPageHeaderProps } from './types';

export const KidsPageHeader = ({ onAddKid }: KidsPageHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Kids Management</h1>
                <p className="text-muted-foreground">Monitor and manage each of your kids&apos; progress</p>
            </div>
            <Button onClick={onAddKid}>
                <Plus className="h-4 w-4 mr-2" />
                Add Kid
            </Button>
        </div>
    );
};
